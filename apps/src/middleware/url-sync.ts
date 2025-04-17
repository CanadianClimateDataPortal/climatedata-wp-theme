import { Middleware } from '@reduxjs/toolkit';
import { syncStateToUrl } from '../hooks/use-url-state';

// Define slices that should trigger URL updates
const URL_SYNC_SLICES = ['climateVariable', 'map'];

// Define actions that should NOT trigger URL updates (exceptions)
const URL_SYNC_EXCEPTIONS = [
	'climateVariable/setSearchQuery',
	'climateVariable/clearSearchQuery',
	'map/addRecentLocation',
	'map/deleteLocation',
	'map/clearRecentLocations',
	'map/setLegendData',
	'map/setVariableList',
	'map/setVariableListLoading',
];

const debounce = (fn: Function, delay: number) => {
	let timeoutId: ReturnType<typeof setTimeout>;
	return function (...args: any[]) {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => fn(...args), delay);
	};
};

const debouncedSyncStateToUrl = debounce(syncStateToUrl, 300);

let isUpdatingUrl = false;

/**
 * Redux middleware that synchronizes state changes to the URL
 * Only synchronizes changes from specific slices and actions
 */
export const urlSyncMiddleware: Middleware = (store) => (next) => (action) => {
	const result = next(action);

	if (isUpdatingUrl) return result;

	try {
		if (
			typeof action === 'object' &&
			action !== null &&
			'type' in action &&
			typeof action.type === 'string'
		) {
			const actionType = action.type;
			const shouldSync = URL_SYNC_SLICES.some(
				(slice) =>
					actionType.startsWith(`${slice}/`) &&
					!URL_SYNC_EXCEPTIONS.includes(actionType)
			);

			if (shouldSync) {
				isUpdatingUrl = true;
				const state = store.getState();

				debouncedSyncStateToUrl(state);

				setTimeout(() => {
					isUpdatingUrl = false;
				}, 350);
			}
		}
	} catch (error) {
		isUpdatingUrl = false;
		console.error('Error in URL sync middleware:', error);
	}

	return result;
};
