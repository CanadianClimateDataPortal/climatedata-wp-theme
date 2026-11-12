import React, {
	useCallback,
	useContext,
	useMemo,
} from 'react';
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
	ForecastDisplay,
	ForecastType,
	GridCoordinates,
	GridRegion,
	InteractiveRegionOption,
} from '@/types/climate-variable-interface';
import RasterPrecalculatedClimateVariable from '@/lib/raster-precalculated-climate-variable';
import RasterPrecalculatedWithDailyFormatsClimateVariable from '@/lib/raster-precalculated-with-daily-formats-climate-variable';
import RasterAnalyzeClimateVariable from '@/lib/raster-analyze-climate-variable';
import SeaLevelClimateVariable from '@/lib/sea-level-climate-variable';
import StationClimateVariable from '@/lib/station-climate-variable';
import StationDataClimateVariable from '@/lib/station-data-climate-variable';
import AllowanceClimateVariable from '@/lib/allowance-climate-variable';
import S2DClimateVariable from '@/lib/s2d-climate-variable';
import { isFrequencyTypeS2D } from '@/types/assertions';
import {
	averagingTypeOfferedBy,
	colourSchemeOfferedBy,
	colourTypeOfferedBy,
	dataValueOfferedBy,
	dateRangeOfferedBy,
	formatUTCDate,
	isFrequencyOffered,
	scenarioCompareToOfferedBy,
	thresholdValueForSameLabel,
} from '@/lib/utils';
import { DEFAULT_COLOUR_SCHEMES } from '@/lib/constants';
import SectionContext from '@/context/section-provider';
import ReturnPeriodClimateVariable from '@/lib/return-period-climate-variable';

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
	setSelectedPeriods: (periods: Date[]) => void;
	setDateRange: (dates: string[]) => void;
	setPercentiles: (percentiles: string[]) => void;
	setMissingData: (missingData: string) => void;
	setModel: (model: string) => void;
	setFileFormat: (fileFormat: FileFormatType) => void;
	resetFileFormat: () => void;
	setDecimalPlace: (decimalPlace: number) => void;
	setSelectedPoints: (gridCoordinates: GridCoordinates) => void;
	addSelectedPoints: (gridCoordinate: GridCoordinates) => void;
	removeSelectedPoint: (gid: string) => void;
	resetSelectedPoints: () => void;
	setSelectedRegion: (region: GridRegion) => void;
	resetSelectedRegion: () => void;
	setForecastType: (forecastType: ForecastType) => void;
	setForecastDisplay: (display: ForecastDisplay) => void;
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
	S2DClimateVariable: S2DClimateVariable,
	ReturnPeriodClimateVariable: ReturnPeriodClimateVariable,
};

/**
 * Provides the ClimateVariable context to the component tree.
 */
