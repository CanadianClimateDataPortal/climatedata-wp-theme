/**
 * Redux Slice: Download
 *
 * This slice manages the state needed by the download app.
 *
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { DownloadState, PostData, TaxonomyData } from '@/types/types';
import { CANADA_CENTER, DEFAULT_ZOOM } from '@/lib/constants';
import { LatLngExpression } from 'leaflet';

// Define the initial state this slice is going to use.
export const initialState: DownloadState = {
	dataset: null,
	variable: null,
	version: 'CMIP5',
	degrees: 2,
	interactiveRegion: 'gridded_data',
	startYear: 2010,
	endYear: 2030,
	frequency: 'Annual',
	emissionScenarios: [],
	selectionMode: 'cells',
	selection: [],
	selectionCount: 0,
	zoom: DEFAULT_ZOOM,
	center: CANADA_CENTER,
	percentiles: [],
	decimalPlace: 2,
	format: 'csv',
	email: '',
	subscribe: false,
};

// Create the slice
const downloadSlice = createSlice({
	name: 'download',
	initialState,
	reducers: {
		setDataset(state, action: PayloadAction<TaxonomyData>) {
			state.dataset = action.payload;
		},
		setVariable(state, action: PayloadAction<PostData>) {
			state.variable = action.payload;
		},
		setVersion(state, action: PayloadAction<string>) {
			state.version = action.payload;
		},
		setDegrees(state, action: PayloadAction<number>) {
			state.degrees = action.payload;
		},
		setInteractiveRegion(state, action: PayloadAction<string>) {
			state.interactiveRegion = action.payload;
		},
		setStartYear(state, action: PayloadAction<number>) {
			state.startYear = action.payload;
		},
		setEndYear(state, action: PayloadAction<number>) {
			state.endYear = action.payload;
		},
		setFrequency(state, action: PayloadAction<string>) {
			state.frequency = action.payload;
		},
		setEmissionScenarios(state, action: PayloadAction<string[]>) {
			state.emissionScenarios = action.payload;
		},
		setSelectionMode(state, action: PayloadAction<string>) {
			state.selectionMode = action.payload;
		},
		setSelection(state, action: PayloadAction<number[]>) {
			state.selection = action.payload;
		},
		setSelectionCount(state, action: PayloadAction<number>) {
			state.selectionCount = action.payload;
		},
		setZoom(state, action: PayloadAction<number>) {
			state.zoom = action.payload;
		},
		setCenter(state, action: PayloadAction<LatLngExpression>) {
			state.center = action.payload;
		},
		setPercentiles(state, action: PayloadAction<string[]>) {
			state.percentiles = action.payload;
		},
		setDecimalPlace(state, action: PayloadAction<number>) {
			state.decimalPlace = action.payload;
		},
		setFormat(state, action: PayloadAction<string>) {
			state.format = action.payload;
		},
		setEmail(state, action: PayloadAction<string>) {
			state.email = action.payload;
		},
		setSubscribe(state, action: PayloadAction<boolean>) {
			state.subscribe = action.payload;
		},
	},
});

// Export actions
export const {
	setDataset,
	setVariable,
	setVersion,
	setDegrees,
	setInteractiveRegion,
	setStartYear,
	setEndYear,
	setFrequency,
	setEmissionScenarios,
	setSelectionMode,
	setSelection,
	setSelectionCount,
	setZoom,
	setCenter,
	setPercentiles,
	setDecimalPlace,
	setFormat,
	setEmail,
	setSubscribe,
} = downloadSlice.actions;

// Export reducer
export default downloadSlice.reducer;
