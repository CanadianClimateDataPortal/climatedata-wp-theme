import { useEffect, useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { ClimateVariables } from '@/config/climate-variables.config';
import { setClimateVariable, updateClimateVariable } from '@/store/climate-variable-slice';
import * as MapActions from '@/features/map/map-slice';
import { RootState } from '@/app/store';
import { 
  AveragingType, 
  ClimateVariableConfigInterface, 
  InteractiveRegionOption 
} from '@/types/climate-variable-interface';
import { 
  MapState, 
  MapItemsOpacity, 
  PartialState, 
  MapActionType
} from '@/types/types';
import {
  SLIDER_DEFAULT_YEAR_VALUE,
  SLIDER_MAX_YEAR,
  SLIDER_YEAR_WINDOW_SIZE,
  REGION_GRID,
} from '@/lib/constants';

// Type definitions for URL configuration
type TransformFunctions<T> = {
  toURL: (value: NonNullable<T>) => string;
  fromURL: (value: string) => T;
};

type UrlConfigItem<T = any> = {
  urlKey: string;
  transform?: TransformFunctions<T>;
};

// Type-safe record of state keys to URL config
type ClimateVariableUrlMapping = {
  [K in keyof Partial<ClimateVariableConfigInterface>]?: UrlConfigItem<ClimateVariableConfigInterface[K]>;
};

type MapStateUrlMapping = {
  [K in keyof Partial<MapState>]?: UrlConfigItem<MapState[K]>;
};

// Configuration mapping climate variable state parameters to URL parameters
const STATE_TO_URL_CONFIG: ClimateVariableUrlMapping = {
  id: { urlKey: 'var' },
  version: { urlKey: 'ver' },
  threshold: { urlKey: 'th' },
  frequency: { urlKey: 'freq' },
  scenario: { urlKey: 'scen' },
  scenarioCompare: {
    urlKey: 'cmp',
    transform: {
      toURL: (value: NonNullable<boolean>) => (value ? '1' : '0'),
      fromURL: (value: string) => value === '1',
    },
  },
  scenarioCompareTo: { urlKey: 'cmpTo' },
  interactiveRegion: {
    urlKey: 'region',
    transform: {
      toURL: (value: NonNullable<InteractiveRegionOption>) => value.toString(),
      fromURL: (value: string) => value as InteractiveRegionOption,
    },
  },
  dataValue: { urlKey: 'dataVal' },
  colourScheme: { urlKey: 'clr' },
  colourType: { urlKey: 'clrType' },
  averagingType: {
    urlKey: 'avg',
    transform: {
      toURL: (value: NonNullable<AveragingType>) => value.toString(),
      fromURL: (value: string) => value as AveragingType,
    },
  },
};

// Configuration for map state to URL parameters
const MAP_STATE_TO_URL_CONFIG: MapStateUrlMapping = {
  variable: { urlKey: 'mapVar' },
  decade: { urlKey: 'decade' },
  thresholdValue: { 
    urlKey: 'threshold',
    transform: {
      toURL: (value: NonNullable<number>) => value.toString(),
      fromURL: (value: string) => parseInt(value),
    }
  },
  interactiveRegion: { urlKey: 'mapRegion' },
  frequency: { urlKey: 'mapFreq' },
  timePeriodEnd: { 
    urlKey: 'period',
    transform: {
      toURL: (value: NonNullable<number[]>) => value[0].toString(),
      fromURL: (value: string) => [parseInt(value)]
    }
  },
  mapColor: { urlKey: 'color' },
  opacity: { 
    urlKey: 'opacity',
    transform: {
      toURL: (value: NonNullable<MapItemsOpacity>) => {
        const params: Record<string, string> = {};
        if (value.mapData !== undefined) {
          params.dataOpacity = Math.round(value.mapData * 100).toString();
        }
        if (value.labels !== undefined) {
          params.labelOpacity = Math.round(value.labels * 100).toString();
        }
        return JSON.stringify(params);
      },
      fromURL: (value: string): MapItemsOpacity => {
        try {
          const parsed = JSON.parse(value);
          const result: MapItemsOpacity = { mapData: 1, labels: 1 };
          
          if (parsed.dataOpacity) {
            result.mapData = parseInt(parsed.dataOpacity) / 100;
          }
          if (parsed.labelOpacity) {
            result.labels = parseInt(parsed.labelOpacity) / 100;
          }
          
          return result;
        } catch {
          return { mapData: 1, labels: 1 };
        }
      }
    }
  }
};

// Create a map of state property keys to action creators
const mapActionsCreatorsMap: MapActionType = {
  variable: MapActions.setVariable,
  decade: MapActions.setDecade,
  interactiveRegion: MapActions.setInteractiveRegion,
  timePeriodEnd: MapActions.setTimePeriodEnd,
  thresholdValue: MapActions.setThresholdValue,
  mapColor: MapActions.setMapColor,
  opacity: MapActions.setOpacity,
};

const defaultTimePeriodEnd = Math.min(
  SLIDER_DEFAULT_YEAR_VALUE + SLIDER_YEAR_WINDOW_SIZE,
  SLIDER_MAX_YEAR
);

/**
 * Builds an initial state object with defaults
 */
const createInitialState = (): PartialState => ({
  climateVariable: {
    data: {
      id: '',
      class: 'RasterPrecalculatedClimateVariable',
    },
    searchQuery: '',
  },
  map: {
    interactiveRegion: REGION_GRID,
    thresholdValue: 5,
    frequency: 'ann',
    timePeriodEnd: [defaultTimePeriodEnd],
    recentLocations: [],
    variable: 'tx_max',
    decade: '2040',
    pane: 'raster',
    mapColor: 'default',
    opacity: {
      mapData: 1,
      labels: 1,
    },
    legendData: {},
    variableList: [],
    variableListLoading: false,
  } as unknown as MapState,
});

/**
 * Converts URL search parameters to a state object for Redux
 */
const urlParamsToState = (params: URLSearchParams): PartialState => {
  const state = createInitialState();

  // Process climate variable parameters
  Object.entries(STATE_TO_URL_CONFIG).forEach(([stateKey, config]) => {
    if (!config) return;
    
    const urlValue = params.get(config.urlKey);
    if (urlValue && state.climateVariable?.data) {
      const key = stateKey as keyof ClimateVariableConfigInterface;
      const value = config.transform?.fromURL 
        ? config.transform.fromURL(urlValue) 
        : urlValue;
      
      if (state.climateVariable.data) {
        (state.climateVariable.data as any)[key] = value;
      }
    }
  });
  
  // Process ID separately to ensure we get the complete config
  if (state.climateVariable?.data?.id) {
    const variableId = state.climateVariable.data.id as string;
    const matchedVariable = ClimateVariables.find(config => config.id === variableId);
    
    if (matchedVariable) {
      // Merge the config with URL params while preserving URL overrides
      state.climateVariable.data = {
        ...matchedVariable,
        ...state.climateVariable.data
      };
    }
  }

  // Process map parameters
  if (state.map) {
    // Process normal map properties
    (Object.entries(MAP_STATE_TO_URL_CONFIG) as [keyof MapState, UrlConfigItem | undefined][]).forEach(
      ([stateKey, config]) => {
        if (!config) return;
        
        const urlValue = params.get(config.urlKey);
        if (urlValue && state.map) {
          if (config.transform?.fromURL) {
            (state.map as any)[stateKey] = config.transform.fromURL(urlValue);
          } else {
            // Special case handling
            if (stateKey === 'thresholdValue') {
              (state.map as any)[stateKey] = parseInt(urlValue);
            } else {
              (state.map as any)[stateKey] = urlValue;
            }
          }
        }
      }
    );

    // Handle legacy opacity parameters for backward compatibility
    if (state.map.opacity) {
      const dataOpacity = params.get('dataOpacity');
      if (dataOpacity) {
        const opacityNum = parseInt(dataOpacity);
        if (!isNaN(opacityNum)) {
          state.map.opacity.mapData = opacityNum / 100;
        }
      }
      
      const labelOpacity = params.get('labelOpacity');
      if (labelOpacity) {
        const opacityNum = parseInt(labelOpacity);
        if (!isNaN(opacityNum)) {
          state.map.opacity.labels = opacityNum / 100;
        }
      }
    }
  }

  return state;
};

/**
 * Converts the current Redux state to URL parameters
 */
const stateToUrlParams = (state: RootState): URLSearchParams => {
  const params = new URLSearchParams();

  // Add climate variable parameters
  if (state.climateVariable?.data) {
    (Object.entries(STATE_TO_URL_CONFIG) as [keyof ClimateVariableConfigInterface, UrlConfigItem | undefined][]).forEach(([stateKey, config]) => {
      if (!config) return;
      
      const value = state.climateVariable.data?.[stateKey];
      if (value !== undefined && value !== null) {
        if (config.transform?.toURL) {
          const urlValue = config.transform.toURL(value as any);
          params.set(config.urlKey, urlValue);
        } else {
          params.set(config.urlKey, String(value));
        }
      }
    });
  }

  // Add map parameters
  if (state.map) {
    (Object.entries(MAP_STATE_TO_URL_CONFIG) as [keyof MapState, UrlConfigItem | undefined][]).forEach(
      ([stateKey, config]) => {
        if (!config) return;
        
        const value = (state.map as any)[stateKey];
        if (value !== undefined && value !== null) {
          if (config.transform?.toURL) {
            // Handle special case for opacity
            if (stateKey === 'opacity') {
              try {
                const opacityParams = JSON.parse(config.transform.toURL(value));
                Object.entries(opacityParams).forEach(([key, val]) => {
                  params.set(key, val as string);
                });
              } catch (error) {
                console.error('Error processing opacity params:', error);
              }
            } else {
              params.set(config.urlKey, config.transform.toURL(value));
            }
          } else if (typeof value !== 'object' || Array.isArray(value)) {
            params.set(config.urlKey, String(value));
          }
        }
      }
    );
  }

  return params;
};

/**
 * Updates the URL to reflect the current state without causing navigation
 */
export const syncStateToUrl = (state: RootState): void => {
  const params = stateToUrlParams(state);
  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, '', newUrl);
};

