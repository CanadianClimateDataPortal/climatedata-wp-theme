import { sprintf } from '@wordpress/i18n';
import { S2D_FORECAST_CONVENTIONAL_NB_PERIODS } from '@/lib/constants';
import {
	ClimateVariableInterface,
	ForecastType,
	ForecastTypes,
	FrequencyType,
	S2DFrequencyType,
	S2DFrequencyTypes,
} from '@/types/climate-variable-interface';
import type {
	ProgressBarProps,
} from '@/types/progress-bar';
import { formatUTCDate, utc } from '@/lib/utils';
import { formatIntlDate } from '@/lib/format';
import { __ } from '@/context/locale-provider';

import { assertIsS2DFrequencyType } from '@/types/assertions';

export type PeriodRange = [Date, Date];

/**
 * Location-specific S2D forecast data from the API.
 *
 * Cutoffs are raw values in the variable's unit (°C, mm/day).
 * Probabilities are 0–100 percentages.
 */
export interface LocationS2DData {
	/** 20th percentile cutoff, e.g. `5.0` → "< 5.0 °C" */
	cutoff_unusually_low_p20: number;
	/** 33rd percentile cutoff, e.g. `1.8` → "Below 1.8 °C" */
	cutoff_below_normal_p33: number;
	historical_median_p50: number;
	/** 66th percentile cutoff, e.g. `5.3` → "Above 5.3 °C" */
	cutoff_above_normal_p66: number;
	/** 80th percentile cutoff, e.g. `6.9` → "> 6.9 °C" */
	cutoff_unusually_high_p80: number;
	/** 0–100, e.g. `4` → "4% probability of being unusually low" */
	prob_unusually_low: number;
	/** 0–100, e.g. `37` → "37% probability of being below normal" */
	prob_below_normal: number;
	/** 0–100, e.g. `38` → "38% probability of being near normal" */
	prob_near_normal: number;
	/** 0–100, e.g. `26` → "26% probability of being above normal" */
	prob_above_normal: number;
	/** 0–100, e.g. `5` → "5% probability of being unusually high" */
	prob_unusually_high: number;
	skill_level: number;
	skill_CRPSS: number;
}

type PeriodJumpUnit = 'month' | 'year';

/**
 * Resolve the span of one period for a frequency.
 *
 * The returned jump is used by `getPeriodEnd` to calculate the period's inclusive
 * end boundary. It is distinct from `nbPeriods`, which controls how many `[start, end]`
 * tuples `getPeriods` returns, and from the step used to start the next tuple.
 *
 * @param frequency - The frequency whose period span should be resolved.
 * @param throws - If true, the function will throw an error for unsupported frequencies; otherwise, it returns null.
 *
 * @returns A tuple containing the jump size and unit, such as `[3, 'month']` for seasonal frequency.
 * @throws An error if the frequency type is not supported.
 */
export const resolveFrequencyPeriodJump = (
	frequency: S2DFrequencyType,
	throws: boolean = true,
): [number, PeriodJumpUnit] | null => {
	let periodJumpSize = 1;
	let periodJumpSizeUnit: PeriodJumpUnit = 'month';
	if (frequency === S2DFrequencyTypes.SEASONAL) {
		// Because a season is 3 months long.
		periodJumpSize = 3;
	} else if (isFrequencyTypeS2DDecadal(frequency)) {
		periodJumpSizeUnit = 'year';
		periodJumpSize = 5;
	} else if (frequency === S2DFrequencyTypes.MONTHLY) {
		periodJumpSize = 1;
	} else {
		if (!throws) {
			return null;
		}
		throw new Error(
			sprintf(
				__('Unsupported frequency type: %s'),
				frequency
			)
		);
	}

	return [
		periodJumpSize,
		periodJumpSizeUnit,
	];
};


/**
 * Calculate the inclusive end date for a period starting at `periodStart`.
 *
 * @param periodStart - The first day of the period.
 * @param frequency - The frequency that determines the period length.
 * @returns The last day of the period.
 */
const getPeriodEnd = (
	periodStart: Date,
	frequency: S2DFrequencyType,
): Date => {
	const jump = resolveFrequencyPeriodJump(frequency, false);
	const [
		periodJumpSize,
		periodJumpSizeUnit,
	] = jump ?? [1, 'month'];
	const periodEnd = new Date(periodStart);
	if (periodJumpSizeUnit === 'year') {
		periodEnd.setUTCFullYear(periodStart.getUTCFullYear() + periodJumpSize);
	} else {
		periodEnd.setUTCMonth(periodStart.getUTCMonth() + periodJumpSize);
	}
	periodEnd.setUTCDate(0);
	return periodEnd;
};


