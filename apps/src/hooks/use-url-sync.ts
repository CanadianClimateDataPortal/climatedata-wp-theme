import { useEffect, useRef, useCallback } from 'react';
import { useAppSelector } from '@/app/hooks';
import { ClimateVariables } from '@/config/climate-variables.config';
import { ClimateVariableConfigInterface } from '@/types/climate-variable-interface';

/**
 * Synchronizes state with URL params from climate variable state
 * and some map-specific properties like opacity
 */
export const useUrlSync = () => {
	const hasInitialized = useRef(false);
	const updateTimeoutRef = useRef<number | null>(null);

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
		if (typeof window === 'undefined' || !hasInitialized.current) return;
		
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
	]);

	useEffect(() => {
		hasInitialized.current = true;
	}, []);

	// Trigger URL update when state changes
	useEffect(() => {
		if (!hasInitialized.current) return;
		updateUrlWithDebounce();
	}, [
		climateVariableData,
		opacity,
		dataset,
		updateUrlWithDebounce
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