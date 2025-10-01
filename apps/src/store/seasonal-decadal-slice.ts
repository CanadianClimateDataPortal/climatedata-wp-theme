import {
	createSlice,
	type Reducer,
 } from '@reduxjs/toolkit';
import { __ } from '@/context/locale-provider';

const VALUES_VAR = [
	['air_temp', __('Temperature')],
	['precipitation', __('Precipitation')],
] as const;

/**
 * The variable’s identificator
 *
 * currently:
 * - air_temp
 * - precipitation
 */
export const S2D_VAR: ReadonlyMap<S2DParamVar, string> = new Map([...VALUES_VAR]);

/**
 * Type representing the valid variable identifiers for seasonal/decadal data.
 *
 * @see S2D_VAR for the source array of valid values.
 */
export type S2DParamVar = (typeof VALUES_VAR)[number][0];

const DEFAULT_VALUE_VAR = VALUES_VAR[0][0];

// -----

const VALUES_FREQ = [
	['monthly', __('Monthly') ], 
	['seasonal', __('Seasonal (3 months)') ], 
	['decadal', __('Decadal (5 years)') ], 
] as const;

/**
 * The variable’s frequency
 *
 * values:
 * - monthly
 * - seasonal
 * - decadal
 */
export const S2D_FREQ: ReadonlyMap<S2DParamFreq, string> = new Map(VALUES_FREQ);

/**
 * Type representing the valid variable identifiers for seasonal/decadal data.
 *
 * @see S2D_FREQ for the source array of valid values.
 */
export type S2DParamFreq = (typeof VALUES_FREQ)[number][0];

const DEFAULT_VALUE_FREQ = VALUES_FREQ[0][0];

// -----

const VALUES_FORECAST_TYPE = [
	['expected_conditions', __('Expected Conditions')],
	['unusual_conditions', __('Unusual Conditions')],
] as const;

/**
 * Possible forecast types:
 * - expected_conditions
 * - unusual_conditions
 */
export const S2D_FORECAST_TYPE: ReadonlyMap<S2DParamForecastType, string> = new Map([...VALUES_FORECAST_TYPE]);

/**
 * Type representing the valid forecast type identifiers for seasonal/decadal data.
 *
 * @see S2D_FORECAST_TYPE for the source array of valid values.
 */
export type S2DParamForecastType = (typeof VALUES_FORECAST_TYPE)[number][0];

const DEFAULT_VALUE_FORECAST_TYPE = VALUES_FORECAST_TYPE[0][0];

// -----

const VALUES_FORECAST_DISPLAY = [
	['forecast', __('Forecast')],
	['climatology', __('Climatology')],
] as const;

/**
 * Possible forecast display modes:
 * - forecast
 * - climatology
 */
export const S2D_FORECAST_DISPLAY: ReadonlyMap<S2DParamForecastDisplay, string> = new Map([...VALUES_FORECAST_DISPLAY]);

export type S2DParamForecastDisplay = (typeof VALUES_FORECAST_DISPLAY)[number][0];

const DEFAULT_VALUE_FORECAST_DISPLAY = VALUES_FORECAST_DISPLAY[0][0];

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
		clearSearchQuery: (state) => {
			state.searchQuery = '';
		},
		resetSeasonalDecadal: (state) => {
			state.searchQuery = '';
			state.var = DEFAULT_VALUE_VAR;
			state.freq = DEFAULT_VALUE_FREQ;
			state.forecastType = DEFAULT_VALUE_FORECAST_TYPE;
			state.forecastDisplay = DEFAULT_VALUE_FORECAST_DISPLAY;
		},
		setForecastDisplay: (state, action) => {
			state.forecastDisplay = action.payload;
		},
		setForecastType: (state, action) => {
			state.forecastType = action.payload;
		},
		setFreq: (state, action) => {
			state.freq = action.payload;
		},
		setSearchQuery: (state, action) => {
			state.searchQuery = action.payload;
		},
		setVar: (state, action) => {
			state.var = action.payload;
		},
	},
});

export type ReducerForSeasonalDecadalState = Reducer<SeasonalDecadalStateInterface>

const seasonalDecadalReducer = slice.reducer as ReducerForSeasonalDecadalState;

const {
	clearSearchQuery,
	resetSeasonalDecadal,
	setForecastDisplay,
	setForecastType,
	setFreq,
	setSearchQuery,
	setVar,
} = slice.actions

export const seasonalDecadalActions = {
	clearSearchQuery,
	resetSeasonalDecadal,
	setForecastDisplay,
	setForecastType,
	setFreq,
	setSearchQuery,
	setVar,
}

export {
	seasonalDecadalReducer,
};

export default seasonalDecadalReducer;
