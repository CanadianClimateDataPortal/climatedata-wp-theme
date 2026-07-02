import {
	createSelector,
	createSlice,
	PayloadAction,
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
 * The Download URL query string the app would currently write, derived from
 * Redux state — NOT from `window.location.search`. url-sync writes the URL with
 * a debounced `history.replaceState` that triggers no re-render, so a value
 * read from the URL at render time lags the live state. Reading state keeps
 * this current. Memoized on the driving slices, so the language switcher
 * re-renders and rebuilds its `href` when the step, dataset, or variable
 * changes. ([[LLM-Context-ClimateData-Ticket-CLIM-1409]], CI-16.)
 *
 * Reuses `buildDownloadUrlParams` — the same serializer the Download url-sync
 * hook writes with — so the switch destination can never drift.
 *
 * @returns The query without a leading `?` (`dataset`/`var`, or `''` on step 1).
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