/**
 * Return the time periods for a release date and specific frequency.
 *
 * The number and length of time periods depend on the frequency:
 * - Seasonal frequency: 10 x 3-month periods, at 1-month interval
 * - Monthly frequency: 3 x 1-month periods, at 1-month interval
 * - Decadal frequency: 2 x 5-year periods, at 5-year interval
 *
 * The first period starts on the same month as the release date. A period start
 * is always the first day of the month, and a period end is always the last
 * day of the month.
 *
 * All dates are in UTC time.
 *
 * @see {@link S2D_FORECAST_CONVENTIONAL_NB_PERIODS} for the number of periods per frequency.
 *
 * @example
 * ```typescript
 * const releaseDate = new Date('2025-10-15');
 * const periods = getPeriods(releaseDate, S2DFrequencyTypes.MONTHLY);
 * // Returned periods are (as array of Date instances): [
 * //   [2025-10-01, 2025-10-31]
 * //   [2025-11-01, 2025-11-30]
 * //   [2025-12-01, 2025-12-31]
 * // ]
 * ```
 *
 * @param releaseDate - The release date of the data.
 * @param frequency - The frequency for which to get the periods.
 * @returns An array of [start, end] date instances for each period.
 */
export const getPeriods = (
	releaseDate: Date,
	frequency: S2DFrequencyType,
): PeriodRange[] => {
	// nbPeriods: In other words; how long the list will be
	const nbPeriods = S2D_FORECAST_CONVENTIONAL_NB_PERIODS[frequency];
	const periods: PeriodRange[] = [];
	const lastPeriod = new Date(
		// Set to the first day of the month
		Date.UTC(releaseDate.getUTCFullYear(), releaseDate.getUTCMonth(), 1)
	);

	try {
		// Asked to throw, so the null branch of the return type cannot happen here.
		const jump = resolveFrequencyPeriodJump(frequency, true) as [number, PeriodJumpUnit];
		const [
			periodJumpSize,
			periodJumpSizeUnit,
		] = jump;
		for (let i = 0; i < nbPeriods; i++) {
			const periodStart = new Date(lastPeriod);
			const periodEnd = getPeriodEnd(periodStart, frequency);
			periods.push([periodStart, periodEnd]);
			if (periodJumpSizeUnit === 'month') {
				// A sliding window: each period starts one month after the previous
				// one, whatever its own length, so seasonal periods overlap.
				lastPeriod.setUTCMonth(lastPeriod.getUTCMonth() + 1);
			} else {
				// Decadal periods must not overlap, so the next one starts where the
				// previous one ended.
				lastPeriod.setUTCFullYear(lastPeriod.getUTCFullYear() + periodJumpSize);
			}
		}
	} catch {
		// An unsupported frequency yields no periods at all, rather than a
		// partially built list callers would have to second-guess.
	}


	return periods;
};

/**
 * Find the index of the period range that matches a string date range.
 *
 * A date range is an array of exactly two strings representing a date, in UTC
 * time. Each string must be of the form 'YYYY-MM-DD'. The date range is
 * generally created from the `dateRange` URL parameter.
 *
 * To find the matching period, only the first date of the date range is used.
 *
 * @param dateRange - The date range to search for. An array of exactly two
 *   strings.
 * @param availablePeriods - The period ranges to search in.
 * @returns - The index of the period range that matches the date range, or
 *   null if not found.
 */
export function findPeriodIndexForDateRange(
	dateRange: [string, string],
	availablePeriods: PeriodRange[]
): number | null {
	const rangeStart = utc(dateRange[0]);

	if (rangeStart === null) {
		return null;
	}

	const foundIndex = availablePeriods.findIndex(
		(period) => rangeStart.toDateString() === period[0].toDateString()
	);

	return foundIndex === -1 ? null : foundIndex;
}

/**
 * Transform a period range (Date instances) to a date range (strings).
 *
 * A date range is two strings representing dates in UTC time. The strings are
 * of the form 'YYYY-MM-DD'.
 *
 * @param periodRange - The period range to transform.
 * @param dateFormat - The format to use for the date strings.
 * @returns - The date range as an array of two dates in string.
 */