/**
 * Type guard to check if a value is a valid property for a specific action
 */
function isValidValueForAction<T>(value: any, expectedType: string): value is T {
  if (expectedType === 'string') return typeof value === 'string';
  if (expectedType === 'number') return typeof value === 'number';
  if (expectedType === 'boolean') return typeof value === 'boolean';
  if (expectedType === 'array') return Array.isArray(value);
  if (expectedType === 'object') return typeof value === 'object' && value !== null;
  return false;
}

/**
 * Type-safe dispatcher for map actions
 */
function dispatchMapAction(
  dispatch: ReturnType<typeof useAppDispatch>,
  actionKey: keyof typeof mapActionsCreatorsMap,
  value: any
) {
  const actionCreator = mapActionsCreatorsMap[actionKey];
  if (!actionCreator) return;

  // Special case for opacity which needs a different structure
  if (actionKey === 'opacity' && typeof value === 'object') {
    const opacityValue = value as MapItemsOpacity;
    
    if (opacityValue.mapData !== undefined) {
      dispatch(MapActions.setOpacity({
        key: 'mapData',
        value: opacityValue.mapData * 100
      }));
    }
    
    if (opacityValue.labels !== undefined) {
      dispatch(MapActions.setOpacity({
        key: 'labels',
        value: opacityValue.labels * 100
      }));
    }
    return;
  }

  // Type checking for other actions
  switch (actionKey) {
    case 'variable':
      if (isValidValueForAction<string>(value, 'string')) {
        dispatch(actionCreator(value));
      }
      break;
    case 'decade':
      if (isValidValueForAction<string>(value, 'string')) {
        dispatch(actionCreator(value));
      }
      break;
    case 'interactiveRegion':
      if (isValidValueForAction<string>(value, 'string')) {
        dispatch(actionCreator(value));
      }
      break;
    case 'timePeriodEnd':
      if (isValidValueForAction<number[]>(value, 'array') && 
          value.length > 0 && 
          value.every(item => typeof item === 'number')) {
        dispatch(actionCreator(value));
      }
      break;
    case 'thresholdValue':
      if (isValidValueForAction<number>(value, 'number')) {
        dispatch(actionCreator(value));
      }
      break;
    case 'mapColor':
      if (isValidValueForAction<string>(value, 'string')) {
        dispatch(actionCreator(value));
      }
      break;
  }
}

