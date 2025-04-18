import { useEffect, useRef } from 'react';
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
import {
	setClimateVariable,
	updateClimateVariable,
} from '@/store/climate-variable-slice';
import { ClimateVariables } from '@/config/climate-variables.config';
import { ClimateVariableConfigInterface } from '@/types/climate-variable-interface';
import { MapItemsOpacity, ApiPostData } from '@/types/types';

/**
 * Synchronizes state with URL params
 */
export const useUrlSync = () => {
	const hasInitialized = useRef(false);
	const dispatch = useAppDispatch();

	// Map state selectors
	const timePeriodEnd = useAppSelector((state) => state.map.timePeriodEnd);
	const variable = useAppSelector((state) => state.map.variable);
	const decade = useAppSelector((state) => state.map.decade);
	const thresholdValue = useAppSelector((state) => state.map.thresholdValue);
	const interactiveRegion = useAppSelector(
		(state) => state.map.interactiveRegion
	);
	const frequency = useAppSelector((state) => state.map.frequency);
	const mapColor = useAppSelector((state) => state.map.mapColor);
	const opacity = useAppSelector((state) => state.map.opacity);

	// Climate variable state
	const climateVariableData = useAppSelector(
		(state) => state.climateVariable.data
	);

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
				if (params.has('th'))
					newConfig.threshold = params.get('th') || undefined;
				if (params.has('freq'))
					newConfig.frequency = params.get('freq') || undefined;
				if (params.has('scen'))
					newConfig.scenario = params.get('scen') || undefined;
				if (params.has('cmp'))
					newConfig.scenarioCompare = params.get('cmp') === '1';
				if (params.has('cmpTo'))
					newConfig.scenarioCompareTo =
						params.get('cmpTo') || undefined;
				if (params.has('region'))
					newConfig.interactiveRegion = params.get('region') as any;
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

		// Process map params
		const mapVar = params.get('mapVar');
		if (mapVar) dispatch(setVariable(mapVar));

		const decadeParam = params.get('decade');
		if (decadeParam) dispatch(setDecade(decadeParam));

		const thresholdParam = params.get('threshold');
		if (thresholdParam) {
			const threshold = parseInt(thresholdParam);
			if (!isNaN(threshold)) dispatch(setThresholdValue(threshold));
		}

		const mapRegion = params.get('mapRegion');
		if (mapRegion) dispatch(setInteractiveRegion(mapRegion));

		const mapFreq = params.get('mapFreq');
		if (mapFreq) dispatch(updateClimateVariable({ frequency: mapFreq }));

		const colorParam = params.get('color');
		if (colorParam) dispatch(setMapColor(colorParam));

		// Handle timePeriodEnd - the key parameter we're focusing on
		const periodParam = params.get('period');
		if (periodParam) {
			const period = parseInt(periodParam);
			if (!isNaN(period)) dispatch(setTimePeriodEnd([period]));
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
	}, [dispatch]);

	useEffect(() => {
		// Skip the first render
		if (!hasInitialized.current) {
			return;
		}

		const params = new URLSearchParams(window.location.search);

		// Map state params
		// Handle variable which can be either string or ApiPostData
		if (variable) {
			const variableValue =
				typeof variable === 'string'
					? variable
					: (variable as ApiPostData).id.toString();
			params.set('mapVar', variableValue);
		}

		if (decade) params.set('decade', decade);
		if (thresholdValue !== undefined)
			params.set('threshold', thresholdValue.toString());
		if (interactiveRegion) params.set('mapRegion', interactiveRegion);
		if (frequency) params.set('mapFreq', frequency);
		if (mapColor) params.set('color', mapColor);

		// Handle timePeriodEnd
		if (timePeriodEnd && timePeriodEnd.length > 0) {
			params.set('period', timePeriodEnd[0].toString());
		}

		// Handle opacity
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

		// Climate variable params
		if (climateVariableData) {
			if (climateVariableData.id)
				params.set('var', climateVariableData.id);
			if (climateVariableData.version)
				params.set('ver', climateVariableData.version);
			if (climateVariableData.threshold)
				params.set('th', climateVariableData.threshold.toString());
			if (climateVariableData.frequency)
				params.set('freq', climateVariableData.frequency);
			if (climateVariableData.scenario)
				params.set('scen', climateVariableData.scenario);
			if (climateVariableData.scenarioCompare !== undefined) {
				params.set(
					'cmp',
					climateVariableData.scenarioCompare ? '1' : '0'
				);
			}
			if (climateVariableData.scenarioCompareTo)
				params.set('cmpTo', climateVariableData.scenarioCompareTo);
			if (climateVariableData.interactiveRegion)
				params.set('region', climateVariableData.interactiveRegion);
			if (climateVariableData.dataValue)
				params.set('dataVal', climateVariableData.dataValue);
			if (climateVariableData.colourScheme)
				params.set('clr', climateVariableData.colourScheme);
			if (climateVariableData.colourType)
				params.set('clrType', climateVariableData.colourType);
			if (climateVariableData.averagingType)
				params.set('avg', climateVariableData.averagingType);
			if (
				climateVariableData.dateRange &&
				climateVariableData.dateRange.length > 0
			) {
				params.set(
					'dateRange',
					climateVariableData.dateRange.join(',')
				);
			}
		}

		// Update URL without navigation
		const newUrl = `${window.location.pathname}?${params.toString()}`;
		window.history.replaceState({}, '', newUrl);
	}, [
		timePeriodEnd,
		variable,
		decade,
		thresholdValue,
		interactiveRegion,
		frequency,
		mapColor,
		opacity,
		climateVariableData,
	]);
};
