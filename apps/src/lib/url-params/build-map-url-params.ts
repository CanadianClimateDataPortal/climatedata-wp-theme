import { ClimateVariables } from '@/config/climate-variables.config';
import type {
	ClimateVariableConfigInterface,
} from '@/types/climate-variable-interface';
import type {
	MapCoordinates,
	MapItemsOpacity,
	TaxonomyData,
} from '@/types/types';
import { URL_PARAMS } from './param-names';

/**
 * The slice values the Map URL query is serialized from.
 *
 * These are exactly the pieces of Redux state the Map url-sync hook reads when
 * it writes the URL. Passing them in (instead of reading the store here) keeps
 * this builder a pure function of its inputs, so both url-sync and the language
 * switcher can call it and can never drift.
 */
export interface MapUrlParamsInput {
	climateVariable: ClimateVariableConfigInterface;
	dataset: TaxonomyData | null | undefined;
	opacity: MapItemsOpacity | null | undefined;
	mapCoordinates: MapCoordinates | null | undefined;
	isLowSkillVisible: boolean;
}

/**
 * Save a climate variable configuration in a URL parameter list.
 *
 * No existing parameters are removed. If a value is equal to a default value,
 * no parameter is added.
 *
 * @param params - URL parameters to augment.
 * @param climateData - Configuration to save into the parameters.
 * @param defaultConfig - Default values of the configuration.
 */
const addClimateVariableParamsToUrl = (
	params: URLSearchParams,
	climateData: ClimateVariableConfigInterface,
	defaultConfig: ClimateVariableConfigInterface | null,
): void => {
	// Always include variable ID
	if (climateData.id) {
		params.set(URL_PARAMS.VARIABLE_ID, climateData.id);
	}

	// Only add threshold if the variable supports thresholds AND has a value
	if (climateData.threshold &&
		(defaultConfig?.thresholds || defaultConfig?.threshold)) {
		params.set(URL_PARAMS.THRESHOLD, climateData.threshold.toString());
	}

	if (climateData.scenario) {
		params.set(URL_PARAMS.SCENARIO, climateData.scenario);
	}

	// Only include scenario comparison parameters if enabled
	if (climateData.scenarioCompare === true) {
		params.set(URL_PARAMS.DO_COMPARE, '1');

		if (climateData.scenarioCompareTo) {
			params.set(URL_PARAMS.COMPARE_TO, climateData.scenarioCompareTo);
		}
	}

	// Add date range
	if (climateData.dateRange &&
		climateData.dateRange.length > 0) {
		const defaultDateRange = defaultConfig?.dateRange;
		const currentDateRangeStr = climateData.dateRange.join(',');
		const defaultDateRangeStr = defaultDateRange?.join(',');

		if (currentDateRangeStr !== defaultDateRangeStr) {
			params.set(URL_PARAMS.DATE_RANGE, currentDateRangeStr);
		}
	}

	// List of configurations that are simply saved as is in the params if
	// their value is different from their default value
	const simpleConfigurations: [keyof ClimateVariableConfigInterface, string][] = [
		['forecastType', URL_PARAMS.FORECAST_TYPE],
		['forecastDisplay', URL_PARAMS.FORECAST_DISPLAY],
		['interactiveRegion', URL_PARAMS.INTERACTIVE_REGION],
		['dataValue', URL_PARAMS.DATA_VALUE],
		['colourScheme', URL_PARAMS.COLOUR_SCHEME],
		['colourType', URL_PARAMS.COLOUR_TYPE],
		['averagingType', URL_PARAMS.AVERAGING_TYPE],
		['version', URL_PARAMS.VERSION],
		['frequency', URL_PARAMS.FREQUENCY],
	];

	for (const [configKey, urlParam] of simpleConfigurations) {
		const defaultValue = defaultConfig?.[configKey];
		const currentValue = climateData[configKey];
		if (currentValue != undefined && currentValue !== defaultValue) {
			params.set(urlParam, currentValue.toString());
		}
	}
};

/**
 * Save in a URL parameter list the Map-only elements of the store (dataset,
 * opacity, coordinates, low-skill mask).
 *
 * No existing parameters are removed.
 *
 * @param params - URL parameters to augment.
 * @param input - Map slice values to serialize.
 */
const addMapOnlyParamsToUrl = (
	params: URLSearchParams,
	input: MapUrlParamsInput,
): void => {
	const {
		dataset,
		opacity,
		mapCoordinates,
		isLowSkillVisible,
	} = input;

	// Dataset
	if (dataset && dataset.term_id) {
		params.set(URL_PARAMS.DATASET, dataset.term_id.toString());
	}

	// Opacity
	if (opacity) {
		if (opacity.mapData !== undefined) {
			const urlOpacityValue = Math.round(opacity.mapData * 100);
			params.set(URL_PARAMS.DATA_OPACITY, urlOpacityValue.toString());
		}

		if (opacity.labels !== undefined) {
			const urlOpacityValue = Math.round(opacity.labels * 100);
			params.set(URL_PARAMS.LABEL_OPACITY, urlOpacityValue.toString());
		}
	}

	if (mapCoordinates) {
		params.set(URL_PARAMS.LATITUDE, mapCoordinates.lat.toFixed(5));
		params.set(URL_PARAMS.LONGITUDE, mapCoordinates.lng.toFixed(5));
		params.set(URL_PARAMS.ZOOM_LEVEL, mapCoordinates.zoom.toString());
	}

	if (isLowSkillVisible === false) {
		params.set(URL_PARAMS.LOW_SKILL_MASKED, '0');
	}
};

/**
 * Build the full Map URL query from the given slice values.
 *
 * Pure: the returned `URLSearchParams` is exactly what the Map url-sync hook
 * would write for the same state. Consumed by `use-url-sync.ts` (writer) and by
 * the language switcher's `selectMapUrlSearch` selector (reader) — one
 * serialization, two call sites.
 *
 * @param input - Map slice values to serialize.
 * @returns URL parameters, without a leading `?`.
 */
export const buildMapUrlParams = (
	input: MapUrlParamsInput,
): URLSearchParams => {
	const params = new URLSearchParams();

	const defaultConfig = input.climateVariable.id
		? ClimateVariables.find(
			(config) => config.id === input.climateVariable.id,
		) ?? null
		: null;

	addClimateVariableParamsToUrl(params, input.climateVariable, defaultConfig);
	addMapOnlyParamsToUrl(params, input);

	return params;
};