export const formatPeriodRange = (
	periodRange: PeriodRange,
	dateFormat = 'yyyy-MM-dd',
): [string, string] => {
	const rangeStart = formatUTCDate(periodRange[0], dateFormat);
	const rangeEnd = formatUTCDate(periodRange[1], dateFormat);

	return [rangeStart, rangeEnd];
};

/**
 * Create and return the GeoServer layer name for the Skill layer.
 *
 * "Skill" in meteorology refers to forecast accuracy relative to a baseline
 * (e.g., climatology). The skill layer is a vector mask overlay showing
 * diagonal lines over regions where forecast confidence is low.
 *
 * The name is `CDC:s2d-skill-<VAR>-<F>-<REF-PERIOD>`
 *
 * Where:
 * - <VAR>: the variable ID (without the "s2d_" prefix)
 * - <F>: the frequency (e.g. "seasonal" or "monthly")
 * - <REF-PERIOD>: The period relative to which we want to know the skill (e.g.
 *     "01" to get the skill layer calculated for a reference period of January)
 *
 * @param climateVariable
 * @param releaseDate
 */
export function buildSkillLayerName(
	climateVariable: ClimateVariableInterface,
	releaseDate: Date
): string | null {

	const frequencyNameMap: Record<string, string> = {
		[S2DFrequencyTypes.SEASONAL]: 'seasonal',
		[S2DFrequencyTypes.MONTHLY]: 'monthly',
		[S2DFrequencyTypes.DECADAL_ANNUAL]: S2DFrequencyTypes.DECADAL_ANNUAL,
		[S2DFrequencyTypes.DECADAL_MAY_SEP]: S2DFrequencyTypes.DECADAL_MAY_SEP,
		[S2DFrequencyTypes.DECADAL_NOV_MAR]: S2DFrequencyTypes.DECADAL_NOV_MAR,
	}

	let variableId = climateVariable.getId();
	const variableFrequency = climateVariable.getFrequency() ?? '';
	const frequency = frequencyNameMap[variableFrequency];
	const referencePeriod = String(releaseDate.getUTCMonth() + 1).padStart(2, '0');

	if (!frequency) {
		return null;
	}

	// Trim the "s2d_" prefix from the variable ID if it exists.
	if (variableId.startsWith('s2d_')) {
		variableId = variableId.slice(4);
	}

	return `CDC:s2d-skill-${variableId}-${frequency}-${referencePeriod}`;
}

/**
 * Create and return the TIME attribute for the Skill GeoServer layer.
 *
 * The TIME is determined by the start of the variable's selected date range.
 *
 * But it's always *relative* to the year 1991 (the skill is year-agnostic, so
 * it's based on the base year of 1991). This "relativity" is determined
 * by the release date: if the date is in the same year as the release date,
 * then 1991 will be used, if the date is the year after, then 1992 will be
 * used, etc.
 *
 * @param climateVariable - The variable containing the selected date range.
 * @param releaseDate - The release date to calculate the relative year.
 * @returns - The TIME attribute for the Skill layer in the format
 *     'YYYY-MM-DDT00:00:00Z'. Null is returned if the variable doesn't have a
 *     date range.
 */
export function buildSkillLayerTime(
	climateVariable: ClimateVariableInterface,
	releaseDate: Date,
): string | null {
	const dateRange = climateVariable.getDateRange();

	if (!dateRange) {
		return null;
	}

	const periodStart = utc(dateRange[0]);

	if (!periodStart) {
		return null;
	}

	const yearDiff = periodStart.getUTCFullYear() - releaseDate.getUTCFullYear();
	const layerDate = new Date(Date.UTC(
		1991 + yearDiff,
		periodStart.getUTCMonth(),
		1,
	));
	return formatUTCDate(layerDate, "yyyy-MM-dd'T00:00:00Z'");
}

/**
 * Return the translated display name for a S2D forecast type.
 *
 * @param forecastType - The forecast type to translate.
 */
export function getForecastTypeName(forecastType: ForecastType): string {
	const nameMap = {
		[ForecastTypes.EXPECTED]: __('Expected Conditions'),
		[ForecastTypes.UNUSUAL]: __('Unusual Conditions'),
	};

	return nameMap[forecastType] ?? (forecastType as string);
}

/**
 * The translated labels for the S2D skill levels, indexed by the skill level value (0–3).
 */