/**
 * Hook to synchronize URL state with Redux state bidirectionally
 */
export const useUrlState = () => {
  const dispatch = useAppDispatch();
  const hasProcessedUrlState = useRef(false);
  const isUpdatingUrl = useRef(false);
  const state = useAppSelector(state => state);
  
  // Process URL params and update state
  useEffect(() => {
    // Skip if we've already processed the URL state to prevent loops
    if (hasProcessedUrlState.current) return;
    
    // Get URL params
    const params = new URLSearchParams(window.location.search);

    // Only process if URL has meaningful parameters
    if (!params.has('var') && !params.has('mapVar')) return;

    try {
      const newState = urlParamsToState(params);

      // Set flags to prevent loops
      isUpdatingUrl.current = true;
      hasProcessedUrlState.current = true;

      // Apply climate variable state first
      if (newState.climateVariable?.data) {
        dispatch(setClimateVariable(newState.climateVariable.data as ClimateVariableConfigInterface));
      }

      // Apply map state with a slight delay to ensure climate variable is ready
      setTimeout(() => {
        if (newState.map) {
          // Handle frequency special case by updating the climate variable
          if (newState.map.frequency) {
            dispatch(updateClimateVariable({ frequency: newState.map.frequency }));
          }

          // Apply other map state properties
          const { frequency, ...otherMapState } = newState.map;
          
          // Use our type-safe dispatcher for each property
          (Object.entries(otherMapState) as [keyof typeof mapActionsCreatorsMap, any][]).forEach(
            ([key, value]) => {
              if (value !== undefined && key in mapActionsCreatorsMap) {
                dispatchMapAction(dispatch, key, value);
              }
            }
          );
        }
        
        isUpdatingUrl.current = false;
      }, 100);
    } catch (error) {
      console.error('Error processing URL state:', error);
      // Still mark as processed even if there's an error to prevent loops
      hasProcessedUrlState.current = true;
      isUpdatingUrl.current = false;
    }
  }, [dispatch]);

  // Sync state changes to URL
  useEffect(() => {
    // Skip initial render and when processing from URL
    if (!hasProcessedUrlState.current || isUpdatingUrl.current) return;
    
    // Debounce URL updates
    const timeoutId = setTimeout(() => {
      syncStateToUrl(state);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [state]);
  
  // Expose function to manually sync state to URL
  const updateUrl = useCallback(() => {
    syncStateToUrl(state);
  }, [state]);
  
  return { updateUrl };
};

// Export map actions for external use
export { mapActionsCreatorsMap };