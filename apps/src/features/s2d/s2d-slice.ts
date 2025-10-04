/**
 * Redux Slice for the S2D store.
 *
 * The store contains:
 * - Information about the data release dates.
 *
 * Each release date is associated with a specific variable and frequency
 * combination.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/app/store';

/**
 * Unique identifier for a release date (a combination of variable and
 * frequency).
 */
type ReleaseDateKey = string;

interface S2DStoreState {
	releaseDateCache: Record<ReleaseDateKey, string>;
	releaseDateLoading: Record<ReleaseDateKey, boolean>;
}

const initialState: S2DStoreState = {
	releaseDateCache: {},
	releaseDateLoading: {},
};

const s2dSlice = createSlice({
	name: 's2d',
	initialState,
	reducers: {
		/**
		 * Save, in the cache, the release date for a specific variable and
		 * frequency combination.
		 *
		 * Also save in the store that this release date is no longer loading.
		 *
		 * The release date is a string in the format "YYYY-MM-DD".
		 */
		setReleaseDate(
			state,
			action: PayloadAction<{ key: ReleaseDateKey; value: string }>
		) {
			const { key, value } = action.payload;
			state.releaseDateCache[key] = value;
			state.releaseDateLoading[key] = false;
		},

		/**
		 * Set an indicator if a specific release date is currently loading.
		 */
		setReleaseDateIsLoading(
			state,
			action: PayloadAction<{ key: ReleaseDateKey; isLoading: boolean }>
		) {
			const { key, isLoading } = action.payload;
			state.releaseDateLoading[key] = isLoading;
		},
	},
});

export const { setReleaseDate, setReleaseDateIsLoading } = s2dSlice.actions;

/**
 * Retrieve the cached release date for a specific variable and frequency.
 *
 * Null is retrieved if no release date is found.
 */
export const selectReleaseDateCache =
	(key: ReleaseDateKey) => (state: RootState) =>
		state.s2d.releaseDateCache[key] || null;

/**
 * Retrieve the loading status for a specific release date.
 */
export const selectReleaseDateLoading =
	(key: ReleaseDateKey) => (state: RootState) =>
		!!state.s2d.releaseDateLoading[key];

export default s2dSlice.reducer;