export const S2D_SKILL_LEVEL_LABELS = [
	__('No skill'),
	__('Low'),
	__('Medium'),
	__('High'),
];

/**
 * Map S2D variable IDs to their corresponding filename components.
 */
export const S2D_DOWNLOAD_FILENAME_MAP_VARIABLE_ID: Record<string, string> = {
	s2d_air_temp: 'MeanTemp',
	s2d_precip_accum: 'TotalPrecip',
};

/**
 * Map S2D forecast types to filename component values.
 */
export const S2D_DOWNLOAD_FILENAME_MAP_FORECAST_TYPE: Record<
	ForecastType,
	string
>  = {
	[ForecastTypes.EXPECTED]: 'ExpectedCond',
	[ForecastTypes.UNUSUAL]: 'UnusualCond',
};

/**
 * Map S2D frequency types to filename component values.
 */
export const S2D_DOWNLOAD_FILENAME_MAP_FREQUENCY_TYPE: Record<
	S2DFrequencyType,
	string
> = {
	[S2DFrequencyTypes.MONTHLY]: 'Monthly',
	[S2DFrequencyTypes.SEASONAL]: 'Seasonal',
	[S2DFrequencyTypes.DECADAL_ANNUAL]: 'DecadalAnnual',   // @TODO Confirm what would be the string to be used for download filename.
	[S2DFrequencyTypes.DECADAL_MAY_SEP]: 'DecadalMaySep',  // ^
	[S2DFrequencyTypes.DECADAL_NOV_MAR]: 'DecadalNovMar',  // ^
};

/**
 * Narrow an unknown frequency to one an S2D variable accepts.
 */
export const isFrequencyTypeS2D = (
	frequencyType?: FrequencyType | S2DFrequencyType | string | null,
): frequencyType is S2DFrequencyType => {
	let outcome = false;
	try {
		assertIsS2DFrequencyType(frequencyType ?? '');
		outcome = true;
	} catch {
		outcome = false;
	}

	return outcome;
};

/**
 * Tell whether a frequency is one of the decadal ones.
 *
 * The test is the `decadal-` prefix shared by every decadal slug, so a fourth
 * one can be added to `S2DFrequencyTypes` without editing any caller of this.
 */
export const isFrequencyTypeS2DDecadal = (
	frequencyType?: S2DFrequencyType | string | null,
): frequencyType is S2DFrequencyType => {
	if (isFrequencyTypeS2D(frequencyType)) {
		return /^decadal-/.test(frequencyType);
	}

	return false;
};

/**
 * Convert an S2D climate variable's id to the one to use in S2D API requests.
 *
 * @param variableId - The variable id used in the app, e.g. `"s2d_air_temp"`.
 * @returns The variable id to use for S2D API requests, e.g. `"air_temp"`.
 */
export function normalizeForApiVariableId(variableId: string): string {
	// For now, the only difference between the app's variable ids and the ones
	// used in the API is simply a prefix.
	return variableId.replace(/^s2d_/, '');
}

/**
 * Convert an S2D frequency type to the one to use in S2D API requests.
 *
 * @param frequency - The frequency, e.g. `S2DFrequencyTypes.SEASONAL`.
 * @returns The frequency name to use for S2D API requests, e.g. `"seasonal"`
 */
export function normalizeForApiFrequencyName(
	frequency: S2DFrequencyType | string
): string {
	const frequencyNameMap: Record<string, string> = {
		[S2DFrequencyTypes.SEASONAL]: 'seasonal',
		[S2DFrequencyTypes.MONTHLY]: 'monthly',
		[S2DFrequencyTypes.DECADAL_ANNUAL]: S2DFrequencyTypes.DECADAL_ANNUAL,
		[S2DFrequencyTypes.DECADAL_MAY_SEP]: S2DFrequencyTypes.DECADAL_MAY_SEP,
		[S2DFrequencyTypes.DECADAL_NOV_MAR]: S2DFrequencyTypes.DECADAL_NOV_MAR,
	};

	return frequencyNameMap[frequency] ?? frequency;
}

/**
 * The extracted S2D filename components from a climate variable that's based on
 * internal IDs into human relatable strings.
 */
