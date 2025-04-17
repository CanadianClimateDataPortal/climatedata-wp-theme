import { Middleware } from '@reduxjs/toolkit';
import { syncStateToUrl } from '../lib/utils';

export const SYNC_ACTIONS = [
  // Climate Variable actions
  'climateVariable/setClimateVariable',
  'climateVariable/updateClimateVariable',
  
  // Map Setting actions
  'map/setVariable',
  'map/setVersion',
  'map/setThreshold',
  'map/setScenario',
  'map/setCompareScenarios',
  'map/setScenarioCompareTo',
  'map/setInteractiveRegion',
  'map/setFrequency',
  'map/setTimePeriodEnd',
  'map/setDataValue',
  'map/setColorScheme',
  'map/setColorType',
  'map/setAveragingType',
  'map/setDecade',
  'map/setThresholdValue'
];

export const urlSyncMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);
  
  if (typeof action === 'object' && action !== null && 'type' in action && 
      typeof action.type === 'string' && SYNC_ACTIONS.includes(action.type)) {
    const state = store.getState();
    syncStateToUrl(state);
  }

  return result;
};