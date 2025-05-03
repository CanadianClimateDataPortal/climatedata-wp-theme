import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UrlSyncState {
	isInitialized: boolean;
	isLoaded: boolean;
}

const initialState: UrlSyncState = {
	isInitialized: false,
	isLoaded: false
};

const urlSyncSlice = createSlice({
	name: "urlSync",
	initialState,
	reducers: {
		initializeUrlSync: (state) => {
			state.isInitialized = true;
		},
		setUrlParamsLoaded: (state, action: PayloadAction<boolean>) => {
			state.isLoaded = action.payload;
		}
	}
});

export const { initializeUrlSync, setUrlParamsLoaded } = urlSyncSlice.actions;
export default urlSyncSlice.reducer;
