/**
 * Redux Slice: Download
 *
 * This slice manages the state needed by the download app.
 *
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { DownloadState } from '@/types/types';
import { CANADA_CENTER, DEFAULT_ZOOM } from '@/lib/constants';

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
	selectedCells: [],
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
		setValue<K extends keyof DownloadState>(
			state: DownloadState,
			action: PayloadAction<{ key: K; value: DownloadState[K] }>
		) {
			const { key, value } = action.payload;
			state[key] = value;
		},
	},
});

// Export actions
export const { setValue } = downloadSlice.actions;

// Export reducer
export default downloadSlice.reducer;
