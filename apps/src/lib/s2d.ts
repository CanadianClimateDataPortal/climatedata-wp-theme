import { S2D_NB_PERIODS } from '@/lib/constants';
import {
	ClimateVariableInterface,
	ForecastType,
	ForecastTypes,
	FrequencyType,
	FrequencyTypes,
	S2DFrequencyType,
} from '@/types/climate-variable-interface';
import { formatUTCDate, utc } from '@/lib/utils';
import { __ } from '@/context/locale-provider';
import { PreconditionError } from './errors';

export type PeriodRange = [Date, Date];

export interface LocationS2DData {
	cutoff_unusually_low_p20: number;
	cutoff_below_normal_p33: number;
	historical_median_p50: number;
	cutoff_above_normal_p66: number;
	cutoff_unusually_high_p80: number;
	prob_unusually_low: number;
	prob_below_normal: number;
	prob_near_normal: number;
	prob_above_normal: number;
	prob_unusually_high: number;
	skill_level: number;
	skill_CRPSS: number;
}

/**
 * For a period start return the end date of the period based on the frequency.
 *
 * For "monthly" frequency, the period end is the end of the same month.
 * For "seasonal", the period end is the end of the 3rd following month.
 *
 * @param periodStart - The date representing the start of the period
 * @param frequency - The frequency for which we want the period end
 * @returns - The date for the end of the period
 */
export function getPeriodEnd(
	periodStart: Date,
	frequency: FrequencyType
): Date {
	const periodLength = frequency === FrequencyType.SEASONAL ? 3 : 1;
	const periodEnd = new Date(periodStart);
	periodEnd.setUTCMonth(periodStart.getUTCMonth() + periodLength);
	periodEnd.setUTCDate(0);
	return periodEnd;
}

/**
 * Return the time periods for a release date and specific frequency.
 *
 * The number and length of time periods depend on the frequency:
 * - Seasonal frequency: 10 x 3-month periods, at 1-month interval
 * - Monthly frequency: 3 x 1-month periods, at 1-month interval
 *
 * The first period starts on the same month as the release date. A period start
 * is always the first day of the month, and a period end is always the last
 * day of the month.
 *
 * All dates are in UTC time.
 *
 * @example
 * ```typescript
 * const releaseDate = new Date('2025-10-15');
 * const periods = getPeriods(releaseDate, FrequencyType.MONTHLY);
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
export function getPeriods(
	releaseDate: Date,
	frequency: S2DFrequencyType,
): PeriodRange[] {
	const nbPeriods = S2D_NB_PERIODS[frequency];
	const periodInterval = 1; // Periods are 1 month apart
	const periods: [Date, Date][] = [];
	const lastPeriod = new Date(
		// Set to the first day of the month
		Date.UTC(releaseDate.getUTCFullYear(), releaseDate.getUTCMonth(), 1)
	);

	for (let i = 0; i < nbPeriods; i++) {
		const periodStart = new Date(lastPeriod);
		const periodEnd = getPeriodEnd(periodStart, frequency);

		periods.push([periodStart, periodEnd]);

		lastPeriod.setUTCMonth(lastPeriod.getUTCMonth() + periodInterval);
	}

	return periods;
}

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
 * @returns - The date range as an array of two dates in string.
 */
export function formatPeriodRange(periodRange: PeriodRange): [string, string] {
	const dateFormat = 'yyyy-MM-dd';
	const rangeStart = formatUTCDate(periodRange[0], dateFormat);
	const rangeEnd = formatUTCDate(periodRange[1], dateFormat);

	return [rangeStart, rangeEnd];
}

/**
 * Create and return the GeoServer layer name for the Skill layer.
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
		[FrequencyType.SEASONAL]: 'seasonal',
		[FrequencyType.MONTHLY]: 'monthly',
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
	return formatUTCDate(layerDate, 'yyyy-MM-dd');
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
 * Map S2D variable IDs to their corresponding filename components.
 *
 * @remark
 * The keys are the Backend API variable IDs (without the "s2d_" prefix we use on the FrontEnd),
 * and the values are the corresponding filename components for S2D data files.
 *
 * @see {@link normalizeForApiVariableId}
 */
export const S2D_DOWNLOAD_FILENAME_MAP_VARIABLE_ID: Record<string, string> = {
	air_temp: 'MeanTemp',
	precip_accum: 'TotalPrecip',
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
	[FrequencyTypes.MONTHLY]: 'Monthly',
	[FrequencyTypes.SEASONAL]: 'Seasonal',
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
 * @param frequency - The frequency, e.g. `FrequencyType.SEASONAL`.
 * @returns The frequency name to use for S2D API requests, e.g. `"seasonal"`
 */
export function normalizeForApiFrequencyName(
	frequency: S2DFrequencyType | string
): string {
	const frequencyNameMap: Record<string, string> = {
		[FrequencyType.SEASONAL]: 'seasonal',
		[FrequencyType.MONTHLY]: 'monthly',
	};

	return frequencyNameMap[frequency] ?? frequency;
}

/**
 * The extracted S2D filename components from a climate
 * variable that's based on internal IDs into human relatable strings.
 */
export interface ExtractS2DDownloadStepFilenameComponent {
	/**
	 * The filename component used to represent the climate variable.
	 * @see {@link S2D_DOWNLOAD_FILENAME_MAP_VARIABLE_ID}
	 */
	variableId: string;
	/**
	 * The filename componnent used to describe forecast type.
	 * @see {@link S2D_DOWNLOAD_FILENAME_MAP_FORECAST_TYPE}
	 */
	forecastType: string;
	/**
	 * The filename component used to describe frequency.
	 * @see {@link S2D_DOWNLOAD_FILENAME_MAP_FREQUENCY_TYPE}
	 */
	frequencyType: string;
}

/**
 * Extract and map S2D filename components from a climate variable.
 *
 * @param climateVariable - The S2D climate variable instance.
 * @returns Object containing mapped variable name, forecast type, and frequency for filename use.
 */
export const extractS2DDownloadStepFilenameComponents = (
	climateVariable: Pick<
		ClimateVariableInterface,
		'getId' | 'getForecastType' | 'getFrequency'
	>
): ExtractS2DDownloadStepFilenameComponent => {
	const variableIdRaw = climateVariable.getId() ?? '';
	const forecastTypeRaw = climateVariable.getForecastType() as ForecastType;
	const frequencyTypeRaw = climateVariable.getFrequency() as S2DFrequencyType;

	if (variableIdRaw === '' || !forecastTypeRaw || !frequencyTypeRaw) {
		throw new PreconditionError(
			'We are expecting to have valid value for ClimateVariableInterface for methods: ' +
				'getId, getForecastType and getFrequency.'
		);
	}

	const climateVariableId = normalizeForApiVariableId(variableIdRaw);

	const variableId =
		S2D_DOWNLOAD_FILENAME_MAP_VARIABLE_ID[climateVariableId] ??
		climateVariableId;

	const forecastType =
		S2D_DOWNLOAD_FILENAME_MAP_FORECAST_TYPE[forecastTypeRaw] ??
		forecastTypeRaw;

	const frequencyType =
		S2D_DOWNLOAD_FILENAME_MAP_FREQUENCY_TYPE[frequencyTypeRaw] ??
		frequencyTypeRaw;

	const out: ExtractS2DDownloadStepFilenameComponent = {
		variableId,
		forecastType,
		frequencyType,
	};
	return out;
};
