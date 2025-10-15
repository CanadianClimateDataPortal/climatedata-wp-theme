/**
 * Redux Store Configuration
 *
 * This file defines and configures the Redux store for the application,
 * integrating multiple reducers and middleware.
 *
 * @module store
 */
import { configureStore } from '@reduxjs/toolkit';

// Store Slices and Reducers
import climateVariableReducer from '@/store/climate-variable-slice';
import mapReducer from '@/features/map/map-slice';
import downloadReducer from '@/features/download/download-slice';
import urlSyncReducer from '@/features/url-sync/url-sync-slice';
import downloadUrlSyncReducer from '@/features/download/download-url-sync-slice';
import s2dReducer from '@/features/s2d/s2d-slice';

// API Slices and Reducers - Fetch requests that are going to populate the store
import { wpApiSlice } from '@/services/wp-node';

/**
 * Configures and exports the Redux store for the application.
 *
 * The store is configured with the following reducers:
 * - `map`: Handles state related to the map feature.
 * - `wpApiSlice.reducerPath`: Handles state related to Wordpress API interactions using the `wpApiSlice` reducer.
 *
 * Middleware:
 * - The default middleware is extended with the middleware from `apiSlice`.
 *
 * @see {@link https://redux-toolkit.js.org/api/configureStore} for more information on configuring the store.
 */
export const store = configureStore({
	reducer: {
		climateVariable: climateVariableReducer,
		map: mapReducer,
		download: downloadReducer,
		urlSync: urlSyncReducer,
		downloadUrlSync: downloadUrlSyncReducer,
		s2d: s2dReducer,
		[wpApiSlice.reducerPath]: wpApiSlice.reducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(wpApiSlice.middleware),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
