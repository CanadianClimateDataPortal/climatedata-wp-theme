/**
 * Redux Slice: Download
 *
 * This slice manages the state needed by the download app.
 *
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { DownloadState, Station, TaxonomyData } from '@/types/types';
import { CANADA_CENTER, DEFAULT_ZOOM } from '@/lib/constants';
import { LatLngExpression } from 'leaflet';
import { DownloadFile } from '@/types/climate-variable-interface';

// Define the initial state this slice is going to use.
export const initialState: DownloadState = {
	dataset: null,
	selectionMode: 'cells',
	selection: [],
	selectionCount: 0,
	zoom: DEFAULT_ZOOM,
	center: CANADA_CENTER,
	email: '',
	subscribe: false,
	variableListLoading: false,
	captchaValue: '',
	currentStep: 1,
	downloadLinks: undefined,
	selectedStation: undefined
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
		setEmail(state, action: PayloadAction<string>) {
			state.email = action.payload;
		},
		setSubscribe(state, action: PayloadAction<boolean>) {
			state.subscribe = action.payload;
		},
		setVariableListLoading(state, action: PayloadAction<boolean>) {
			state.variableListLoading = action.payload;
		},
		setRequestStatus(state, action: PayloadAction<'idle' | 'loading' | 'success' | 'error'>) {
			state.requestStatus = action.payload;
		},
		setRequestResult(state, action: PayloadAction<any>) {
			state.requestResult = action.payload;
		},
		setRequestError(state, action: PayloadAction<string | null>) {
			state.requestError = action.payload;
		},
		resetRequestState(state) {
			state.requestStatus = 'idle';
			state.requestResult = undefined;
			state.requestError = null;
		},
		setCaptchaValue(state, action: PayloadAction<string>) {
			state.captchaValue = action.payload;
		},
		setCurrentStep(state, action: PayloadAction<number>) {
			state.currentStep = action.payload;
		},
		setSelectedStation(state, action: PayloadAction<Station>) {
			state.selectedStation = action.payload;
		},
		resetVariableSelection(state) {
			state.dataset = state.dataset; // Keep dataset
			state.currentStep = 1;
		},
		setDownloadLinks(state, action: PayloadAction<DownloadFile[] | undefined>) {
			state.downloadLinks = action.payload;
		},
		resetDownloadLinks(state) {
			state.downloadLinks = undefined;
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
	setEmail,
	setSubscribe,
	setVariableListLoading,
	setRequestStatus,
	setRequestResult,
	setRequestError,
	resetRequestState,
	setCaptchaValue,
	setCurrentStep,
	resetVariableSelection,
	setDownloadLinks,
	resetDownloadLinks,
	setSelectedStation,
} = downloadSlice.actions;

// Export reducer
export default downloadSlice.reducer;
