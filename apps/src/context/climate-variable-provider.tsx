import React, { useCallback, useMemo } from 'react';
import { ClimateVariables } from '@/config/climate-variables.config';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import ClimateVariableContext from '@/hooks/use-climate-variable';
import { PostData, TaxonomyData } from '@/types/types';
import {
	setClimateVariable,
	updateClimateVariable,
	updateClimateVariableAnalysisFieldValue,
} from '@/store/climate-variable-slice';
import ClimateVariableBase from '@/lib/climate-variable-base';
import {
	AveragingType,
	ClimateVariableConfigInterface,
	ClimateVariableInterface,
	FileFormatType,
	GridCoordinates,
	GridRegion,
	InteractiveRegionOption,
} from '@/types/climate-variable-interface';
import RasterPrecalculatedClimateVariable from '@/lib/raster-precalculated-climate-variable';
import RasterPrecalculatedWithDailyFormatsClimateVariable
	from '@/lib/raster-precalculated-with-daily-formats-climate-variable';
import RasterAnalyzeClimateVariable from '@/lib/raster-analyze-climate-variable';
import SeaLevelClimateVariable from '@/lib/sea-level-climate-variable';
import StationClimateVariable from '@/lib/station-climate-variable';
import StationDataClimateVariable from "@/lib/station-data-climate-variable";
import AllowanceClimateVariable from '@/lib/allowance-climate-variable';

export type ClimateVariableContextType = {
	climateVariable: ClimateVariableInterface | null;
	selectClimateVariable: (variable: PostData, dataset?: TaxonomyData) => void;
	setVersion: (version: string) => void;
	setScenario: (scenario: string) => void;
	setScenarioCompare: (scenarioCompare: boolean) => void;
	setScenarioCompareTo: (scenarioCompareTo: string | null) => void;
	setAnalyzeScenarios: (analyzeScenarios: string[]) => void;
	setThreshold: (threshold: string) => void;
	setInteractiveRegion: (interactiveRegion: InteractiveRegionOption) => void;
	setDataValue: (dataValue: string) => void;
	setColourScheme: (colourScheme: string) => void;
	setColourType: (colourType: string) => void;
	setFrequency: (frequency: string) => void;
	setAnalysisFieldValue: (key: string, value: string | null) => void;
	setAveragingType: (type: AveragingType) => void;
	setDateRange: (dates: string[]) => void;
	setPercentiles: (percentiles: string[]) => void;
	setMissingData: (missingData: string) => void;
	setModel: (model: string) => void;
	setFileFormat: (fileFormat: FileFormatType) => void;
	setDecimalPlace: (decimalPlace: number) => void;
	setSelectedPoints: (gridCoordinates: GridCoordinates) => void;
	addSelectedPoints: (gridCoordinate: GridCoordinates) => void;
	removeSelectedPoint: (gid: string) => void;
	resetSelectedPoints: () => void;
	setSelectedRegion: (region: GridRegion) => void;
	resetSelectedRegion: () => void;
};

type ClassMapType = Record<
	string,
	new (arg: ClimateVariableConfigInterface) => ClimateVariableInterface
>;

/**
 * Maps climate variable class names to their corresponding class implementations.
 */
const CLIMATE_VARIABLE_CLASS_MAP: ClassMapType = {
	AllowanceClimateVariable: AllowanceClimateVariable,
	ClimateVariableBase: ClimateVariableBase,
	RasterPrecalculatedClimateVariable: RasterPrecalculatedClimateVariable,
	RasterPrecalculatedWithDailyFormatsClimateVariable:
		RasterPrecalculatedWithDailyFormatsClimateVariable,
	RasterAnalyzeClimateVariable: RasterAnalyzeClimateVariable,
	SeaLevelClimateVariable: SeaLevelClimateVariable,
	StationClimateVariable: StationClimateVariable,
	StationDataClimateVariable: StationDataClimateVariable,
};

/**
 * Provides the ClimateVariable context to the component tree.
 */
