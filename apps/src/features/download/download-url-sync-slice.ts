import {
	createSelector,
	createSlice,
	type PayloadAction,
} from '@reduxjs/toolkit';
import type { RootState } from '@/app/store';
import { buildDownloadUrlParams } from '@/lib/url-params';

interface DownloadUrlSyncState {
	isInitialized: boolean;
	isLoaded: boolean;
}

const initialState: DownloadUrlSyncState = {
	isInitialized: false,
	isLoaded: false
};

const downloadUrlSyncSlice = createSlice({
	name: "downloadUrlSync",
	initialState,
	reducers: {
		initializeDownloadUrlSync: (state) => {
			state.isInitialized = true;
		},
		setDownloadUrlParamsLoaded: (state, action: PayloadAction<boolean>) => {
			state.isLoaded = action.payload;
		},
		resetDownloadUrlSync: (state) => {
			// Reset state but keep initialized flag to true
			state.isLoaded = false;
		}
	}
});

export const {
	initializeDownloadUrlSync,
	setDownloadUrlParamsLoaded,
	resetDownloadUrlSync
} = downloadUrlSyncSlice.actions;

/**
 * URL query string the app would currently write, derived from Redux state.
 *
 * @see {@link selectMapUrlSearch} for the Map URL equivalent and explanation.
 */
export const selectDownloadUrlSearch = createSelector(
	[
		(state: RootState) => state.download.currentStep,
		(state: RootState) => state.download.dataset,
		(state: RootState) => state.climateVariable.data,
	],
	(
		currentStep,
		dataset,
		climateVariable,
	): string => {
		const params = new URLSearchParams();
		buildDownloadUrlParams(params, {
			currentStep: currentStep ?? 1,
			datasetTermId: dataset?.term_id,
			climateVariableId: climateVariable?.id,
		});
		return params.toString();
	},
);

export default downloadUrlSyncSlice.reducer;
