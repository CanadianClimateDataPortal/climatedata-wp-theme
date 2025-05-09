import { createSlice, PayloadAction } from "@reduxjs/toolkit";

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
		}
	}
});

export const { initializeDownloadUrlSync, setDownloadUrlParamsLoaded } = downloadUrlSyncSlice.actions;
export default downloadUrlSyncSlice.reducer;