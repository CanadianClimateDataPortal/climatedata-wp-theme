import { Middleware } from '@reduxjs/toolkit';
import { syncStateToUrl } from '../lib/utils';

// Define slices that should trigger URL updates
const URL_SYNC_SLICES = [
  'climateVariable',
  'map'
];

// Define actions that should NOT trigger URL updates (exceptions)
const URL_SYNC_EXCEPTIONS = [
  'climateVariable/setSearchQuery',
  'climateVariable/clearSearchQuery',
  'map/addRecentLocation',
  'map/deleteLocation',
  'map/clearRecentLocations',
  'map/setLegendData',
  'map/setVariableList',
  'map/setVariableListLoading'
];

export const urlSyncMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);
  
  if (typeof action === 'object' && action !== null && 'type' in action && typeof action.type === 'string') {
    // Check if action belongs to a slice we want to sync with URL
    const actionType = action.type;
    const shouldSync = URL_SYNC_SLICES.some(slice => 
      actionType.startsWith(`${slice}/`) && !URL_SYNC_EXCEPTIONS.includes(actionType)
    );
    
    if (shouldSync) {
      const state = store.getState();
      syncStateToUrl(state);
    }
  }

  return result;
};