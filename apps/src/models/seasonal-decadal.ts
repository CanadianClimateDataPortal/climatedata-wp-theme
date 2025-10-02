import { __ } from '@/context/locale-provider';

const VALUES_VAR = [
	['air_temp', __('Temperature')],
	['precipitation', __('Precipitation')],
] as const;

/**
 * Type representing the valid variable identifiers for seasonal/decadal data.
 *
 * @see VALUES_MAP_VAR for the source array of valid values.
 */
export type S2DParamVar = (typeof VALUES_VAR)[number][0];

export type S2DParamMapVar = ReadonlyMap<S2DParamVar, string>;

/**
 * The variable’s identificator
 *
 * currently:
 * - air_temp
 * - precipitation
 */
export const VALUES_MAP_VAR: S2DParamMapVar = new Map([...VALUES_VAR]);

const DEFAULT_VALUE_VAR = VALUES_VAR[0][0];

// --------------------

const VALUES_FREQ = [
	['monthly', __('Monthly')],
	['seasonal', __('Seasonal (3 months)')],
	['decadal', __('Decadal (5 years)')],
] as const;

/**
 * Type representing the valid variable identifiers for seasonal/decadal data.
 *
 * @see VALUES_MAP_FREQ for the source array of valid values.
 */
export type S2DParamFreq = (typeof VALUES_FREQ)[number][0];

export type S2DParamMapFreq = ReadonlyMap<S2DParamFreq, string>;

/**
 * The variable’s frequency
 *
 * values:
 * - monthly
 * - seasonal
 * - decadal
 */
export const VALUES_MAP_FREQ: S2DParamMapFreq = new Map(VALUES_FREQ);

const DEFAULT_VALUE_FREQ = VALUES_FREQ[0][0];

// --------------------

const VALUES_FORECAST_TYPE = [
	['expected_conditions', __('Expected Conditions')],
	['unusual_conditions', __('Unusual Conditions')],
] as const;

/**
 * Type representing the valid forecast type identifiers for seasonal/decadal data.
 *
 * @see VALUES_MAP_FORECAST_TYPE for the source array of valid values.
 */
export type S2DParamForecastType = (typeof VALUES_FORECAST_TYPE)[number][0];

export type S2DParamMapForecastType = ReadonlyMap<S2DParamForecastType, string>;

/**
 * Possible forecast types:
 * - expected_conditions
 * - unusual_conditions
 */
export const VALUES_MAP_FORECAST_TYPE: S2DParamMapForecastType = new Map([
	...VALUES_FORECAST_TYPE,
]);

const DEFAULT_VALUE_FORECAST_TYPE = VALUES_FORECAST_TYPE[0][0];

// --------------------

const VALUES_FORECAST_DISPLAY = [
	['forecast', __('Forecast')],
	['climatology', __('Climatology')],
] as const;

export type S2DParamForecastDisplay =
	(typeof VALUES_FORECAST_DISPLAY)[number][0];

export type S2DParamMapForecastDisplay = ReadonlyMap<
	S2DParamForecastDisplay,
	string
>;

/**
 * Possible forecast display modes:
 * - forecast
 * - climatology
 */
export const VALUES_MAP_FORECAST_DISPLAY: S2DParamMapForecastDisplay = new Map([
	...VALUES_FORECAST_DISPLAY,
]);

const DEFAULT_VALUE_FORECAST_DISPLAY = VALUES_FORECAST_DISPLAY[0][0];

// --------------------

/**
 * S2D Slice State Interface
 */
export interface S2DStateInterface {
	/**
	 * Stringified version from URL['searchParams']
	 */
	searchQuery: string;
	forecastDisplay: S2DParamForecastDisplay;
	forecastType: S2DParamForecastType;
	freq: S2DParamFreq;
	var: S2DParamVar;
}

const initialState: S2DStateInterface = {
	searchQuery: '',
	forecastDisplay: DEFAULT_VALUE_FORECAST_DISPLAY,
	forecastType: DEFAULT_VALUE_FORECAST_TYPE,
	freq: DEFAULT_VALUE_FREQ,
	var: DEFAULT_VALUE_VAR,
};

export const createInitialState = (): S2DStateInterface =>
	structuredClone(initialState);
