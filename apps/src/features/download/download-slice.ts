/**
 * Redux Slice: Download
 *
 * This slice manages the state needed by the download app.
 *
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { DownloadState, TaxonomyData } from '@/types/types';
import { CANADA_CENTER, DEFAULT_ZOOM } from '@/lib/constants';
import { LatLngExpression } from 'leaflet';

// Define the initial state this slice is going to use.
export const initialState: DownloadState = {
	dataset: null,
	selectionMode: 'cells',
	selection: [],
	selectionCount: 0,
	zoom: DEFAULT_ZOOM,
	center: CANADA_CENTER,
	decimalPlace: 0,
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
	setSelectionMode,
	setSelection,
	setSelectionCount,
	setZoom,
	setCenter,
	setDecimalPlace,
	setFormat,
	setEmail,
	setSubscribe,
} = downloadSlice.actions;

// Export reducer
export default downloadSlice.reducer;
