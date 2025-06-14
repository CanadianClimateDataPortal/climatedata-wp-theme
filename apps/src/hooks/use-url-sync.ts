import { useEffect, useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useLocale } from '@/hooks/use-locale';
import { setOpacity, setTimePeriodEnd, setDataset, setVariableList, setVariableListLoading, setMapCoordinates } from '@/features/map/map-slice';
import { setClimateVariable } from '@/store/climate-variable-slice';
import { ClimateVariables } from '@/config/climate-variables.config';
import { ClimateVariableConfigInterface, InteractiveRegionOption } from '@/types/climate-variable-interface';
import { fetchTaxonomyData, fetchPostsData } from '@/services/services';
import { initializeUrlSync, setUrlParamsLoaded } from '@/features/url-sync/url-sync-slice';
import { normalizePostData } from '@/lib/format';
import { store } from '@/app/store';
import { CANADA_CENTER, DEFAULT_ZOOM } from '@/lib/constants';

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

	// Climate variable state
	const climateVariableData = useAppSelector((state) => state.climateVariable.data);
	
	// Helper function to add climate variable parameters to URL
	const addClimateVariableParamsToUrl = (
		params: URLSearchParams,
		climateData: ClimateVariableConfigInterface,
		defaultConfig: ClimateVariableConfigInterface | null
	) => {
		// Always include variable ID
		if (climateData.id) {
			params.set('var', climateData.id);
		}
		
		// Only add version if it's not the default
		if (climateData.version) {
			const defaultVersion = defaultConfig?.version;
			if (climateData.version !== defaultVersion) {
				params.set('ver', climateData.version);
			}
		}
		
		// Only add threshold if the variable supports thresholds AND has a value
		if (climateData.threshold && 
			(defaultConfig?.thresholds || defaultConfig?.threshold)) {
			params.set('th', climateData.threshold.toString());
		}
		
		// Only add frequency if it's not the default
		if (climateData.frequency) {
			const defaultFrequency = defaultConfig?.frequency;
			if (climateData.frequency !== defaultFrequency) {
				params.set('freq', climateData.frequency);
			}
		}
		
		if (climateData.scenario) {
			params.set('scen', climateData.scenario);
		}
		
		// Only include scenario comparison parameters if enabled
		if (climateData.scenarioCompare === true) {
			params.set('cmp', '1');
			
			if (climateData.scenarioCompareTo) {
				params.set('cmpTo', climateData.scenarioCompareTo);
			}
		}
		
		// Add interactive region
		if (climateData.interactiveRegion) {
			const defaultRegion = defaultConfig?.interactiveRegion;
			if (climateData.interactiveRegion !== defaultRegion) {
				params.set('region', climateData.interactiveRegion);
			}
		}
		
		if (climateData.dataValue) {
			const defaultDataValue = defaultConfig?.dataValue;
			if (climateData.dataValue !== defaultDataValue) {
				params.set('dataVal', climateData.dataValue);
			}
		}
		
		// Add color scheme
		if (climateData.colourScheme) {
			const defaultColourScheme = defaultConfig?.colourScheme;
			if (climateData.colourScheme !== defaultColourScheme) {
				params.set('clr', climateData.colourScheme);
			}
		}
		
		if (climateData.colourType) {
			const defaultColourType = defaultConfig?.colourType;
			if (climateData.colourType !== defaultColourType) {
				params.set('clrType', climateData.colourType);
			}
		}
		
		if (climateData.averagingType) {
			const defaultAveragingType = defaultConfig?.averagingType;
			if (climateData.averagingType !== defaultAveragingType) {
				params.set('avg', climateData.averagingType);
			}
		}

		// Add date range
		if (climateData.dateRange && 
			climateData.dateRange.length > 0) {
			const defaultDateRange = defaultConfig?.dateRange;
			const currentDateRangeStr = climateData.dateRange.join(',');
			const defaultDateRangeStr = defaultDateRange?.join(',');
			
			if (currentDateRangeStr !== defaultDateRangeStr) {
				params.set('dateRange', currentDateRangeStr);
			}
		}
	};
	
	// Helper function to add map-only parameters
	const addMapOnlyParamsToUrl = (
		params: URLSearchParams
	) => {
		// Dataset 
		if (dataset && dataset.term_id) {
			params.set('dataset', dataset.term_id.toString());
		}
		
		// Opacity
		if (opacity) {
			if (opacity.mapData !== undefined) {
				const urlOpacityValue = Math.round(opacity.mapData * 100);
				params.set('dataOpacity', urlOpacityValue.toString());
			}
			
			if (opacity.labels !== undefined) {
				const urlOpacityValue = Math.round(opacity.labels * 100);
				params.set('labelOpacity', urlOpacityValue.toString());
			}
		}
		
		if (mapCoordinates) {
			params.set('lat', mapCoordinates.lat.toFixed(5));
			params.set('lng', mapCoordinates.lng.toFixed(5));
			params.set('zoom', mapCoordinates.zoom.toString());
		}
	};
	
	const haveParamsChanged = (params: URLSearchParams): boolean => {
		if (typeof window === 'undefined') return false;
		
		const currentParams = new URLSearchParams(window.location.search);
		const currentKeys = Array.from(currentParams.keys());
		const newKeys = Array.from(params.keys());
		
		if (currentKeys.length !== newKeys.length) return true;
		
		for (const key of newKeys) {
			if (key === 'lat' || key === 'lng') {
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
		isInitialized
	]);

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

		if (params.has('ver'))
			newConfig.version = params.get('ver') || undefined;
		if (params.has('th')) {
			if (matchedVariable.thresholds || matchedVariable.threshold) {
				newConfig.threshold = params.get('th') || undefined;
			}
		}
		if (params.has('freq'))
			newConfig.frequency = params.get('freq') || undefined;
		if (params.has('scen'))
			newConfig.scenario = params.get('scen') || undefined;
		if (params.has('cmp'))
			newConfig.scenarioCompare = params.get('cmp') === '1';
		if (params.has('cmpTo') && params.get('cmp') === '1')
			newConfig.scenarioCompareTo = params.get('cmpTo') || undefined;
		
		if (params.has('region'))
			newConfig.interactiveRegion = params.get('region') as InteractiveRegionOption;
		
		if (params.has('dataVal'))
			newConfig.dataValue = params.get('dataVal') || undefined;
		
		if (params.has('clr'))
			newConfig.colourScheme = params.get('clr') || undefined;
		
		if (params.has('clrType'))
			newConfig.colourType = params.get('clrType') || undefined;
		if (params.has('avg'))
			newConfig.averagingType = params.get('avg') as any;

		if (params.has('dateRange')) {
			const dateRangeStr = params.get('dateRange');
			if (dateRangeStr) {
				newConfig.dateRange = dateRangeStr.split(',');
				
				const dateRange = dateRangeStr.split(',');
				if (dateRange.length > 1) {
					const endYear = parseInt(dateRange[1]);
					if (!isNaN(endYear)) {
						dispatch(setTimePeriodEnd([endYear]));
					}
				}
			}
		} else if (params.has('period') && matchedVariable.dateRangeConfig) {
			const period = parseInt(params.get('period') || '');
			const interval = matchedVariable.dateRangeConfig.interval || 30;

			if (!isNaN(period)) {
				newConfig.dateRange = [
					(period - interval).toString(),
					period.toString()
				];

				dispatch(setTimePeriodEnd([period]));
			}
		}

		dispatch(
			setClimateVariable(
				newConfig as ClimateVariableConfigInterface
			)
		);
	};

	const setMapOpacityFromUrlParams = (params: URLSearchParams) => {
		if (params.has('dataOpacity')) {
			const dataOpacityStr = params.get('dataOpacity');
			if (dataOpacityStr) {
				const opacityNum = parseInt(dataOpacityStr);
				if (!isNaN(opacityNum)) {
					dispatch(
						setOpacity({
							key: 'mapData',
							value: opacityNum,
						})
					);
				}
			}
		}

		if (params.has('labelOpacity')) {
			const labelOpacityStr = params.get('labelOpacity');
			if (labelOpacityStr) {
				const opacityNum = parseInt(labelOpacityStr);
				if (!isNaN(opacityNum)) {
					dispatch(
						setOpacity({
							key: 'labels',
							value: opacityNum,
						})
					);
				}
			}
		}
	};
	
	const setMapCoordinatesFromUrlParams = (params: URLSearchParams) => {
		const lat = params.get('lat');
		const lng = params.get('lng');
		const zoom = params.get('zoom');
		
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

	const setDatasetFromUrlParams = async (params: URLSearchParams) => {
		const datasetParam = params.get('dataset');
		
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

	// Initialize the app with the first variable from the dataset
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
						
						params.set('var', matchingConfig.id);
						
						if (matchingConfig.version) {
							params.set('ver', matchingConfig.version);
						} else if (matchingConfig.versions?.length) {
							params.set('ver', matchingConfig.versions[0]);
						}
						
						if (matchingConfig.threshold) {
							params.set('th', matchingConfig.threshold.toString());
						}
						
						if (matchingConfig.scenario) {
							params.set('scen', matchingConfig.scenario);
						} else if (matchingConfig.versions && matchingConfig.versions[0] && matchingConfig.scenarios) {
							const firstVersion = matchingConfig.versions[0];
							const scenarios = typeof matchingConfig.scenarios === 'object' ? 
								matchingConfig.scenarios[firstVersion as keyof typeof matchingConfig.scenarios] : 
								matchingConfig.scenarios;
								
							if (Array.isArray(scenarios) && scenarios.length > 0) {
								params.set('scen', scenarios[0]);
							}
						}
						
						if (matchingConfig.interactiveRegion) {
							params.set('region', matchingConfig.interactiveRegion);
						}
						
						if (matchingConfig.dateRange && matchingConfig.dateRange.length > 0) {
							params.set('dateRange', matchingConfig.dateRange.join(','));
						}

						const coords = CANADA_CENTER as [number, number] || [62.51231793838694, -98.48144531250001];

						params.set('dataset', firstDataset.term_id.toString());
						params.set('dataOpacity', '100');
						params.set('labelOpacity', '100');
						params.set('lat', coords[0].toFixed(5));
						params.set('lng', coords[1].toFixed(5));
						params.set('zoom', DEFAULT_ZOOM.toString());

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

	useEffect(() => {
		if (isInitialized || urlProcessingCompleteRef.current) return;
		const params = new URLSearchParams(window.location.search);

		dispatch(initializeUrlSync());

		// If no URL parameters or only opacity params, initialize with defaults
		if (params.toString().length === 0 || 
			(params.has('dataOpacity') && params.has('labelOpacity') && params.size === 2)) {
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
				const varId = params.get('var');
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
				
				// Process map opacity
				setMapOpacityFromUrlParams(params);
				
				// Process map coordinates and zoom
				setMapCoordinatesFromUrlParams(params);
				
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

	useEffect(() => {
		if (!isInitialized || isUpdatingFromMapRef.current) return;
		if (climateVariableData) {
			updateUrlWithDebounce();
		}
	}, [climateVariableData, opacity, dataset, updateUrlWithDebounce, isInitialized]);
	
	useEffect(() => {
		if (!isInitialized || isUpdatingFromMapRef.current) return;
		
		if (mapCoordinates && typeof window !== 'undefined') {
			if (updateTimeoutRef.current !== null) {
				window.clearTimeout(updateTimeoutRef.current);
			}
			
			updateTimeoutRef.current = window.setTimeout(() => {
				const params = new URLSearchParams(window.location.search);
				
				params.set('lat', mapCoordinates.lat.toFixed(5));
				params.set('lng', mapCoordinates.lng.toFixed(5));
				params.set('zoom', mapCoordinates.zoom.toString());
				
				const currentParams = new URLSearchParams(window.location.search);
				const currentLat = parseFloat(currentParams.get('lat') || '0');
				const currentLng = parseFloat(currentParams.get('lng') || '0');
				const currentZoom = parseInt(currentParams.get('zoom') || '0');
				
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