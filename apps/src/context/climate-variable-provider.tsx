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
				 * Class definition we can instantiate throughout this process.
				 */
				const newVariableClass =
					CLIMATE_VARIABLE_CLASS_MAP[newData.class];

				/**
				 * @REMARK CLIM-1500 END This looks good. Planned for parts of this file to be merged in CLIM-1506 (PR #735)
				 * But to be merged we'll need:
				 * - Remove or clarify the comments we've added in the code during CLIM-1500_Spike-Analysis-LOCAL-ONLY
				 * - Confirm and document (in PR 735) what these changes covers (see if we are still missing too)
				 *
				 * *** GENERAL REMARKS ***
				 * - Split between CLIM-1506, CLIM-1507 and CLIM-1508:
				 *   - Need to figure out what's needed, and in which PRs
				 *   - Regarding CLIM-1507
				 *     - ...and (always) keep important parameters in URL Search query, request to have is an hypothesis, we need to confirm whether these changes improves without needing to change URL sync with the store.
				 *       (in other words: the changes here do they fix CLIM-1500 and original issue CLIM-1452 by themselves or we need something further, like the hypothesis of URL Search query is warranted)
				 */

				// CLIM-1452 keep-or-default rule, version only (CLIM-1500 try,
				// VER). Carry the selected version over when the new variable
				// offers it. Otherwise leave it unset: getVersion() then falls
				// to the first offered version, and the URL writer leaves `ver`
				// out. This block runs before the scenario block, because
				// getScenarios() lists the scenarios of the version on newData.
				// `[data-part="VersionsDropdown"]`
				const previousVersion = climateVariableData?.version;
				if (previousVersion && newVariableClass) {
					const newVariable = new newVariableClass(newData);
					if (newVariable.getVersions().includes(previousVersion)) {
						newData.version = previousVersion;
					}
				}

				// CLIM-1452 keep-or-default rule, scenario only (CLIM-1500 try,
				// scenario). Carry the selected scenario over when the new
				// variable offers it for its own version. Otherwise leave it
				// unset: getScenario() then falls to getDefaultScenario(), the
				// preferred scenario (SSP2-4.5 for cmip6, RCP4.5 for cmip5) when
				// the version offers it, else the first one. The URL writer
				// leaves `scen` out, so the sidebar and the URL agree.
				// `[data-part="EmissionScenariosControl"]`
				const previousScenario = climateVariableData?.scenario;
				if (previousScenario && newVariableClass) {
					const newVariable = new newVariableClass(newData);
					if (newVariable.getScenarios().includes(previousScenario)) {
						newData.scenario = previousScenario;
					}
				}

				// CLIM-1452 keep-or-default rule, scenario comparison only
				// (CLIM-1500 try, CMP). Keep Compare scenarios checked and
				// keep the compared scenario when the new variable offers it
				// for its own version and it differs from the main scenario
				// that the sidebar shows, as scenarioCompareToOfferedBy()
				// checks. The main scenario is read from getScenario() after
				// the scenario block above ran, so it is the carried scenario
				// or the default of getDefaultScenario(). The two values travel
				// together.
				// Otherwise leave both unset: the checkbox shows unchecked, and
				// the URL writer leaves `cmp` and `cmpTo` out. A checked box
				// alone would show no comparison map, and on a variable with no
				// scenarios the sidebar hides the checkbox while the URL writer
				// still writes `cmp`. An S2D or a station target gets no carry:
				// S2DClimateVariable overrides getScenarios() to give an empty
				// list, and StationClimateVariable gives an empty scenario
				// config when its own config has none.
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

				// CLIM-1452 keep-or-default rule, interactive region only
				// (CLIM-1500 try, region). Carry the selected region over when
				// the region config of the new variable has it, the same check
				// as getInteractiveRegion(). Otherwise leave it unset: the getter
				// then falls to the first active region, and the URL writer
				// leaves `region` out, so the sidebar and the URL agree.
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

				// CLIM-1452 keep-or-default rule, frequency only (CLIM-1500 try,
				// frequency). Carry the selected frequency over when the frequency
				// config of the new variable offers it in this section, as
				// FrequencySelect renders it. getFrequencyConfig() includes the
				// class fallback for a variable with no frequencyConfig. Otherwise
				// leave it unset: FrequenciesDropdown then shows the default of
				// getDefaultFrequency(), and the URL writer leaves `freq` out.
				// This block skips an S2D target. The S2D sidebar offers its own
				// frequency codes (months, seasons and the decadal codes) from
				// FrequenciesDropdownS2D, not from frequencyConfig. An S2D
				// variable inherits the RasterPrecalculatedClimateVariable
				// fallback config (ANNUAL and MONTHLY), so isFrequencyOffered
				// would accept `ann`, a code the S2D sidebar does not offer. The
				// S2D-PERIOD block below owns the S2D-to-S2D case.
				// `[data-part="FrequenciesDropdown"]`
				const previousFrequency = climateVariableData?.frequency;
				if (previousFrequency && newVariableClass) {
					const newVariable = new newVariableClass(newData);
					const frequencyConfig = newVariable.getFrequencyConfig();
					if (
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

				// CLIM-1452 keep-or-default rule, S2D forecast type and display
				// only (CLIM-1500 try, S2D). Carry both over when the new
				// variable is S2D. Every S2D variable offers the same fixed
				// lists, so no value check is needed. The block does not test
				// the old variable either. Only the S2D dropdowns and the URL
				// sync set these two fields, and both accept only values of
				// those fixed lists. So a stored value is valid for any S2D
				// target, even when the old variable is a projection variable
				// that took it from the URL. Otherwise leave both unset: the
				// getters then return their defaults, and the URL writer leaves
				// `fcastType` and `fcastDisp` out.
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

				// CLIM-1452 keep-or-default rule, threshold only (CLIM-1500 try,
				// TH). Carry the selected threshold over when the new variable
				// offers a threshold with the same label. The value differs per
				// variable, for example rl20tasmax and rl20pr for "1-in-20
				// year", so the old value maps to its label through the old
				// variable, then the label to the new value. The old instance is
				// built from climateVariableData, which the callback already
				// depends on. Otherwise leave it unset: getThreshold() then
				// falls to the first threshold, and the URL writer leaves `th`
				// out.
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

				// CLIM-1452 keep-or-default rule, S2D frequency and time period
				// only (CLIM-1500 try, S2D-PERIOD). Carry both over when the old
				// and the new variable are S2D. The period cannot survive
				// without its frequency, so both go together. The frequency is
				// checked against S2DFrequencyTypes, the list that
				// FrequenciesDropdownS2D offers for every S2D variable. The
				// frequency block above does not cover it, because it skips an
				// S2D target on purpose: the fallback frequency config that an
				// S2D variable inherits would accept codes the S2D sidebar does
				// not offer, and isFrequencyOffered() rejects the decadal codes.
				// The date range is carried as is. TimePeriodsControlS2D snaps a
				// date range that matches no period to the first one.
				// `[data-part="FrequenciesDropdownS2D"]`
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

				// CLIM-1452 keep-or-default rule, projection time period only
				// (CLIM-1500 try, PERIOD). Carry the selected date range over
				// when the time period control of the new variable could have
				// produced it, as dateRangeOfferedBy() checks: both ends inside
				// getDateRangeConfig(), and the shape that isTimePeriodARange()
				// asks for. This block runs after the version block, because
				// the range config of SeaLevelClimateVariable depends on the
				// version. It skips an S2D variable on either side. An S2D
				// variable inherits the RasterPrecalculatedClimateVariable
				// fallback range (1950 to 2100), so a projection pair would
				// pass for an S2D target, and the S2D-PERIOD block above owns
				// the S2D-to-S2D case. Only dateRange is set. The sync effect of
				// TimePeriodsControl and TimePeriodsControlSingle then updates
				// timePeriodEnd in the map state. Otherwise keep the dateRange of
				// the static config, which only allowance sets: getDateRange()
				// then falls to the default range, and the URL writer leaves
				// `dateRange` out.
				// `[data-part=""]`
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

				// CLIM-1452 keep-or-default rule, data value, colour scheme,
				// colour type and averaging (CLIM-1500 try, CLR). Each value is
				// carried on its own, when the new variable offers it. The
				// getters return these stored values unchecked, so the carry
				// does the check. The data value needs hasDelta(), the flag that
				// shows DataValuesControl, as dataValueOfferedBy() checks. The
				// colour scheme needs the Map colours control shown, from
				// getColourOptionsStatus(), and the scheme in the list that
				// ColourSchemeDropdown builds, as colourSchemeOfferedBy() checks.
				// A hidden control means the variable does not offer the scheme,
				// because the scheme would still colour the map with no control
				// to undo it. The colour type follows the carried scheme, as
				// colourTypeOfferedBy() checks, because MapColorsDropdown shows
				// the type only for a scheme other than default. The averaging
				// type needs getAveragingOptions() to include it and a target
				// that is not S2D, as averagingTypeOfferedBy() checks. An S2D
				// variable inherits both options from the fallback of
				// RasterPrecalculatedClimateVariable, but the averaging control
				// of the download wizard shows none for it, and the map app has
				// no averaging control at all. Otherwise leave each unset:
				// the getters then return their defaults, and the URL writer
				// leaves `dataVal`, `clr`, `clrType` and `avg` out.
				// `[data-part=""]`
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
