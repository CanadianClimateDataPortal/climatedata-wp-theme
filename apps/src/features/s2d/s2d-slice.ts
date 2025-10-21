/**
 * Redux Slice for the S2D store.
 *
 * The store contains:
 * - Information about the data release dates.
 *
 * Each release date is associated with a specific variable and frequency.
 *
 * Release dates are stored as strings in the format "YYYY-MM-DD". They are to
 * be interpreted as UTC.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/app/store';

/**
 * Unique identifier for a release date.
 *
 * Simply an alias of `string` to make the code a little bit clearer to read.
 *
 * A release date key must be unique to a variable and frequency combination.
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
		 * Save, in the cache, the date of a specific release date.
		 *
		 * Also save in the store that this release date is no longer loading.
		 *
		 * The release date is a string in the format "YYYY-MM-DD", interpreted
		 * as UTC.
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
 * Return a selector that retrieves a cached release date.
 *
 * The key is unique to a variable and frequency.
 *
 * Null is retrieved if no release date is found.
 */
export const selectReleaseDateCache =
	(key: ReleaseDateKey) => (state: RootState) =>
		state.s2d.releaseDateCache[key] || null;

/**
 * Return a selector that retrieves the loading status for a release date.
 *
 * The key is unique to a variable and frequency.
 */
export const selectReleaseDateLoading =
	(key: ReleaseDateKey) => (state: RootState) =>
		!!state.s2d.releaseDateLoading[key];

export default s2dSlice.reducer;
