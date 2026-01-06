import { useCallback, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useLocale } from '@/hooks/use-locale';
import {
	selectLowSkillVisibility,
	setDataset,
	setLowSkillVisibility,
	setMapCoordinates,
	setOpacity,
	setTimePeriodEnd,
	setVariableList,
	setVariableListLoading,
} from '@/features/map/map-slice';
import { setClimateVariable } from '@/store/climate-variable-slice';
import { ClimateVariables } from '@/config/climate-variables.config';
import {
	AveragingType,
	ClimateVariableConfigInterface,
	InteractiveRegionOption,
} from '@/types/climate-variable-interface';
import { fetchPostsData, fetchTaxonomyData } from '@/services/services';
import { initializeUrlSync, setUrlParamsLoaded } from '@/features/url-sync/url-sync-slice';
import { normalizePostData } from '@/lib/format';
import { store } from '@/app/store';
import { CANADA_CENTER, DEFAULT_ZOOM } from '@/lib/constants';
import { MapItemsOpacity } from '@/types/types';
import {
	AssertionError,
	assertIsForecastDisplay,
	assertIsForecastType,
} from '@/types/assertions';

/**
 * Name of URL parameters.
 */
const URL_PARAMS = {
	VARIABLE_ID: 'var',
	VERSION: 'ver',
	THRESHOLD: 'th',
	FREQUENCY: 'freq',
	SCENARIO: 'scen',
	DO_COMPARE: 'cmp',
	COMPARE_TO: 'cmpTo',
	INTERACTIVE_REGION: 'region',
	DATA_VALUE: 'dataVal',
	COLOUR_SCHEME: 'clr',
	COLOUR_TYPE: 'clrType',
	AVERAGING_TYPE: 'avg',
	DATE_RANGE: 'dateRange',
	FORECAST_TYPE: 'fcastType',
	FORECAST_DISPLAY: 'fcastDisp',
	LOW_SKILL_MASKED: 'maskLowSkill',
	DATASET: 'dataset',
	DATA_OPACITY: 'dataOpacity',
	LABEL_OPACITY: 'labelOpacity',
	PERIOD: 'period',
	LATITUDE: 'lat',
	LONGITUDE: 'lng',
	ZOOM_LEVEL: 'zoom',
} as const;

/**
 * Synchronizes state with URL params from climate variable state
 * and some map-specific properties like opacity
 */
