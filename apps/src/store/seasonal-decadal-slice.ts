import { createSlice } from '@reduxjs/toolkit';

const VALUES_VAR = [
	'air_temp',
	'precipitation',
] as const;

/**
 * The variable’s identificator
 *
 * currently:
 * - air_temp
 * - precipitation
 */
export const S2D_VAR = [...VALUES_VAR] as const;

/**
 * Type representing the valid variable identifiers for seasonal/decadal data.
 *
 * @see S2D_VAR for the source array of valid values.
 */
export type S2DParamVar = (typeof VALUES_VAR)[number];

const DEFAULT_VALUE_VAR = VALUES_VAR[0];

// -----

const VALUES_FREQ = [
	'monthly',
	'seasonal',
	'decadal',
] as const;

/**
 * The variable’s frequency
 *
 * values:
 * - monthly
 * - seasonal
 * - decadal
 */
export const S2D_FREQ = [...VALUES_FREQ] as const;

/**
 * Type representing the valid variable identifiers for seasonal/decadal data.
 *
 * @see S2D_FREQ for the source array of valid values.
 */
export type S2DParamFreq = (typeof VALUES_FREQ)[number];

const DEFAULT_VALUE_FREQ = VALUES_FREQ[0];

// -----

const VALUES_FORECAST_TYPE = [
	'expected_conditions',
	'unusual_conditions',
] as const;

/**
 * Possible forecast types:
 * - expected_conditions
 * - unusual_conditions
 */
export const S2D_FORECAST_TYPE = [...VALUES_FORECAST_TYPE] as const;

/**
 * Type representing the valid forecast type identifiers for seasonal/decadal data.
 *
 * @see S2D_FORECAST_TYPE for the source array of valid values.
 */
export type S2DParamForecastType = (typeof VALUES_FORECAST_TYPE)[number];

const DEFAULT_VALUE_FORECAST_TYPE = VALUES_FORECAST_TYPE[0];

// -----

const VALUES_FORECAST_DISPLAY = [
	'forecast',
	'climatology',
] as const;

/**
 * Possible forecast display modes:
 * - forecast
 * - climatology
 */
export const S2D_FORECAST_DISPLAY = [...VALUES_FORECAST_DISPLAY] as const;

export type S2DParamForecastDisplay = (typeof VALUES_FORECAST_DISPLAY)[number];

const DEFAULT_VALUE_FORECAST_DISPLAY = VALUES_FORECAST_DISPLAY[0];

// -----

/**
 * S2D Slice State Interface
 */
export interface SeasonalDecadalStateInterface {
	/**
	 * Stringified version from URL['searchParams']
	 */
	searchQuery: string;
	var: S2DParamVar;
	freq: S2DParamFreq;
	forecastType: S2DParamForecastType;
	forecastDisplay: S2DParamForecastDisplay;
}

const initialState: SeasonalDecadalStateInterface = {
	searchQuery: '',
	var: DEFAULT_VALUE_VAR,
	freq: DEFAULT_VALUE_FREQ,
	forecastType: DEFAULT_VALUE_FORECAST_TYPE,
	forecastDisplay: DEFAULT_VALUE_FORECAST_DISPLAY,
};

const slice = createSlice({
	name: 'seasonal-decadal',
	initialState,
	reducers: {
		setSearchQuery: (state, action) => {
			state.searchQuery = action.payload;
		},
		clearSearchQuery: (state) => {
			state.searchQuery = '';
		},
		setVar: (state, action) => {
			state.var = action.payload;
		},
		setFreq: (state, action) => {
			state.freq = action.payload;
		},
		setForecastType: (state, action) => {
			state.forecastType = action.payload;
		},
		setForecastDisplay: (state, action) => {
			state.forecastDisplay = action.payload;
		},
		resetSeasonalDecadal: (state) => {
			state.searchQuery = '';
			state.var = DEFAULT_VALUE_VAR;
			state.freq = DEFAULT_VALUE_FREQ;
			state.forecastType = DEFAULT_VALUE_FORECAST_TYPE;
			state.forecastDisplay = DEFAULT_VALUE_FORECAST_DISPLAY;
		},
	},
});

const seasonalDecadalReducer = slice.reducer;

export {
	seasonalDecadalReducer,
};

export default seasonalDecadalReducer;
