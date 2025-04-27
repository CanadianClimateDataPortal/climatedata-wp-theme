import { useEffect, useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
	setTimePeriodEnd,
	setVariable,
	setDecade,
	setThresholdValue,
	setInteractiveRegion,
	setMapColor,
	setOpacity,
} from '@/features/map/map-slice';
import { setClimateVariable } from '@/store/climate-variable-slice';
import { ClimateVariables } from '@/config/climate-variables.config';
import { ClimateVariableConfigInterface, InteractiveRegionOption } from '@/types/climate-variable-interface';
import { MapItemsOpacity, ApiPostData } from '@/types/types';

/**
 * Synchronizes state with URL params with priority given to climate variable state
 */
export const useUrlSync = () => {
	const hasInitialized = useRef(false);
	const updateTimeoutRef = useRef<number | null>(null);
	const dispatch = useAppDispatch();

	// Map state selectors
	const timePeriodEnd = useAppSelector((state) => state.map.timePeriodEnd);
	const variable = useAppSelector((state) => state.map.variable);
	const decade = useAppSelector((state) => state.map.decade);
	const thresholdValue = useAppSelector((state) => state.map.thresholdValue);
	const mapInteractiveRegion = useAppSelector((state) => state.map.interactiveRegion);
	const mapColor = useAppSelector((state) => state.map.mapColor);
	const opacity = useAppSelector((state) => state.map.opacity);
	const dataset = useAppSelector((state) => state.map.dataset);

	// Climate variable state
	const climateVariableData = useAppSelector((state) => state.climateVariable.data);
	
	const updateUrlWithDebounce = useCallback(() => {
		if (typeof window === 'undefined' || !hasInitialized.current) return;
		
		if (updateTimeoutRef.current !== null) {
			window.clearTimeout(updateTimeoutRef.current);
		}
		
		updateTimeoutRef.current = window.setTimeout(() => {
			// Find the default config for the current variable
			const defaultConfig = climateVariableData?.id 
				? ClimateVariables.find(config => config.id === climateVariableData.id) || null 
				: null;
			
			const params = new URLSearchParams();
			
			// Climate variable parameters take precedence
			if (climateVariableData) {
				// Always include variable ID
				if (climateVariableData.id) {
					params.set('var', climateVariableData.id);
				}
				
				// Only add version if it's not the default
				if (climateVariableData.version) {
					const defaultVersion = defaultConfig?.version;
					if (climateVariableData.version !== defaultVersion) {
						params.set('ver', climateVariableData.version);
					}
				}
				
				// Only add threshold if the variable supports thresholds AND has a value
				if (climateVariableData.threshold && 
					(defaultConfig?.thresholds || defaultConfig?.threshold)) {
					params.set('th', climateVariableData.threshold.toString());
				}
				
				// Only add frequency if it's not the default
				if (climateVariableData.frequency) {
					const defaultFrequency = defaultConfig?.frequency;
					if (climateVariableData.frequency !== defaultFrequency) {
						params.set('freq', climateVariableData.frequency);
					}
				}
				
				// Only add scenario if it's not the default
				if (climateVariableData.scenario) {
					const defaultScenario = defaultConfig?.scenario;
					if (climateVariableData.scenario !== defaultScenario) {
						params.set('scen', climateVariableData.scenario);
					}
				}
				
				// Only include scenario comparison parameters if enabled
				if (climateVariableData.scenarioCompare === true) {
					params.set('cmp', '1');
					
					if (climateVariableData.scenarioCompareTo) {
						params.set('cmpTo', climateVariableData.scenarioCompareTo);
					}
				}
				
				// Always use region, not mapRegion
				if (climateVariableData.interactiveRegion) {
					const defaultRegion = defaultConfig?.interactiveRegion;
					if (climateVariableData.interactiveRegion !== defaultRegion) {
						params.set('region', climateVariableData.interactiveRegion);
					}
				}
				
				if (climateVariableData.dataValue) {
					const defaultDataValue = defaultConfig?.dataValue;
					if (climateVariableData.dataValue !== defaultDataValue) {
						params.set('dataVal', climateVariableData.dataValue);
					}
				}
				
				// Always use clr, not color
				if (climateVariableData.colourScheme) {
					const defaultColourScheme = defaultConfig?.colourScheme;
					if (climateVariableData.colourScheme !== defaultColourScheme) {
						params.set('clr', climateVariableData.colourScheme);
					}
				}
				
				if (climateVariableData.colourType) {
					const defaultColourType = defaultConfig?.colourType;
					if (climateVariableData.colourType !== defaultColourType) {
						params.set('clrType', climateVariableData.colourType);
					}
				}
				
				if (climateVariableData.averagingType) {
					const defaultAveragingType = defaultConfig?.averagingType;
					if (climateVariableData.averagingType !== defaultAveragingType) {
						params.set('avg', climateVariableData.averagingType);
					}
				}
	
				// Use dateRange from climate variable state instead of period/decade
				if (climateVariableData.dateRange && 
					climateVariableData.dateRange.length > 0) {
					const defaultDateRange = defaultConfig?.dateRange;
					const currentDateRangeStr = climateVariableData.dateRange.join(',');
					const defaultDateRangeStr = defaultDateRange?.join(',');
					
					if (currentDateRangeStr !== defaultDateRangeStr) {
						params.set('dateRange', currentDateRangeStr);
					}
				}
			}
	
			// Map-only parameters (that don't duplicate climate variable state)
			// Only include decade if not already represented by dateRange
			if (decade && (!climateVariableData || !climateVariableData.dateRange)) {
				params.set('decade', decade);
			}
	
			// Only include thresholdValue if it's needed and doesn't duplicate threshold
			if (thresholdValue !== undefined && 
				(!climateVariableData || !climateVariableData.threshold)) {
				params.set('threshold', thresholdValue.toString());
			}
	
			// Add mapVar only if climate variable is not set
			if (variable && (!climateVariableData || !climateVariableData.id)) {
				const variableValue = typeof variable === 'string'
					? variable
					: (variable as ApiPostData).id.toString();
				params.set('mapVar', variableValue);
			}
	
			// Add region parameter (not mapRegion) if region from climate variable is not set
			if (mapInteractiveRegion && 
				(!climateVariableData || !climateVariableData.interactiveRegion)) {
				// Always use region parameter, not mapRegion for consistency
				params.set('region', mapInteractiveRegion);
			}
	
			// Only add color if climate variable doesn't have colourScheme
			if (mapColor && 
				(!climateVariableData || !climateVariableData.colourScheme)) {
				// Always use clr parameter, not color for consistency
				params.set('clr', mapColor);
			}
	
			// Handle opacity (map-only)
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
			
			// Include dataset information if available
			if (dataset?.dataset_type) {
				params.set('dataset', dataset.dataset_type);
			}
	
			// Update URL without navigation
			const newUrl = `${window.location.pathname}?${params.toString()}`;
			window.history.replaceState({}, '', newUrl);
			
			updateTimeoutRef.current = null;
		}, 200); // Reduced delay for more responsive updates
	}, [
		climateVariableData,
		timePeriodEnd,
		variable,
		decade,
		thresholdValue,
		mapInteractiveRegion,
		mapColor,
		opacity,
		dataset,
	]);

	// Process URL params on initial load
	useEffect(() => {
		if (hasInitialized.current) return;

		const params = new URLSearchParams(window.location.search);

		// Check if we have any params to process
		if (params.toString().length === 0) {
			hasInitialized.current = true;
			return;
		}

		// Process climate variable params first
		const varId = params.get('var');
		if (varId) {
			const matchedVariable = ClimateVariables.find(
				(config) => config.id === varId
			);
			if (matchedVariable) {
				// Create a new config object based on the matched variable and URL params
				const newConfig: Partial<ClimateVariableConfigInterface> = {
					...matchedVariable,
				};

				// Update with other URL params
				if (params.has('ver'))
					newConfig.version = params.get('ver') || undefined;
				if (params.has('th')) {
					// Only add threshold if the variable supports thresholds
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
				else if (params.has('mapRegion'))
					newConfig.interactiveRegion = params.get('mapRegion') as InteractiveRegionOption;
				if (params.has('dataVal'))
					newConfig.dataValue = params.get('dataVal') || undefined;
				if (params.has('clr'))
					newConfig.colourScheme = params.get('clr') || undefined;
				else if (params.has('color'))
					newConfig.colourScheme = params.get('color') || undefined;
				if (params.has('clrType'))
					newConfig.colourType = params.get('clrType') || undefined;
				if (params.has('avg'))
					newConfig.averagingType = params.get('avg') as any;

				// Handle dateRange or period
				if (params.has('dateRange')) {
					// Use dateRange directly if available
					const dateRangeStr = params.get('dateRange');
					if (dateRangeStr) {
						newConfig.dateRange = dateRangeStr.split(',');
					}
				} else if (params.has('period') && matchedVariable.dateRangeConfig) {
					// Or calculate from period and interval
					const period = parseInt(params.get('period') || '');
					const interval = matchedVariable.dateRangeConfig.interval || 30;

					if (!isNaN(period)) {
						newConfig.dateRange = [
							(period - interval).toString(),
							period.toString()
						];

						// Also update timePeriodEnd to keep them in sync
						dispatch(setTimePeriodEnd([period]));
					}
				}

				// Set the climate variable with the merged config
				dispatch(
					setClimateVariable(
						newConfig as ClimateVariableConfigInterface
					)
				);
			}
		}

		// Process map-only params (that don't duplicate climate variable state)
		const mapVar = params.get('mapVar');
		if (mapVar && !varId) dispatch(setVariable(mapVar));

		const decadeParam = params.get('decade');
		if (decadeParam) dispatch(setDecade(decadeParam));

		const thresholdParam = params.get('threshold');
		if (thresholdParam) {
			const threshold = parseInt(thresholdParam);
			if (!isNaN(threshold)) dispatch(setThresholdValue(threshold));
		}

		// Process interactive region consistently using 'region' parameter
		const regionParam = params.get('region');
		if (regionParam && !varId) {
			dispatch(setInteractiveRegion(regionParam));
		} else {
			// For backward compatibility
			const mapRegion = params.get('mapRegion');
			if (mapRegion && !params.has('region') && !varId) {
				dispatch(setInteractiveRegion(mapRegion));
			}
		}

		// Process color consistently using 'clr' parameter
		const clrParam = params.get('clr');
		if (clrParam && !varId) {
			dispatch(setMapColor(clrParam));
		} else {
			// For backward compatibility
			const colorParam = params.get('color');
			if (colorParam && !params.has('clr') && !varId) {
				dispatch(setMapColor(colorParam));
			}
		}

		// Handle opacity
		const dataOpacity = params.get('dataOpacity');
		const labelOpacity = params.get('labelOpacity');

		if (dataOpacity || labelOpacity) {
			const opacityPayload: MapItemsOpacity = { ...opacity };

			if (dataOpacity) {
				const opacityNum = parseInt(dataOpacity);
				if (!isNaN(opacityNum)) {
					opacityPayload.mapData = opacityNum / 100;
				}
			}

			if (labelOpacity) {
				const opacityNum = parseInt(labelOpacity);
				if (!isNaN(opacityNum)) {
					opacityPayload.labels = opacityNum / 100;
				}
			}

			// Update both opacity values at once
			if (opacityPayload.mapData !== undefined) {
				dispatch(
					setOpacity({
						key: 'mapData',
						value: opacityPayload.mapData * 100,
					})
				);
			}

			if (opacityPayload.labels !== undefined) {
				dispatch(
					setOpacity({
						key: 'labels',
						value: opacityPayload.labels * 100,
					})
				);
			}
		}

		hasInitialized.current = true;
	}, [dispatch, opacity]);

	// Trigger URL update when state changes
	useEffect(() => {
		if (!hasInitialized.current) return;
		updateUrlWithDebounce();
	}, [
		timePeriodEnd,
		variable,
		decade,
		thresholdValue,
		mapInteractiveRegion,
		mapColor,
		opacity,
		climateVariableData,
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