export const ClimateVariableProvider: React.FC<{
	children: React.ReactNode;
}> = ({ children }) => {
	const dispatch = useAppDispatch();
	const section = useContext(SectionContext);

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
				const newData: ClimateVariableConfigInterface = {
					...matchedVariable,
					postId: variable.postId,
					title: variable.title,
					datasetType: dataset?.dataset_type,
				};
				/**
				 * Each block below builds its own instance from newData, as the
				 * blocks before it left it.
				 */
				const newVariableClass =
					CLIMATE_VARIABLE_CLASS_MAP[newData.class];

				// CLIM-1452: on a change of climate variable, each block below
				// keeps a value of the old variable when the new variable offers
				// it. Otherwise it leaves the field unset, so the getter gives
				// the default and the URL writer leaves the parameter out.
				// A block comment that ends with a `[data-part="..."]` line names
				// the sidebar control of the field, by its `data-part` attribute.
				//
				// Version. This block runs first, because the scenarios and the
				// sea level date range config depend on the version.
				// `[data-part="VersionsDropdown"]`
				const previousVersion = climateVariableData?.version;
				if (previousVersion && newVariableClass) {
					const newVariable = new newVariableClass(newData);
					if (newVariable.getVersions().includes(previousVersion)) {
						newData.version = previousVersion;
					}
				}

				// Scenario, among the scenarios of the version kept above.
				// `[data-part="EmissionScenariosControl"]`
				const previousScenario = climateVariableData?.scenario;
				if (previousScenario && newVariableClass) {
					const newVariable = new newVariableClass(newData);
					if (newVariable.getScenarios().includes(previousScenario)) {
						newData.scenario = previousScenario;
					}
				}

				// Scenario comparison. The checkbox and the compared scenario go
				// together, because a checked box alone shows no comparison map.
				// The main scenario comes from the block above, so it can be the
				// default rather than the old one. A variable with no scenarios,
				// such as S2D, gets no comparison.
				// `[data-part="EmissionScenariosControl"]`
				const previousScenarioCompareTo =
					climateVariableData?.scenarioCompareTo;
				if (
					climateVariableData?.scenarioCompare === true &&
					previousScenarioCompareTo &&
					newVariableClass
				) {
					const newVariable = new newVariableClass(newData);
					const scenarioCompareTo = scenarioCompareToOfferedBy(
						newVariable.getScenarios(),
						newVariable.getScenario(),
						previousScenarioCompareTo
					);
					if (scenarioCompareTo) {
						newData.scenarioCompare = true;
						newData.scenarioCompareTo = scenarioCompareTo;
					}
				}

				// Interactive region, with the check of getInteractiveRegion().
				// `[data-part="InteractiveRegionsMenuItem"]`
				const previousRegion = climateVariableData?.interactiveRegion;
				if (previousRegion && newVariableClass) {
					const newVariable = new newVariableClass(newData);
					if (
						newVariable.getInteractiveRegionConfig()?.[
							previousRegion
						]
					) {
						newData.interactiveRegion = previousRegion;
					}
				}

				// Frequency, as FrequencySelect offers it in this section. This
				// block skips S2D on either side on purpose. An S2D variable
				// inherits a fallback frequency config that accepts `ann`, a code
				// the S2D sidebar does not offer. A projection config accepts the
				// S2D codes `months` and `seasons`, which the map control shows
				// only as group labels, never as a value. The S2D period block
				// below handles S2D.
				// `[data-part="FrequenciesDropdown"]`
				const previousFrequency = climateVariableData?.frequency;
				if (previousFrequency && newVariableClass) {
					const newVariable = new newVariableClass(newData);
					const frequencyConfig = newVariable.getFrequencyConfig();
					if (
						!(climateVariable instanceof S2DClimateVariable) &&
						!(newVariable instanceof S2DClimateVariable) &&
						frequencyConfig &&
						isFrequencyOffered(
							frequencyConfig,
							section,
							previousFrequency
						)
					) {
						newData.frequency = previousFrequency;
					}
				}

				// S2D forecast type and display. Every S2D variable offers the
				// same fixed lists, and only those lists can set these fields.
				// So a stored value is valid for any S2D target, whatever the
				// old variable.
				// `[data-part="ForecastTypeDropdownS2D"]`
				const previousForecastType = climateVariableData?.forecastType;
				const previousForecastDisplay =
					climateVariableData?.forecastDisplay;
				if (
					(previousForecastType || previousForecastDisplay) &&
					newVariableClass
				) {
					const newVariable = new newVariableClass(newData);
					if (newVariable instanceof S2DClimateVariable) {
						if (previousForecastType) {
							newData.forecastType = previousForecastType;
						}
						if (previousForecastDisplay) {
							newData.forecastDisplay = previousForecastDisplay;
						}
					}
				}

				// Threshold. The value differs per variable for the same label,
				// so the old value maps to its label through the old variable,
				// then the label maps to the value of the new variable.
				// `[data-part="ThresholdValuesDropdown"]`
				const previousThreshold = climateVariableData?.threshold;
				const previousVariableClass = climateVariableData
					? CLIMATE_VARIABLE_CLASS_MAP[climateVariableData.class]
					: undefined;
				if (
					previousThreshold &&
					climateVariableData &&
					previousVariableClass &&
					newVariableClass
				) {
					const previousVariable = new previousVariableClass(
						climateVariableData
					);
					const newVariable = new newVariableClass(newData);
					const threshold = thresholdValueForSameLabel(
						previousVariable.getThresholds(),
						newVariable.getThresholds(),
						previousThreshold
					);
					if (threshold) {
						newData.threshold = threshold;
					}
				}

				// S2D frequency and time period, from one S2D variable to
				// another. The period needs its frequency, so both go together.
				// The date range needs no check, because TimePeriodsControlS2D
				// snaps a date range that matches no period to the first one.
				const previousS2DFrequency = climateVariableData?.frequency;
				const previousDateRange = climateVariableData?.dateRange;
				if (
					(previousS2DFrequency || previousDateRange) &&
					climateVariableData &&
					previousVariableClass &&
					newVariableClass
				) {
					const previousVariable = new previousVariableClass(
						climateVariableData
					);
					const newVariable = new newVariableClass(newData);
					if (
						previousVariable instanceof S2DClimateVariable &&
						newVariable instanceof S2DClimateVariable
					) {
						if (
							previousS2DFrequency &&
							isFrequencyTypeS2D(previousS2DFrequency)
						) {
							newData.frequency = previousS2DFrequency;
						}
						if (previousDateRange) {
							newData.dateRange = previousDateRange;
						}
					}
				}

				// Projection time period. It skips S2D on either side, because
				// an S2D variable inherits a fallback range that a projection
				// pair would pass. The block sets only dateRange, and the time
				// period controls then update timePeriodEnd in the map state.
				// When the block keeps no range, newData keeps the date range of
				// its static config, which only allowance sets.
				if (
					previousDateRange &&
					climateVariableData &&
					previousVariableClass &&
					newVariableClass
				) {
					const previousVariable = new previousVariableClass(
						climateVariableData
					);
					const newVariable = new newVariableClass(newData);
					if (
						!(previousVariable instanceof S2DClimateVariable) &&
						!(newVariable instanceof S2DClimateVariable)
					) {
						const dateRange = dateRangeOfferedBy(
							newVariable.getDateRangeConfig(),
							newVariable.isTimePeriodARange(),
							previousDateRange
						);
						if (dateRange) {
							newData.dateRange = dateRange;
						}
					}
				}

				// Data value, colour scheme, colour type and averaging, each on
				// its own. Their getters return a stored value unchecked, so the
				// check happens here. A value counts as offered only when its
				// control shows: a hidden control would leave the value in
				// effect with no way to undo it. The colour type follows the
				// colour scheme kept here.
				if (
					newVariableClass &&
					(climateVariableData?.dataValue ||
						climateVariableData?.colourScheme ||
						climateVariableData?.averagingType)
				) {
					const newVariable = new newVariableClass(newData);
					const dataValue = dataValueOfferedBy(
						newVariable.hasDelta(),
						climateVariableData?.dataValue
					);
					if (dataValue) {
						newData.dataValue = dataValue;
					}
					const colourScheme = colourSchemeOfferedBy(
						newVariable.getColourOptionsStatus(),
						newVariable.getCustomColourSchemes(),
						DEFAULT_COLOUR_SCHEMES,
						climateVariableData?.colourScheme
					);
					if (colourScheme) {
						newData.colourScheme = colourScheme;
					}
					const colourType = colourTypeOfferedBy(
						colourScheme,
						climateVariableData?.colourType
					);
					if (colourType) {
						newData.colourType = colourType;
					}
					const averagingType = averagingTypeOfferedBy(
						newVariable instanceof S2DClimateVariable,
						newVariable.getAveragingOptions(),
						climateVariableData?.averagingType
					);
					if (averagingType) {
						newData.averagingType = averagingType;
					}
				}

				dispatch(setClimateVariable(newData));
			} else {
				throw new Error(`No matching variable found for id: ${variable.id}`);
			}
		},
		[
			climateVariable,
			climateVariableData,
			dispatch,
			section,
		]
	);

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

			const validScenario =
				climateVariable?.getValidScenarioForVersion(version);
			const updatePayload: Partial<ClimateVariableConfigInterface> = {
				version,
			};

			if (
				validScenario &&
				(!currentData.scenario ||
					currentData.scenario !== validScenario)
			) {
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

	const setSelectedPeriods = useCallback(
		(selectedPeriods: Date[]) => {
			const periodStrings = selectedPeriods.map(
				period => formatUTCDate(period, 'yyyy-MM')
			);

			periodStrings.sort();

			dispatch(
				updateClimateVariable({
					selectedPeriods: periodStrings,
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

	const resetFileFormat = useCallback(
		() => {
			dispatch(
				updateClimateVariable({
					fileFormat: null,
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

	const setForecastType = useCallback(
		(forecastType: ForecastType) => {
			dispatch(
				updateClimateVariable({
					forecastType,
				})
			);
		},
		[dispatch]
	);

	const setForecastDisplay = useCallback(
		(forecastDisplay: ForecastDisplay) => {
			dispatch(
				updateClimateVariable({
					forecastDisplay,
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
		resetFileFormat,
		setDecimalPlace,
		setSelectedPoints,
		addSelectedPoints,
		removeSelectedPoint,
		resetSelectedPoints,
		setSelectedPeriods,
		setSelectedRegion,
		resetSelectedRegion,
		setForecastType,
		setForecastDisplay,
	};

	return (
		<ClimateVariableContext.Provider value={value}>
			{children}
		</ClimateVariableContext.Provider>
	);
};
