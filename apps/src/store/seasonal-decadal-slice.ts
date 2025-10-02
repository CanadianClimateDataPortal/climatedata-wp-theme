import {
	createSlice,
	type Reducer,
 } from '@reduxjs/toolkit';

import {
	createInitialState,
	type S2DParamForecastDisplay,
	type S2DParamForecastType,
	type S2DParamFreq,
	type S2DParamVar,
	type S2DStateInterface,
	VALUES_MAP_FORECAST_DISPLAY,
	VALUES_MAP_FORECAST_TYPE,
	VALUES_MAP_FREQ,
	VALUES_MAP_VAR,
} from '@/models/seasonal-decadal';

export {
	type S2DParamForecastDisplay,
	type S2DParamForecastType,
	type S2DParamFreq,
	type S2DParamVar,
}

export const createFieldOptionsValueLabel = () => {
  const fields = {
		forecastDisplay: [... VALUES_MAP_FORECAST_DISPLAY].map(([value, label]) => ({ value, label })),
		forecastType: [... VALUES_MAP_FORECAST_TYPE].map(([value, label]) => ({ value, label })),
		freq: [... VALUES_MAP_FREQ].map(([value, label]) => ({ value, label })),
		var: [... VALUES_MAP_VAR].map(([value, label]) => ({ value, label })),
	}
	return fields
}

const slice = createSlice({
	name: 'seasonal-decadal',
	initialState: createInitialState(),
	reducers: {
		clearSearchQuery: (state) => {
			state.searchQuery = '';
		},
		resetSeasonalDecadal: (state) => {
			const initialState = createInitialState();
			state.var = initialState.var;
			state.freq = initialState.freq;
			state.forecastType = initialState.forecastType;
			state.forecastDisplay = initialState.forecastDisplay;
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

export type ReducerForS2DStateInterface = Reducer<S2DStateInterface>;

const seasonalDecadalReducer = slice.reducer as ReducerForS2DStateInterface;

const {
	clearSearchQuery,
	resetSeasonalDecadal,
	setForecastDisplay,
	setForecastType,
	setFreq,
	setSearchQuery,
	setVar,
} = slice.actions;

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
