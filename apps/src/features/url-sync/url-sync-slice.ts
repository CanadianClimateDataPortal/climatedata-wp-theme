import {
	createSelector,
	createSlice,
	PayloadAction,
} from '@reduxjs/toolkit';
import type { RootState } from '@/app/store';
import { buildMapUrlParams } from '@/lib/url-params';

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

/**
 * The Map URL query string the app would currently write, derived from Redux
 * state (NOT from `window.location.search`, which lags url-sync's debounced
 * `replaceState` — see ticket CI-16). Memoized on the driving slices, so the
 * language switcher re-renders and rebuilds its `href` when they change.
 *
 * Reuses `buildMapUrlParams` — the same serializer the Map url-sync hook writes
 * with — so the switch destination can never drift from what url-sync produces.
 *
 * @returns The query without a leading `?`, or `''` when no variable is set.
 */
export const selectMapUrlSearch = createSelector(
	[
		(state: RootState) => state.climateVariable.data,
		(state: RootState) => state.map.dataset,
		(state: RootState) => state.map.opacity,
		(state: RootState) => state.map.mapCoordinates,
		(state: RootState) => state.map.isLowSkillVisible,
	],
	(
		climateVariable,
		dataset,
		opacity,
		mapCoordinates,
		isLowSkillVisible,
	): string => {
		if (!climateVariable) {
			return '';
		}
		const params = buildMapUrlParams({
			climateVariable,
			dataset,
			opacity,
			mapCoordinates,
			isLowSkillVisible,
		});
		return params.toString();
	},
);

export default urlSyncSlice.reducer;