export interface ExtractS2DDownloadStepFilenameComponent {
	/**
	 * The filename component used to represent the climate variable.
	 * @see {@link S2D_DOWNLOAD_FILENAME_MAP_VARIABLE_ID}
	 */
	variableId: string;
	/**
	 * The filename component used to describe the forecast type.
	 * @see {@link S2D_DOWNLOAD_FILENAME_MAP_FORECAST_TYPE}
	 */
	forecastType: string;
	/**
	 * The filename component used to describe the frequency.
	 * @see {@link S2D_DOWNLOAD_FILENAME_MAP_FREQUENCY_TYPE}
	 */
	frequencyType: string;
}

/**
 * Extract and map S2D filename components from a climate variable.
 *
 * @param climateVariable - The S2D climate variable instance. Must have the
 *     frequency and forecast type set.
 * @returns Object containing mapped variable name, forecast type, and frequency
 *     for filename use.
 */
export const extractS2DDownloadStepFilenameComponents = (
	climateVariable: ClimateVariableInterface,
): ExtractS2DDownloadStepFilenameComponent => {
	const climateVariableId = climateVariable.getId();
	const forecastTypeRaw = climateVariable.getForecastType() as ForecastType;
	const frequencyTypeRaw = climateVariable.getFrequency() as S2DFrequencyType;

	if (!forecastTypeRaw || !frequencyTypeRaw) {
		throw new TypeError(
			'climateVariable must have the forecast type and frequency set.'
		);
	}

	const variableId =
		S2D_DOWNLOAD_FILENAME_MAP_VARIABLE_ID[climateVariableId] ??
		climateVariableId;

	const forecastType =
		S2D_DOWNLOAD_FILENAME_MAP_FORECAST_TYPE[forecastTypeRaw] ??
		forecastTypeRaw;

	const frequencyType =
		S2D_DOWNLOAD_FILENAME_MAP_FREQUENCY_TYPE[frequencyTypeRaw] ??
		frequencyTypeRaw;

	return {
		variableId,
		forecastType,
		frequencyType,
	};
};

export interface SkillLevelData {
	skillLevel: number | null;
	skillCRPSS: number | null;
	skillLevelLabel: string;
}

export const extractSkillLevelData = (
	locationData: LocationS2DData | null,
): SkillLevelData => {
	const skillLevel = locationData?.skill_level;
	const skillCRPSS = locationData?.skill_CRPSS;

	const skillLevelLabel = typeof skillLevel !== 'number' ? null : S2D_SKILL_LEVEL_LABELS[skillLevel];

	const output: SkillLevelData = {
		skillLevel: skillLevel ?? null,
		skillCRPSS: skillCRPSS ?? null,
		skillLevelLabel: skillLevelLabel ?? S2D_SKILL_LEVEL_LABELS[0],
	};

	return output;
};

/**
 * Generate a period range label for a given date range and frequency.
 *
 * @param dateRangeStart - Start date of the period. Example: 2025-08-01
 * @param frequency - Frequency type
 * @param locale - Locale to use for formatting
 */
export const generatePeriodRangeLabel = (
	dateRangeStart: string,
	frequency: S2DFrequencyType,
	locale: string
): string | null => {
	const periodStart = utc(dateRangeStart);

	const isDecadalFrequencyType = isFrequencyTypeS2DDecadal(frequency);

	if (!periodStart) {
		return null;
	}

	const periodStartLabel = isDecadalFrequencyType
		? formatIntlDate(periodStart, locale, { year: 'numeric' })
		: formatIntlDate(periodStart, locale, { month: 'long' });

	if (frequency === FrequencyType.MONTHLY) {
		return periodStartLabel;
	}

	const periodEnd = getPeriodEnd(periodStart, frequency);
	const periodEndLabel = isDecadalFrequencyType
		? formatIntlDate(periodEnd, locale, { year: 'numeric' })
		: formatIntlDate(periodEnd, locale, { month: 'long' });

	return sprintf(__('%s to %s'), periodStartLabel, periodEndLabel);
};

/**
 * The way we represent the percent value and cutoff whether its value is one of the probabilities defined by the cutoffs.
 * The method of trimming decimal values to determine if the value is part of the cutoff.
 *
 * @see {@link LocationS2DData} for the cutoffs and probabilities values.
 * @see {@link getProbabilityColour} for how the normalized percent value is used to determine the colour of the probability bar.
 */
export const normalizeProbabilitiesBarChartPercent = (
	input: Pick<ProgressBarProps, 'percent'>,
): number => {
	return Math.round(input.percent);
};