export const ClimateVariableProvider: React.FC<{
	children: React.ReactNode;
}> = ({ children }) => {
	const dispatch = useAppDispatch();

	const { data: climateVariableData } = useAppSelector(
		(state) => state.climateVariable
	);

	/**
	 * Returns an instance of a climate variable class, derived from the provided climate variable data.
	 *
	 * The climate variable class is determined by mapping the `class` property of `climateVariableData`
	 * using the `CLIMATE_VARIABLE_CLASS_MAP`. If the specified class is not found in the map, an error
	 * is thrown.
	 */
	const climateVariable = useMemo((): ClimateVariableInterface | null => {
		if (!climateVariableData) return null;

		const climateVariableClass =
			CLIMATE_VARIABLE_CLASS_MAP[climateVariableData.class];
		if (!climateVariableClass) {
			throw new Error(
				`Invalid climate variable class: ${climateVariableData.class}`
			);
		}
		return new climateVariableClass(climateVariableData);
	}, [climateVariableData]);

	/**
	 * A callback function to select and dispatch a climate variable
	 * based on the provided input variable and optional dataset.
	 *
	 * @callback selectClimateVariable
	 * @param {PostData} variable - The input data containing details of a climate variable to be selected.
	 * @param {TaxonomyData} [dataset] - Optional dataset that may provide additional context.
	 *
	 * @throws {Error} Throws an error if no matching variable is found in the `ClimateVariables` array.
	 */
	const selectClimateVariable = useCallback(
		(variable: PostData, dataset?: TaxonomyData) => {
			const matchedVariable = ClimateVariables.find(
				(config) => config.id === variable.id
			);

			if (matchedVariable) {
				// Combine important properties from API with the config data.
				dispatch(setClimateVariable({
					...matchedVariable,
					postId: variable.postId,
					title: variable.title,
					datasetType: dataset?.dataset_type,
				}));
			} else {
				throw new Error(`No matching variable found for id: ${variable.id}`);
			}
		}, [dispatch]);

	/**
	 * Updates the version of the climate variable and dispatches the updated information.
	 *
	 * @callback setVersion
	 * @param {string} version - The new version to be updated.
	 * @returns {void}
	 */
	const setVersion = useCallback(
		(version: string) => {
			// Get current climate variable data
			const currentData = climateVariableData;
			if (!currentData || currentData.version === version) return;

			const validScenario = climateVariable?.getValidScenarioForVersion(version);
			const updatePayload: Partial<ClimateVariableConfigInterface> = {
				version
			};

			if (validScenario && (!currentData.scenario || currentData.scenario !== validScenario)) {
				updatePayload.scenario = validScenario;
			}

			dispatch(updateClimateVariable(updatePayload));
		},
		[dispatch, climateVariableData, climateVariable]
	);

	const setAnalyzeScenarios = useCallback(
		(scenarios: string[]) => {
			dispatch(
				updateClimateVariable({
					analyzeScenarios: scenarios,
				})
			);
		},
		[dispatch]
	);

	const setScenario = useCallback(
		(scenario: string) => {
			dispatch(
				updateClimateVariable({
					scenario,
				})
			);
		},
		[dispatch]
	);

	const setScenarioCompare = useCallback(
		(scenarioCompare: boolean) => {
			dispatch(
				updateClimateVariable({
					scenarioCompare,
				})
			);
		},
		[dispatch]
	);

	const setScenarioCompareTo = useCallback(
		(scenarioCompareTo: string | null) => {
			dispatch(
				updateClimateVariable({
					scenarioCompareTo,
				})
			);
		},
		[dispatch]
	);

	const setThreshold = useCallback(
		(threshold: string) => {
			dispatch(
				updateClimateVariable({
					threshold,
				})
			);
		},
		[dispatch]
	);

	const setInteractiveRegion = useCallback(
		(interactiveRegion: InteractiveRegionOption) => {
			dispatch(
				updateClimateVariable({
					interactiveRegion,
				})
			);
		},
		[dispatch]
	);

	const setDataValue = useCallback(
		(dataValue: string) => {
			dispatch(
				updateClimateVariable({
					dataValue,
				})
			);
		},
		[dispatch]
	);

	const setColourScheme = useCallback(
		(colourScheme: string) => {
			dispatch(
				updateClimateVariable({
					colourScheme,
				})
			);
		},
		[dispatch]
	);

	const setColourType = useCallback(
		(colourType: string) => {
			dispatch(
				updateClimateVariable({
					colourType,
				})
			);
		},
		[dispatch]
	);

	const setFrequency = useCallback(
		(frequency: string) => {
			dispatch(
				updateClimateVariable({
					frequency,
				})
			);
		},
		[dispatch]
	);

	const setAnalysisFieldValue = useCallback(
		(key: string, value: string | null) => {
			dispatch(
				updateClimateVariableAnalysisFieldValue({
					key,
					value,
				})
			);
		},
		[dispatch]
	);

	const setAveragingType = useCallback(
		(averagingType: AveragingType) => {
			dispatch(
				updateClimateVariable({
					averagingType,
				})
			);
		},
		[dispatch]
	);

	const setDateRange = useCallback(
		(dates: string[]) => {
			dispatch(
				updateClimateVariable({
					dateRange: dates,
				})
			);
		},
		[dispatch]
	);

	const setPercentiles = useCallback(
		(percentiles: string[]) => {
			dispatch(
				updateClimateVariable({
					percentiles,
				})
			);
		},
		[dispatch]
	);

	const setMissingData = useCallback(
		(missingData: string) => {
			dispatch(
				updateClimateVariable({
					missingData,
				})
			);
		},
		[dispatch]
	);

	const setModel = useCallback(
		(model: string) => {
			dispatch(
				updateClimateVariable({
					model,
				})
			);
		},
		[dispatch]
	);

	const setFileFormat = useCallback(
		(fileFormat: FileFormatType) => {
			dispatch(
				updateClimateVariable({
					fileFormat,
				})
			);
		},
		[dispatch]
	);

	const setDecimalPlace = useCallback(
		(decimalPlace: number) => {
			dispatch(updateClimateVariable({ decimalPlace }));
		},
		[dispatch]
	);

	const setSelectedPoints = useCallback(
		(gridCoordinates: GridCoordinates) => {
			dispatch(
				updateClimateVariable({
					selectedPoints: gridCoordinates,
				})
			);
		},
		[dispatch]
	);

	const addSelectedPoints = useCallback(
		(gridCoordinates: GridCoordinates) => {
			if (!climateVariableData) return;
			const { selectedPoints } = climateVariableData;
			dispatch(
				updateClimateVariable({
					selectedPoints: {
						...selectedPoints,
						...gridCoordinates,
					},
					// Also reset selectedRegion
					selectedRegion: null,
				})
			);

		},
		[dispatch, climateVariableData]
	);

	const removeSelectedPoint = useCallback(
		(gid: string) => {
			if (!climateVariableData) return;
			const { [gid]: removed, ...rest } =
				climateVariableData.selectedPoints ?? {};
			dispatch(
				updateClimateVariable({
					selectedPoints: rest,
				})
			);
		},
		[dispatch, climateVariableData]
	);

	const resetSelectedPoints = useCallback(() => {
		if (!climateVariableData) return;
		dispatch(
			updateClimateVariable({
				selectedPoints: {},
			})
		);
	}, [dispatch, climateVariableData]);

	const setSelectedRegion = useCallback(
		(region: GridRegion) => {
			dispatch(
				updateClimateVariable({
					selectedRegion: region,
					// Also reset selectedPoints
					selectedPoints: {},
				})
			);
		},
		[dispatch]
	);

	const resetSelectedRegion = useCallback(
		() => {
			dispatch(
				updateClimateVariable({
					selectedRegion: null,
				})
			);
		},
		[dispatch]
	);

	const value: ClimateVariableContextType = {
		climateVariable,
		selectClimateVariable,
		setVersion,
		setScenario,
		setScenarioCompare,
		setScenarioCompareTo,
		setAnalyzeScenarios,
		setThreshold,
		setInteractiveRegion,
		setDataValue,
		setColourScheme,
		setColourType,
		setFrequency,
		setAnalysisFieldValue,
		setAveragingType,
		setDateRange,
		setPercentiles,
		setMissingData,
		setModel,
		setFileFormat,
		setDecimalPlace,
		setSelectedPoints,
		addSelectedPoints,
		removeSelectedPoint,
		resetSelectedPoints,
		setSelectedRegion,
		resetSelectedRegion,
	};

	return (
		<ClimateVariableContext.Provider value={value}>
			{children}
		</ClimateVariableContext.Provider>
	);
};
