import {
	ClimateVariableInterface,
	ForecastType,
	ForecastTypes,
	S2DFrequencyType,
	S2DFrequencyTypes,
} from '@/types/climate-variable-interface';
import { formatUTCDate, utc } from '@/lib/utils';
import { __ } from '@/context/locale-provider';

import type {
	ExtractS2DDownloadStepFilenameComponent,
	LocationS2DData,
	SkillLevelData,
} from './types';

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