export const useUrlSync = () => {
	const updateTimeoutRef = useRef<number | null>(null);
	const urlProcessingCompleteRef = useRef<boolean>(false);
	const lastUrlUpdateRef = useRef<string>('');
	const isUpdatingFromMapRef = useRef<boolean>(false);
	const dispatch = useAppDispatch();
	const { locale } = useLocale();

	// Get the URL sync state
	const isInitialized = useAppSelector((state) => state.urlSync.isInitialized);

	// Map state selectors
	const opacity = useAppSelector((state) => state.map.opacity);
	const dataset = useAppSelector((state) => state.map.dataset);
	const mapCoordinates = useAppSelector((state) => state.map.mapCoordinates);
	const lowSkillVisibility = useAppSelector(selectLowSkillVisibility());

	// Climate variable state
	const climateVariableData = useAppSelector((state) => state.climateVariable.data);

	/**
	 * Save a climate variable configuration in a URL parameter list.
	 *
	 * No existing parameters are removed. If a value is equal to a default
	 * value, no parameter is added.
	 *
	 * @param params - URL parameters to augment.
	 * @param climateData - Configuration to save into the parameters.
	 * @param defaultConfig - Default values of the configuration.
	 */
	const addClimateVariableParamsToUrl = (
		params: URLSearchParams,
		climateData: ClimateVariableConfigInterface,
		defaultConfig: ClimateVariableConfigInterface | null
	) => {
		// Always include variable ID
		if (climateData.id) {
			params.set(URL_PARAMS.VARIABLE_ID, climateData.id);
		}

		// Only add threshold if the variable supports thresholds AND has a value
		if (climateData.threshold && 
			(defaultConfig?.thresholds || defaultConfig?.threshold)) {
			params.set(URL_PARAMS.THRESHOLD, climateData.threshold.toString());
		}

		if (climateData.scenario) {
			params.set(URL_PARAMS.SCENARIO, climateData.scenario);
		}
		
		// Only include scenario comparison parameters if enabled
		if (climateData.scenarioCompare === true) {
			params.set(URL_PARAMS.DO_COMPARE, '1');
			
			if (climateData.scenarioCompareTo) {
				params.set(URL_PARAMS.COMPARE_TO, climateData.scenarioCompareTo);
			}
		}

		// Add date range
		if (climateData.dateRange && 
			climateData.dateRange.length > 0) {
			const defaultDateRange = defaultConfig?.dateRange;
			const currentDateRangeStr = climateData.dateRange.join(',');
			const defaultDateRangeStr = defaultDateRange?.join(',');
			
			if (currentDateRangeStr !== defaultDateRangeStr) {
				params.set(URL_PARAMS.DATE_RANGE, currentDateRangeStr);
			}
		}

		// List of configurations that are simply saved as is in the params if
		// their value is different from their default value
		const simpleConfigurations: [keyof ClimateVariableConfigInterface, string][] = [
			['forecastType', URL_PARAMS.FORECAST_TYPE],
			['forecastDisplay', URL_PARAMS.FORECAST_DISPLAY],
			['interactiveRegion', URL_PARAMS.INTERACTIVE_REGION],
			['dataValue', URL_PARAMS.DATA_VALUE],
			['colourScheme', URL_PARAMS.COLOUR_SCHEME],
			['colourType', URL_PARAMS.COLOUR_TYPE],
			['averagingType', URL_PARAMS.AVERAGING_TYPE],
			['version', URL_PARAMS.VERSION],
			['frequency', URL_PARAMS.FREQUENCY],
		];

		for (const [configKey, urlParam] of simpleConfigurations) {
			const defaultValue = defaultConfig?.[configKey];
			const currentValue = climateData[configKey];
			if (currentValue != undefined && currentValue !== defaultValue) {
				params.set(urlParam, currentValue.toString());
			}
		}
	};

	/**
	 * Save in a URL parameter list elements of the Map store.
	 *
	 * No existing parameters are removed.
	 *
	 * @param params - URL parameters to augment.
	 */
	const addMapOnlyParamsToUrl = (
		params: URLSearchParams
	) => {
		// Dataset 
		if (dataset && dataset.term_id) {
			params.set(URL_PARAMS.DATASET, dataset.term_id.toString());
		}
		
		// Opacity
		if (opacity) {
			if (opacity.mapData !== undefined) {
				const urlOpacityValue = Math.round(opacity.mapData * 100);
				params.set(URL_PARAMS.DATA_OPACITY, urlOpacityValue.toString());
			}
			
			if (opacity.labels !== undefined) {
				const urlOpacityValue = Math.round(opacity.labels * 100);
				params.set(URL_PARAMS.LABEL_OPACITY, urlOpacityValue.toString());
			}
		}
		
		if (mapCoordinates) {
			params.set(URL_PARAMS.LATITUDE, mapCoordinates.lat.toFixed(5));
			params.set(URL_PARAMS.LONGITUDE, mapCoordinates.lng.toFixed(5));
			params.set(URL_PARAMS.ZOOM_LEVEL, mapCoordinates.zoom.toString());
		}

		if (lowSkillVisibility === false) {
			params.set(URL_PARAMS.LOW_SKILL_MASKED, '0');
		}
	};

	/**
	 * Return if a list of parameters is different from the current URL's
	 * parameters.
	 *
	 * @param params - The parameters to compare against the current URL.
	 */
	const haveParamsChanged = (params: URLSearchParams): boolean => {
		if (typeof window === 'undefined') return false;
		
		const currentParams = new URLSearchParams(window.location.search);
		const currentKeys = Array.from(currentParams.keys());
		const newKeys = Array.from(params.keys());
		
		if (currentKeys.length !== newKeys.length) return true;
		
		for (const key of newKeys) {
			if (key === URL_PARAMS.LATITUDE || key === URL_PARAMS.LONGITUDE) {
				const currentVal = parseFloat(currentParams.get(key) || '0');
				const newVal = parseFloat(params.get(key) || '0');
				if (Math.abs(currentVal - newVal) > 0.0001) return true;
			} 
			else if (!currentParams.has(key) || currentParams.get(key) !== params.get(key)) {
				return true;
			}
		}
		
		return false;
	};

	/**
	 * Update the window's URL with the current climate variable and map
	 * settings.
	 *
	 * Update is debounced by a few milliseconds to prevent excessive updates.
	 */
	const updateUrlWithDebounce = useCallback(() => {
		if (typeof window === 'undefined' || !isInitialized) return;
		if (!climateVariableData) return; // Only update URL if a variable is selected

		if (updateTimeoutRef.current !== null) {
			window.clearTimeout(updateTimeoutRef.current);
		}

		updateTimeoutRef.current = window.setTimeout(() => {
			const params = new URLSearchParams();

			// Always add climate variable parameters if a variable is selected
			const defaultConfig = climateVariableData.id
				? ClimateVariables.find(config => config.id === climateVariableData.id) || null
				: null;
			addClimateVariableParamsToUrl(params, climateVariableData, defaultConfig);

			// Add map-only parameters
			addMapOnlyParamsToUrl(params);

			// Only update URL if parameters have changed significantly
			if (haveParamsChanged(params)) {
				const newUrl = `${window.location.pathname}?${params.toString()}`;
				if (newUrl !== lastUrlUpdateRef.current) {
					lastUrlUpdateRef.current = newUrl;
					window.history.replaceState({}, '', newUrl);
				}
			}

			updateTimeoutRef.current = null;
		}, 300);
	}, [
		climateVariableData,
		opacity,
		dataset,
		mapCoordinates,
		isInitialized,
		lowSkillVisibility,
	]);

	/**
	 * Update and save a climate variable configuration from a list of URL
	 * parameters.
	 *
	 * The Redux store for the climate variable configuration is updated
	 * directly.
	 *
	 * @param params - URL parameters to update from.
	 * @param matchedVariable - Base configuration of the variable.
	 */
	const setClimateVariableFromUrlParams = (
		params: URLSearchParams,
		matchedVariable: ClimateVariableConfigInterface
	) => {
		const newConfig: Partial<ClimateVariableConfigInterface> = {
			...matchedVariable,
		};

		// Find the matching post data from the variable list if available
		const variableList = store.getState().map.variableList;
		const matchingPostData = variableList.find(post => post.id === matchedVariable.id);
		
		if (matchingPostData) {
			newConfig.postId = matchingPostData.postId;
			newConfig.title = matchingPostData.title;
		}

		if (params.has(URL_PARAMS.VERSION))
			newConfig.version = params.get(URL_PARAMS.VERSION) || undefined;
		if (params.has(URL_PARAMS.THRESHOLD)) {
			if (matchedVariable.thresholds || matchedVariable.threshold) {
				newConfig.threshold = params.get(URL_PARAMS.THRESHOLD) || undefined;
			}
		}
		if (params.has(URL_PARAMS.FREQUENCY))
			newConfig.frequency = params.get(URL_PARAMS.FREQUENCY) || undefined;
		if (params.has(URL_PARAMS.SCENARIO))
			newConfig.scenario = params.get(URL_PARAMS.SCENARIO) || undefined;
		if (params.has(URL_PARAMS.DO_COMPARE))
			newConfig.scenarioCompare = params.get(URL_PARAMS.DO_COMPARE) === '1';
		if (params.has(URL_PARAMS.COMPARE_TO) && params.get(URL_PARAMS.DO_COMPARE) === '1')
			newConfig.scenarioCompareTo = params.get(URL_PARAMS.COMPARE_TO) || undefined;
		
		if (params.has(URL_PARAMS.INTERACTIVE_REGION))
			newConfig.interactiveRegion = params.get(URL_PARAMS.INTERACTIVE_REGION) as InteractiveRegionOption;
		
		if (params.has(URL_PARAMS.DATA_VALUE))
			newConfig.dataValue = params.get(URL_PARAMS.DATA_VALUE) || undefined;
		
		if (params.has(URL_PARAMS.COLOUR_SCHEME))
			newConfig.colourScheme = params.get(URL_PARAMS.COLOUR_SCHEME) || undefined;
		
		if (params.has(URL_PARAMS.COLOUR_TYPE))
			newConfig.colourType = params.get(URL_PARAMS.COLOUR_TYPE) || undefined;
		if (params.has(URL_PARAMS.AVERAGING_TYPE))
			newConfig.averagingType = params.get(URL_PARAMS.AVERAGING_TYPE) as AveragingType;

		if (params.has(URL_PARAMS.DATE_RANGE)) {
			const dateRangeStr = params.get(URL_PARAMS.DATE_RANGE);
			if (dateRangeStr) {
				newConfig.dateRange = dateRangeStr.split(',');
				
				const dateRange = dateRangeStr.split(',');
				if (dateRange.length > 1) {
					const endYear = parseInt(dateRange[1]);
					if (!Number.isNaN(endYear)) {
						dispatch(setTimePeriodEnd([endYear]));
					}
				}
			}
		} else if (params.has(URL_PARAMS.PERIOD) && matchedVariable.dateRangeConfig) {
			const period = parseInt(params.get(URL_PARAMS.PERIOD) || '');
			const interval = matchedVariable.dateRangeConfig.interval || 30;

			if (!isNaN(period)) {
				newConfig.dateRange = [
					(period - interval).toString(),
					period.toString()
				];

				dispatch(setTimePeriodEnd([period]));
			}
		}

		if (params.has(URL_PARAMS.FORECAST_TYPE)) {
			try {
				const paramValue = params.get(URL_PARAMS.FORECAST_TYPE) ?? '';
				assertIsForecastType(paramValue);
				newConfig.forecastType = paramValue;
			} catch (error) {
				if (!(error instanceof AssertionError)) {
					const originalError = error as Error;
					throw new Error(
						originalError.message,
						{ cause: originalError },
					);
				}
			}
		}

		if (params.has(URL_PARAMS.FORECAST_DISPLAY)) {
			try {
				const paramValue = params.get(URL_PARAMS.FORECAST_DISPLAY) ?? '';
				assertIsForecastDisplay(paramValue);
				newConfig.forecastDisplay = paramValue;
			} catch (error) {
				if (!(error instanceof AssertionError)) {
					const originalError = error as Error;
					throw new Error(
						originalError.message,
						{ cause: originalError },
					);
				}
			}
		}

		dispatch(
			setClimateVariable(
				newConfig as ClimateVariableConfigInterface
			)
		);
	};

	/**
	 * Update the opacity settings from a list of URL parameters.
	 *
	 * The opacity settings in the Redux store are updated directly.
	 *
	 * @param params - URL parameters to update from.
	 */
	const updateMapOpacityFromUrlParams = (params: URLSearchParams) => {
		const opacities: [keyof MapItemsOpacity, string][] = [
			['mapData', URL_PARAMS.DATA_OPACITY],
			['labels', URL_PARAMS.LABEL_OPACITY],
		];

		for (const [storeKey, urlParam] of opacities) {
			const dataOpacityStr = params.get(urlParam);
			if (dataOpacityStr) {
				const opacityNum = parseInt(dataOpacityStr);
				if (!isNaN(opacityNum)) {
					dispatch(
						setOpacity({
							key: storeKey,
							value: opacityNum,
						})
					);
				}
			}
		}
	};

	/**
	 * Update the map coordinates configurations from a list of URL parameters.
	 *
	 * The map's Redux store is updated directly.
	 *
	 * @param params - URL parameters to update from.
	 */
	const updateMapCoordinatesFromUrlParams = (params: URLSearchParams) => {
		const lat = params.get(URL_PARAMS.LATITUDE);
		const lng = params.get(URL_PARAMS.LONGITUDE);
		const zoom = params.get(URL_PARAMS.ZOOM_LEVEL);
		
		if (lat && lng && zoom) {
			const latNum = parseFloat(lat);
			const lngNum = parseFloat(lng);
			const zoomNum = parseInt(zoom);
			
			if (!isNaN(latNum) && !isNaN(lngNum) && !isNaN(zoomNum)) {
				isUpdatingFromMapRef.current = true;
				
				dispatch(
					setMapCoordinates({
						lat: latNum,
						lng: lngNum,
						zoom: zoomNum
					})
				);
				
				setTimeout(() => {
					isUpdatingFromMapRef.current = false;
				}, 10);
			}
		}
	};

	/**
	 * Update the Map store entries from a list of URL parameters.
	 */
	const updateMapStoreFromUrlParams = (params: URLSearchParams) => {
		updateMapOpacityFromUrlParams(params);
		updateMapCoordinatesFromUrlParams(params);

		if (params.has(URL_PARAMS.LOW_SKILL_MASKED)) {
			const lowSkillNotVisible = params.get(URL_PARAMS.LOW_SKILL_MASKED) === '0';
			dispatch(setLowSkillVisibility({ visible: !lowSkillNotVisible }));
		}
	}

	/**
	 * Load and save the dataset configuration from a list of URL parameters.
	 *
	 * The full configuration of the dataset is loaded using the dataset's id
	 * in the parameters, and the map's Redux store is then updated directly.
	 *
	 * @param params - URL parameters from which to retrieve the dataset's id.
	 */
	const setDatasetFromUrlParams = async (params: URLSearchParams) => {
		const datasetParam = params.get(URL_PARAMS.DATASET);
		
		try {
			// Fetch actual dataset objects
			const datasets = await fetchTaxonomyData('datasets', 'map');

			if (datasetParam) {
				const datasetParamNum = parseInt(datasetParam);
				
				if (!isNaN(datasetParamNum)) {
					const matchedDataset = datasets.find(dataset => dataset.term_id === datasetParamNum);
					
					if (matchedDataset) {
						// Set the matched dataset
						dispatch(setDataset(matchedDataset));
						return matchedDataset;
					}
				}
			}
			
			// If no dataset param or match not found, use the first dataset
			if (datasets.length > 0) {
				dispatch(setDataset(datasets[0]));
				return datasets[0];
			}
			
			return null;
		} catch (error) {
			console.error('Error fetching datasets:', error);
			return null;
		}
	};

	/**
	 * Fill the Redux stores and the window's URL parameters with default values.
	 *
	 * The first dataset and its first variable are used as defaults.
	 *
	 * Other attributes are set using various defaults.
	 */
	const initializeWithDefaults = async () => {
		try {
			// Get the first dataset
			const datasets = await fetchTaxonomyData('datasets', 'map');
			if (!datasets.length) return;
			
			const firstDataset = datasets[0];
			dispatch(setDataset(firstDataset));
			dispatch(setOpacity({ key: 'mapData', value: 100 }));
			dispatch(setOpacity({ key: 'labels', value: 100 }));
			dispatch(setVariableListLoading(true));
			
			try {
				const variables = await fetchPostsData('variables', 'map', firstDataset, {});
				const normalizedVariables = await normalizePostData(variables, locale);
				
				dispatch(setVariableList(normalizedVariables));
				
				if (normalizedVariables.length > 0) {
					const firstVariable = normalizedVariables[0];
					
					// Find matching config by id
					const matchingConfig = ClimateVariables.find(config => 
						config.id === firstVariable.id);
					
					if (matchingConfig) {
						// Set climate variable with dataset context and API data
						const variableWithDataset = {
							...matchingConfig,
							datasetType: firstDataset.dataset_type,
							postId: firstVariable.postId,
							title: firstVariable.title
						};

						// Set the variable
						dispatch(setClimateVariable(variableWithDataset));
						
						const params = new URLSearchParams();
						
						params.set(URL_PARAMS.VARIABLE_ID, matchingConfig.id);
						
						if (matchingConfig.version) {
							params.set(URL_PARAMS.VERSION, matchingConfig.version);
						} else if (matchingConfig.versions?.length) {
							params.set(URL_PARAMS.VERSION, matchingConfig.versions[0]);
						}
						
						if (matchingConfig.threshold) {
							params.set(URL_PARAMS.THRESHOLD, matchingConfig.threshold.toString());
						}
						
						if (matchingConfig.scenario) {
							params.set(URL_PARAMS.SCENARIO, matchingConfig.scenario);
						} else if (matchingConfig.versions && matchingConfig.versions[0] && matchingConfig.scenarios) {
							const firstVersion = matchingConfig.versions[0];
							const scenarios = typeof matchingConfig.scenarios === 'object' ? 
								matchingConfig.scenarios[firstVersion as keyof typeof matchingConfig.scenarios] : 
								matchingConfig.scenarios;
								
							if (Array.isArray(scenarios) && scenarios.length > 0) {
								params.set(URL_PARAMS.SCENARIO, scenarios[0]);
							}
						}
						
						if (matchingConfig.interactiveRegion) {
							params.set(URL_PARAMS.INTERACTIVE_REGION, matchingConfig.interactiveRegion);
						}
						
						if (matchingConfig.dateRange && matchingConfig.dateRange.length > 0) {
							params.set(URL_PARAMS.DATE_RANGE, matchingConfig.dateRange.join(','));
						}

						const coords = CANADA_CENTER as [number, number] || [62.51231793838694, -98.48144531250001];

						params.set(URL_PARAMS.DATASET, firstDataset.term_id.toString());
						params.set(URL_PARAMS.DATA_OPACITY, '100');
						params.set(URL_PARAMS.LABEL_OPACITY, '100');
						params.set(URL_PARAMS.LATITUDE, coords[0].toFixed(5));
						params.set(URL_PARAMS.LONGITUDE, coords[1].toFixed(5));
						params.set(URL_PARAMS.ZOOM_LEVEL, DEFAULT_ZOOM.toString());

						const newUrl = `${window.location.pathname}?${params.toString()}`;
						lastUrlUpdateRef.current = newUrl;
						window.history.replaceState({}, '', newUrl);
					}
				}
			} catch (error) {
				console.error('Error fetching variables:', error);
			} finally {
				dispatch(setVariableListLoading(false));
			}
			
			// Mark as initialized
			urlProcessingCompleteRef.current = true;
			dispatch(setUrlParamsLoaded(true));
		} catch (error) {
			console.error('Error initializing with defaults:', error);
			urlProcessingCompleteRef.current = true;
			dispatch(setUrlParamsLoaded(true));
		}
	};

	/**
	 * Initialize the different stores and URL parameters using the window's
	 * current URL parameters and default values.
	 */
	useEffect(() => {
		if (isInitialized || urlProcessingCompleteRef.current) return;
		const params = new URLSearchParams(window.location.search);

		dispatch(initializeUrlSync());

		// If no URL parameters or only opacity params, initialize with defaults
		if (params.toString().length === 0 ||
			(params.has(URL_PARAMS.DATA_OPACITY) && params.has(URL_PARAMS.LABEL_OPACITY) && params.size === 2)) {
			initializeWithDefaults();
			return;
		}

		// Mark as NOT loaded until processing completes
		dispatch(setUrlParamsLoaded(false));

		// Process URL parameters
		(async () => {
			try {
				// First process dataset
				const selectedDataset = await setDatasetFromUrlParams(params);

				// Then process variable and its parameters
				const varId = params.get(URL_PARAMS.VARIABLE_ID);
				if (varId && selectedDataset) {
					// Fetch variables for this dataset to ensure we have variable data in state
					try {
						const variables = await fetchPostsData('variables', 'map', selectedDataset, {});
						const normalizedVariables = await normalizePostData(variables, locale);
						dispatch(setVariableList(normalizedVariables));
					} catch (error) {
						console.error('Error fetching variables for URL dataset:', error);
					}

					const matchedVariable = ClimateVariables.find(
						(config) => config.id === varId
					);
					if (matchedVariable) {
						// Add dataset type to the variable
						const variableWithDataset = {
							...matchedVariable,
							datasetType: selectedDataset.dataset_type
						};

						// Process all climate variable parameters
						setClimateVariableFromUrlParams(params, variableWithDataset);
					}
				}

				updateMapStoreFromUrlParams(params);

				lastUrlUpdateRef.current = window.location.href;

				// Mark URL parameters as loaded
				urlProcessingCompleteRef.current = true;
				dispatch(setUrlParamsLoaded(true));
			} catch (error) {
				console.error('Error processing URL parameters:', error);
				urlProcessingCompleteRef.current = true;
				dispatch(setUrlParamsLoaded(true));
			}
		})();
	}, [dispatch, isInitialized]);

	/**
	 * Update the URL parameters when some configuration changes.
	 *
	 * Map location changes are ignored (they are treated in another
	 * useEffect()).
	 *
	 * URL is updated with:
	 * - climate variable configuration change
	 * - Map opacity change
	 * - Selected dataset change
	 */
	useEffect(() => {
		if (!isInitialized || isUpdatingFromMapRef.current) return;
		if (climateVariableData) {
			updateUrlWithDebounce();
		}
	}, [climateVariableData, opacity, dataset, updateUrlWithDebounce, isInitialized]);

	/**
	 * Update the window's URL parameters when the map's coordinates or zoom
	 * change.
	 */
	useEffect(() => {
		if (!isInitialized || isUpdatingFromMapRef.current) return;
		
		if (mapCoordinates && typeof window !== 'undefined') {
			if (updateTimeoutRef.current !== null) {
				window.clearTimeout(updateTimeoutRef.current);
			}
			
			updateTimeoutRef.current = window.setTimeout(() => {
				const params = new URLSearchParams(window.location.search);
				
				params.set(URL_PARAMS.LATITUDE, mapCoordinates.lat.toFixed(5));
				params.set(URL_PARAMS.LONGITUDE, mapCoordinates.lng.toFixed(5));
				params.set(URL_PARAMS.ZOOM_LEVEL, mapCoordinates.zoom.toString());
				
				const currentParams = new URLSearchParams(window.location.search);
				const currentLat = parseFloat(currentParams.get(URL_PARAMS.LATITUDE) || '0');
				const currentLng = parseFloat(currentParams.get(URL_PARAMS.LONGITUDE) || '0');
				const currentZoom = parseInt(currentParams.get(URL_PARAMS.ZOOM_LEVEL) || '0');
				
				if (
					Math.abs(currentLat - mapCoordinates.lat) > 0.0001 ||
					Math.abs(currentLng - mapCoordinates.lng) > 0.0001 ||
					currentZoom !== mapCoordinates.zoom
				) {
					const newUrl = `${window.location.pathname}?${params.toString()}`;
					
					// Prevent duplicate updates
					if (newUrl !== lastUrlUpdateRef.current) {
						lastUrlUpdateRef.current = newUrl;
						window.history.replaceState({}, '', newUrl);
					}
				}
				
				updateTimeoutRef.current = null;
			}, 400); // Longer debounce for map movements
		}
	}, [mapCoordinates, isInitialized]);

	// Clean up timeout on unmount
	useEffect(() => {
		return () => {
			if (updateTimeoutRef.current !== null) {
				window.clearTimeout(updateTimeoutRef.current);
			}
		};
	}, []);
};
