import { useEffect, useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { ClimateVariables } from '@/config/climate-variables.config';
import {
	setClimateVariable,
	updateClimateVariable,
} from '@/store/climate-variable-slice';
import {
	setVariable,
	setDecade,
	setInteractiveRegion,
	setTimePeriodEnd,
	setThresholdValue,
	setMapColor,
	setOpacity,
} from '@/features/map/map-slice';
import { RootState } from '@/app/store';
import {
	AveragingType,
	ClimateVariableConfigInterface,
	InteractiveRegionOption,
} from '@/types/climate-variable-interface';
import { MapItemsOpacity, MapState } from '@/types/types';

interface UrlConfigItem<T = any> {
	urlKey: string;
	transform?: {
		toURL?: (value: T) => string;
		fromURL?: (value: string) => T;
	};
}

// Configuration mapping state parameters to URL query parameters
const STATE_TO_URL_CONFIG: Record<string, UrlConfigItem> = {
	id: { urlKey: 'var' },
	version: { urlKey: 'ver' },
	threshold: { urlKey: 'th' },
	frequency: { urlKey: 'freq' },
	scenario: { urlKey: 'scen' },
	scenarioCompare: {
		urlKey: 'cmp',
		transform: {
			toURL: (value: boolean) => (value ? '1' : '0'),
			fromURL: (value: string) => value === '1',
		},
	},
	scenarioCompareTo: { urlKey: 'cmpTo' },
	interactiveRegion: {
		urlKey: 'region',
		transform: {
			toURL: (value: InteractiveRegionOption) => value.toString(),
			fromURL: (value: string) => value as InteractiveRegionOption,
		},
	},
	dataValue: { urlKey: 'dataVal' },
	colourScheme: { urlKey: 'clr' },
	colourType: { urlKey: 'clrType' },
	averagingType: {
		urlKey: 'avg',
		transform: {
			toURL: (value: AveragingType) => value.toString(),
			fromURL: (value: string) => value as AveragingType,
		},
	},
};

// Configuration for map state to URL parameters
const MAP_STATE_TO_URL_CONFIG: Record<string, UrlConfigItem> = {
	variable: { urlKey: 'mapVar' },
	decade: { urlKey: 'decade' },
	thresholdValue: { urlKey: 'threshold' },
	interactiveRegion: { urlKey: 'mapRegion' },
	frequency: { urlKey: 'mapFreq' },
	timePeriodEnd: {
		urlKey: 'period',
		transform: {
			toURL: (value: number[]) => value[0].toString(),
			fromURL: (value: string) => [parseInt(value)],
		},
	},
	mapColor: { urlKey: 'color' },
	opacity: {
		urlKey: 'opacity',
		transform: {
			toURL: (value: MapItemsOpacity) => {
				const params: Record<string, string> = {};
				if (value.mapData !== undefined) {
					params.dataOpacity = Math.round(
						value.mapData * 100
					).toString();
				}
				if (value.labels !== undefined) {
					params.labelOpacity = Math.round(
						value.labels * 100
					).toString();
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
			},
		},
	},
};

// Import constants from the project
import {
	SLIDER_DEFAULT_YEAR_VALUE,
	SLIDER_MAX_YEAR,
	SLIDER_YEAR_WINDOW_SIZE,
	REGION_GRID,
} from '@/lib/constants';

const defaultTimePeriodEnd = Math.min(
	SLIDER_DEFAULT_YEAR_VALUE + SLIDER_YEAR_WINDOW_SIZE,
	SLIDER_MAX_YEAR
);

/**
 * Converts URL search parameters to a state object for Redux
 */
const urlParamsToState = (params: URLSearchParams): Partial<RootState> => {
	// Create base state with required properties
	const state: Partial<RootState> = {
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
	};

	// Process climate variable parameters
	Object.entries(STATE_TO_URL_CONFIG).forEach(([stateKey, config]) => {
		const urlValue = params.get(config.urlKey);
		if (urlValue && state.climateVariable?.data) {
			const transformer = config.transform?.fromURL;
			const value = transformer ? transformer(urlValue) : urlValue;
			if (state.climateVariable.data) {
				(state.climateVariable.data as any)[stateKey] = value;
			}
		}
	});

	// Process ID separately to ensure we get the complete config
	if (state.climateVariable?.data?.id) {
		const variableId = state.climateVariable.data.id as string;
		const matchedVariable = ClimateVariables.find(
			(config) => config.id === variableId
		);

		if (matchedVariable) {
			// Merge the config with URL params while preserving URL overrides
			state.climateVariable.data = {
				...matchedVariable,
				...state.climateVariable.data,
			};
		}
	}

	// Process map parameters
	if (state.map) {
		Object.entries(MAP_STATE_TO_URL_CONFIG).forEach(
			([stateKey, config]) => {
				const urlValue = params.get(config.urlKey);
				if (urlValue && state.map) {
					if (config.transform?.fromURL) {
						(state.map as any)[stateKey] =
							config.transform.fromURL(urlValue);
					} else {
						if (stateKey === 'opacity') {
							if (!state.map.opacity) {
								state.map.opacity = { mapData: 1, labels: 1 };
							}

							// Check for individual opacity parameters
							const dataOpacity = params.get('dataOpacity');
							if (dataOpacity) {
								const opacityNum = parseInt(dataOpacity);
								if (!isNaN(opacityNum)) {
									state.map.opacity.mapData =
										opacityNum / 100;
								}
							}

							const labelOpacity = params.get('labelOpacity');
							if (labelOpacity) {
								const opacityNum = parseInt(labelOpacity);
								if (!isNaN(opacityNum)) {
									state.map.opacity.labels = opacityNum / 100;
								}
							}
						} else {
							// Handle numeric values if needed
							if (stateKey === 'thresholdValue') {
								(state.map as any)[stateKey] =
									parseInt(urlValue);
							} else {
								(state.map as any)[stateKey] = urlValue;
							}
						}
					}
				}
			}
		);
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
		Object.entries(STATE_TO_URL_CONFIG).forEach(([stateKey, config]) => {
			const value = (state.climateVariable.data as any)[stateKey];

			if (value !== undefined && value !== null) {
				if (config.transform?.toURL) {
					const urlValue = config.transform.toURL(value);
					params.set(config.urlKey, urlValue);
				} else {
					params.set(config.urlKey, String(value));
				}
			}
		});
	}

	// Add map parameters
	if (state.map) {
		Object.entries(MAP_STATE_TO_URL_CONFIG).forEach(
			([stateKey, config]) => {
				const value = (state.map as any)[stateKey];

				if (value !== undefined && value !== null) {
					if (config.transform?.toURL) {
						// Handle special case for opacity
						if (stateKey === 'opacity') {
							try {
								const opacityParams = JSON.parse(
									config.transform.toURL(value)
								);
								Object.entries(opacityParams).forEach(
									([key, val]) => {
										params.set(key, val as string);
									}
								);
							} catch (error) {
								console.error(
									'Error processing opacity params:',
									error
								);
							}
						} else {
							params.set(
								config.urlKey,
								config.transform.toURL(value)
							);
						}
					} else {
						if (
							typeof value === 'object' &&
							!Array.isArray(value)
						) {
						} else {
							params.set(config.urlKey, String(value));
						}
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
 * Hook to synchronize URL state with Redux state bidirectionally
 */
export const useUrlState = () => {
	const dispatch = useAppDispatch();
	const hasProcessedUrlState = useRef(false);
	const isUpdatingUrl = useRef(false);
	const state = useAppSelector((state) => state);

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
				dispatch(
					setClimateVariable(
						newState.climateVariable
							.data as ClimateVariableConfigInterface
					)
				);
			}

			// Apply map state with a slight delay to ensure climate variable is ready
			setTimeout(() => {
				if (newState.map) {
					// Handle frequency special case by updating the climate variable
					if (newState.map.frequency) {
						dispatch(
							updateClimateVariable({
								frequency: newState.map.frequency,
							})
						);
					}

					// Apply other map state properties
					const { frequency, opacity, ...otherMapState } =
						newState.map;

					// Apply each property individually to prevent issues
					Object.entries(otherMapState).forEach(([key, value]) => {
						if (value !== undefined) {
							switch (key) {
								case 'variable':
									if (typeof value === 'string') {
										dispatch(setVariable(value));
									}
									break;
								case 'decade':
									if (typeof value === 'string') {
										dispatch(setDecade(value));
									}
									break;
								case 'interactiveRegion':
									if (typeof value === 'string') {
										dispatch(setInteractiveRegion(value));
									}
									break;
								case 'timePeriodEnd':
									// Make sure we have a valid number array before dispatching
									if (
										Array.isArray(value) &&
										value.length > 0 &&
										value.every(
											(item) => typeof item === 'number'
										)
									) {
										dispatch(
											setTimePeriodEnd(value as number[])
										);
									}
									break;
								case 'thresholdValue':
									if (typeof value === 'number') {
										dispatch(setThresholdValue(value));
									}
									break;
								case 'mapColor':
									if (typeof value === 'string') {
										dispatch(setMapColor(value));
									}
									break;
							}
						}
					});

					// Handle opacity separately since it's a nested object
					if (opacity) {
						if (opacity.mapData !== undefined) {
							dispatch(
								setOpacity({
									key: 'mapData',
									value: opacity.mapData * 100,
								})
							);
						}
						if (opacity.labels !== undefined) {
							dispatch(
								setOpacity({
									key: 'labels',
									value: opacity.labels * 100,
								})
							);
						}
					}
				}

				isUpdatingUrl.current = false;
			}, 100);
		} catch (error) {
			console.error('Error processing URL state:', error);
			hasProcessedUrlState.current = true;
			isUpdatingUrl.current = false;
		}
	}, [dispatch]);

	// Sync state changes to URL
	useEffect(() => {
		if (!hasProcessedUrlState.current || isUpdatingUrl.current) return;

		const timeoutId = setTimeout(() => {
			syncStateToUrl(state);
		}, 300);

		return () => clearTimeout(timeoutId);
	}, [state]);

	const updateUrl = useCallback(() => {
		syncStateToUrl(state);
	}, [state]);

	return { updateUrl };
};

// Export action creators map for external use if needed
export const mapActionCreators = {
	variable: setVariable,
	decade: setDecade,
	interactiveRegion: setInteractiveRegion,
	timePeriodEnd: setTimePeriodEnd,
	thresholdValue: setThresholdValue,
	mapColor: setMapColor,
	opacity: setOpacity,
};
