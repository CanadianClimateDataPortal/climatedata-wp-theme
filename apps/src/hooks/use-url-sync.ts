import { useEffect, useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setOpacity, setTimePeriodEnd, setDataset } from '@/features/map/map-slice';
import { setClimateVariable } from '@/store/climate-variable-slice';
import { ClimateVariables } from '@/config/climate-variables.config';
import { ClimateVariableConfigInterface, InteractiveRegionOption } from '@/types/climate-variable-interface';
import { TaxonomyData } from '@/types/types';
import { fetchTaxonomyData } from '@/services/services';
import { initializeUrlSync, setUrlParamsLoaded } from '@/features/url-sync/url-sync-slice';

/**
 * Synchronizes state with URL params from climate variable state
 * and some map-specific properties like opacity
 */
export const useUrlSync = () => {
	const updateTimeoutRef = useRef<number | null>(null);
	const urlProcessingCompleteRef = useRef<boolean>(false);
	const dispatch = useAppDispatch();

	// Get the URL sync state
	const isInitialized = useAppSelector((state) => state.urlSync.isInitialized);

	// Map state selectors
	const opacity = useAppSelector((state) => state.map.opacity);
	const dataset = useAppSelector((state) => state.map.dataset);

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
		
		// Only add scenario if it's not the default
		if (climateData.scenario) {
			const defaultScenario = defaultConfig?.scenario;
			if (climateData.scenario !== defaultScenario) {
				params.set('scen', climateData.scenario);
			}
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
		// Opacity
		if (opacity) {
			if (opacity.mapData !== undefined) {
				params.set(
					'dataOpacity',
					Math.round(opacity.mapData * 100).toString()
				);
			}
			if (opacity.labels !== undefined) {
				params.set(
					'labelOpacity',
					Math.round(opacity.labels * 100).toString()
				);
			}
		}
		
		// Dataset 
		if (dataset?.dataset_type) {
			params.set('dataset', dataset.dataset_type);
		}
	};
	
	const updateUrlWithDebounce = useCallback(() => {
		if (typeof window === 'undefined' || !isInitialized) return;
		
		if (updateTimeoutRef.current !== null) {
			window.clearTimeout(updateTimeoutRef.current);
		}
		
		updateTimeoutRef.current = window.setTimeout(() => {
			const params = new URLSearchParams();
			
			// First, add all climate variable parameters
			if (climateVariableData) {
				// Find the default config for the current variable
				const defaultConfig = climateVariableData.id 
					? ClimateVariables.find(config => config.id === climateVariableData.id) || null 
					: null;
				
				addClimateVariableParamsToUrl(params, climateVariableData, defaultConfig);
			}
			
			// Then add map-only parameters
			addMapOnlyParamsToUrl(params);

			// Update URL without navigation
			const newUrl = `${window.location.pathname}?${params.toString()}`;
			window.history.replaceState({}, '', newUrl);
			
			updateTimeoutRef.current = null;
		}, 200); // Reduced delay for more responsive updates
	}, [
		climateVariableData,
		opacity,
		dataset,
		isInitialized
	]);

	const setClimateVariableFromUrlParams = (
		params: URLSearchParams,
		matchedVariable: ClimateVariableConfigInterface
	) => {
		const newConfig: Partial<ClimateVariableConfigInterface> = {
			...matchedVariable,
		};

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
		const dataOpacity = params.get('dataOpacity');
		const labelOpacity = params.get('labelOpacity');

		if (dataOpacity || labelOpacity) {
			if (dataOpacity) {
				const opacityNum = parseInt(dataOpacity);
				if (!isNaN(opacityNum)) {
					dispatch(
						setOpacity({
							key: 'mapData',
							value: opacityNum / 100,
						})
					);
				}
			}

			if (labelOpacity) {
				const opacityNum = parseInt(labelOpacity);
				if (!isNaN(opacityNum)) {
					dispatch(
						setOpacity({
							key: 'labels',
							value: opacityNum / 100,
						})
					);
				}
			}
		}
	};

	const setDatasetFromUrlParams = async (params: URLSearchParams) => {
		const datasetType = params.get('dataset');
		if (datasetType) {
			try {
				// Fetch actual dataset objects
				const datasets = await fetchTaxonomyData('datasets', 'map');
				
				// Find dataset with matching type
				const matchedDataset = datasets.find(
					(dataset) => dataset.dataset_type === datasetType
				);
				
				if (matchedDataset) {
					// Create a complete dataset object
					dispatch(setDataset(matchedDataset));
					return matchedDataset;
				} else {
					// Fallback to basic dataset object if no match found
					const basicDataset: TaxonomyData = {
						term_id: 0,
						title: { en: datasetType },
						dataset_type: datasetType
					};
					dispatch(setDataset(basicDataset));
					return basicDataset;
				}
			} catch (error) {
				console.error('Error fetching datasets:', error);
				// Fallback
				const basicDataset: TaxonomyData = {
					term_id: 0,
					title: { en: datasetType },
					dataset_type: datasetType
				};
				dispatch(setDataset(basicDataset));
				return basicDataset;
			}
		}
		return null;
	};

	useEffect(() => {
		if (isInitialized || urlProcessingCompleteRef.current) return;
		const params = new URLSearchParams(window.location.search);

		dispatch(initializeUrlSync());

		// If no URL parameters, mark as loaded and exit
		if (params.toString().length === 0) {
			urlProcessingCompleteRef.current = true;
			dispatch(setUrlParamsLoaded(false));
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
		if (!isInitialized) return;
		updateUrlWithDebounce();
	}, [
		climateVariableData,
		opacity,
		dataset,
		updateUrlWithDebounce,
		isInitialized
	]);

	// Clean up timeout on unmount
	useEffect(() => {
		return () => {
			if (updateTimeoutRef.current !== null) {
				window.clearTimeout(updateTimeoutRef.current);
			}
		};
	}, []);
};