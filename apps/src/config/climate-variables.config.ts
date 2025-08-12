import {
	AveragingType,
	ClimateVariableConfigInterface,
	ColourType,
	DownloadType,
	FileFormatType,
	FrequencyDisplayModeOption,
	FrequencyType,
	InteractiveRegionDisplay,
	InteractiveRegionOption,
} from '@/types/climate-variable-interface';
import { MapDisplayType } from '@/types/types';

export const ClimateVariables: ClimateVariableConfigInterface[] = [
	/** Test variable */
	{
		id: "test_variable",
		class: "ClimateVariableBase",
		versions: [
			"cmip6",
			"cmip5",
		],
		thresholds: [
			{
				value: "tx_max",
				label: "",
			},
		],
		scenarios: {
			cmip5: [
				"rcp26",
				"rcp45",
				"rcp85",
			],
			cmip6: [
				"ssp126",
				"ssp245",
				"ssp370",
				"ssp585",
			],
		},
		interactiveRegionConfig: {
			[InteractiveRegionOption.GRIDDED_DATA]: InteractiveRegionDisplay.ALWAYS,
			[InteractiveRegionOption.CENSUS]: InteractiveRegionDisplay.ALWAYS,
			[InteractiveRegionOption.HEALTH]: InteractiveRegionDisplay.ALWAYS,
			[InteractiveRegionOption.WATERSHED]: InteractiveRegionDisplay.ALWAYS,
		},
		frequencyConfig: {
			[FrequencyType.ANNUAL]: FrequencyDisplayModeOption.ALWAYS,
			[FrequencyType.MONTHLY]: FrequencyDisplayModeOption.ALWAYS,
			[FrequencyType.SEASONAL]: FrequencyDisplayModeOption.DOWNLOAD,
			[FrequencyType.ALL_MONTHS]: FrequencyDisplayModeOption.DOWNLOAD,
			[FrequencyType.DAILY]: FrequencyDisplayModeOption.DOWNLOAD,
			[FrequencyType.ANNUAL_JUL_JUN]: FrequencyDisplayModeOption.NONE,
		},
		frequency: "ann",
		gridType: "canadagrid",
		averagingOptions: [
			AveragingType.ALL_YEARS,
			AveragingType.THIRTY_YEARS
		],
		dateRangeConfig: {
			min: "1950",
			max: "2100",
			interval: 30
		},
		hasDelta: true,
		enableColourOptions: true,
		preCalculatedCanDCSConfig: {
			tx_max: [FrequencyType.YS, FrequencyType.MS],
		},
		analysisFields: [
			{
				key: "thresh",
				type: "input",
				label: "> Degree Celsius",
				description: "This variable returns the number of degree days accumulated when daily mean temperature are above a certain temperature. Please set one below :",
				help: "Degrees help",
				unit: "degC",
				attributes: {
					type: "number",
					placeholder: "0",
				}
			},
			{
				key: "tasmin",
				type: "input",
				label: "Tasmin",
				description: "Tasmin description",
				help: "Tasmin help",
				required: false,
				unit: "degC",
				attributes: {
					type: "number",
					placeholder: "0",
				}
			},
			{
				key: "tasmax",
				type: "input",
				label: "Tasmax",
				description: "Tasmax description",
				help: "Tasmax help",
				required: false,
				unit: "degC",
				attributes: {
					type: "number",
					placeholder: "0",
				}
			}
		],
		percentileOptions: [ "5", "10", "25", "50", "75", "90", "95", ],
		downloadType: DownloadType.ANALYZED,
		fileFormatTypes: [
			FileFormatType.CSV,
			FileFormatType.JSON,
			FileFormatType.NetCDF,
		],
	},
	/** Hottest Day */
	{
		id: "hottest_day",
		class: "RasterPrecalculatedClimateVariable",
		threshold: "tx_max",
		unit: "degC",
		unitDecimalPlaces: 1,
		legendConfigs: {
			[MapDisplayType.ABSOLUTE]: {
				addTopPadding: true,
				valuesInKelvin: true,
			},
			[MapDisplayType.DELTA]: {
				hideTopLabel: true,
				decimals: 1,
			},
		},
		preCalculatedCanDCSConfig: {
			tx_max: [ FrequencyType.YS, FrequencyType.MS ],
		},
	},
	/** Coldest Day */
	{
		id: "coldest_day",
		class: "RasterPrecalculatedClimateVariable",
		threshold: "tn_min",
		unit: "degC",
		unitDecimalPlaces: 1,
		legendConfigs: {
			[MapDisplayType.ABSOLUTE]: {
				addTopPadding: true,
				valuesInKelvin: true,
			},
			[MapDisplayType.DELTA]: {
				hideTopLabel: true,
				decimals: 1,
			},
		},
		preCalculatedCanDCSConfig: {
			tn_min: [FrequencyType.YS, FrequencyType.MS],
		},
	},
	/** Cumulative degree-days above 0°C */
	{
		id: "cumulative_degree_days_above_0",
		class: "RasterPrecalculatedClimateVariable",
		threshold: "gddgrow_0",
		unit: "degree_days",
		legendConfigs: {
			[MapDisplayType.ABSOLUTE]: {
				addTopPadding: true,
			},
			[MapDisplayType.DELTA]: {
				hideTopLabel: true,
			},
		},
		preCalculatedCanDCSConfig: {
			gddgrow_0: [FrequencyType.YS, FrequencyType.MS],
		},
	},
	/** Maximum 5-Day Precipitation */
	{
		id: "max_5d_total_precipitation",
		class: "RasterPrecalculatedClimateVariable",
		threshold: "rx5day",
		unit: "mm",
		legendConfigs: {
			[MapDisplayType.ABSOLUTE]: {
				addTopPadding: true,
			},
			[MapDisplayType.DELTA]: {
				hideTopLabel: true,
				decimals: 1,
			},
		},
		preCalculatedCanDCSConfig: {
			rx5day: [FrequencyType.YS, FrequencyType.MS],
		},
	},
	/** Number of Periods with more than 5 Consecutive Dry Days */
	{
		id: "periods_more_5_consecutive_dry_days",
		class: "RasterPrecalculatedClimateVariable",
		threshold: "nr_cdd",
		unit: "periods",
		legendConfigs: {
			[MapDisplayType.ABSOLUTE]: {
				addTopPadding: true,
			},
			[MapDisplayType.DELTA]: {
				hideTopLabel: true,
			},
		},
		preCalculatedCanDCSConfig: {
			nr_cdd: [FrequencyType.YS, FrequencyType.MS],
		},
	},
	/** Ice Days */
	{
		id: "ice_days",
		class: "RasterPrecalculatedClimateVariable",
		threshold: "ice_days",
		unit: "days",
		legendConfigs: {
			[MapDisplayType.ABSOLUTE]: {
				addTopPadding: true,
			},
			[MapDisplayType.DELTA]: {
				hideTopLabel: true,
				decimals: 1,
			},
		},
		frequencyConfig: {
			[FrequencyType.ANNUAL]: FrequencyDisplayModeOption.ALWAYS,
		},
		preCalculatedCanDCSConfig: {
			ice_days: [FrequencyType.YS],
		},
	},
	/** First fall frost */
	{
		id: "first_fall_frost",
		class: "RasterPrecalculatedClimateVariable",
		threshold: "first_fall_frost",
		legendConfigs: {
			[MapDisplayType.ABSOLUTE]: {
				addTopPadding: true,
			},
			[MapDisplayType.DELTA]: {
				hideTopLabel: true,
				decimals: 1,
			},
		},
		frequencyConfig: {
			[FrequencyType.ANNUAL]: FrequencyDisplayModeOption.ALWAYS,
		},
		unit: "DoY",
		preCalculatedCanDCSConfig: {
			first_fall_frost: [FrequencyType.YS],
		},
	},
	/** Frost Days */
	{
		id: "frost_days",
		class: "RasterPrecalculatedClimateVariable",
		threshold: "frost_days",
		legendConfigs: {
			[MapDisplayType.ABSOLUTE]: {
				addTopPadding: true,
			},
			[MapDisplayType.DELTA]: {
				hideTopLabel: true,
				decimals: 1,
			},
		},
		frequencyConfig: {
			[FrequencyType.ANNUAL]: FrequencyDisplayModeOption.ALWAYS,
		},
		unit: "days",
		preCalculatedCanDCSConfig: {
			frost_days: [FrequencyType.YS],
		},
	},
	/** Frost free season */
	{
		id: "frost_free_season",
		class: "RasterPrecalculatedClimateVariable",
		threshold: "frost_free_season",
		legendConfigs: {
			[MapDisplayType.ABSOLUTE]: {
				addTopPadding: true,
			},
			[MapDisplayType.DELTA]: {
				hideTopLabel: true,
				decimals: 1,
			},
		},
		frequencyConfig: {
			[FrequencyType.ANNUAL]: FrequencyDisplayModeOption.ALWAYS,
		},
		unit: "days",
		preCalculatedCanDCSConfig: {
			frost_free_season: [FrequencyType.YS],
		},
	},
	/** Growing Degree Days (5°C) */
	{
		id: "growing_degree_days_5",
		class: "RasterPrecalculatedClimateVariable",
		threshold: "gddgrow_5",
		unit: "degree_days",
		legendConfigs: {
			[MapDisplayType.ABSOLUTE]: {
				addTopPadding: true,
			},
			[MapDisplayType.DELTA]: {
				hideTopLabel: true,
			},
		},
		frequencyConfig: {
			[FrequencyType.ANNUAL]: FrequencyDisplayModeOption.ALWAYS,
		},
		preCalculatedCanDCSConfig: {
			gddgrow_5: [FrequencyType.YS],
		},
	},
	/** Last spring frost */
	{
		id: "last_spring_frost",
		class: "RasterPrecalculatedClimateVariable",
		threshold: "last_spring_frost",
		legendConfigs: {
			[MapDisplayType.ABSOLUTE]: {
				addTopPadding: true,
			},
			[MapDisplayType.DELTA]: {
				hideTopLabel: true,
				decimals: 1,
			},
		},
		frequencyConfig: {
			[FrequencyType.ANNUAL]: FrequencyDisplayModeOption.ALWAYS,
		},
		unit: "DoY",
		preCalculatedCanDCSConfig: {
			last_spring_frost: [FrequencyType.YS],
		},
	},
	/** Maximum 1-Day Total Precipitation */
	{
		id: "max_1d_total_precipitation",
		finch: "pr",
		class: "RasterPrecalculatedClimateVariable",
		threshold: "rx1day",
		legendConfigs: {
			[MapDisplayType.ABSOLUTE]: {
				addTopPadding: true,
			},
			[MapDisplayType.DELTA]: {
				hideTopLabel: true,
				decimals: 1,
			},
		},
		frequencyConfig: {
			[FrequencyType.ANNUAL]: FrequencyDisplayModeOption.ALWAYS,
			[FrequencyType.ALL_MONTHS]: FrequencyDisplayModeOption.DOWNLOAD,
			[FrequencyType.MONTHLY]: FrequencyDisplayModeOption.ALWAYS,
			[FrequencyType.SEASONAL]: FrequencyDisplayModeOption.ALWAYS,
		},
		unit: "mm",
		preCalculatedCanDCSConfig: {
			rx1day: [FrequencyType.YS, FrequencyType.MS, FrequencyType.QSDEC],
		},
	},
	/** Mean Temperature */
	{
		id: "mean_temp",
		class: "RasterPrecalculatedClimateVariable",
		threshold: "tg_mean",
		legendConfigs: {
			[MapDisplayType.ABSOLUTE]: {
				addTopPadding: true,
				valuesInKelvin: true,
			},
			[MapDisplayType.DELTA]: {
				hideTopLabel: true,
				decimals: 1,
			},
		},
		frequencyConfig: {
			[FrequencyType.ANNUAL]: FrequencyDisplayModeOption.ALWAYS,
			[FrequencyType.ALL_MONTHS]: FrequencyDisplayModeOption.DOWNLOAD,
			[FrequencyType.MONTHLY]: FrequencyDisplayModeOption.ALWAYS,
			[FrequencyType.SEASONAL]: FrequencyDisplayModeOption.ALWAYS,
		},
		unit: "degC",
		unitDecimalPlaces: 1,
		preCalculatedCanDCSConfig: {
			tg_mean: [FrequencyType.YS, FrequencyType.MS, FrequencyType.QSDEC],
		},
	},
	/** Days with Humidex above threshold */
	{
		id: "days_humidex_above_threshold",
		class: "RasterAnalyzeClimateVariable",
		finch: "hxmax_days_above",
		versions: [ "cmip6" ],
		gridType: "era5landgrid",
		scenarios: {
			cmip6: [
				"ssp126",
				"ssp245",
				"ssp585",
			],
		},
		legendConfigs: {
			[MapDisplayType.ABSOLUTE]: {
				addTopPadding: true,
			},
			[MapDisplayType.DELTA]: {
				hideTopLabel: true,
			},
		},
		thresholds: [
			{
				value: "HXmax30",
				label: "> 30",
			},
			{
				value: "HXmax35",
				label: "> 35",
			},
			{
				value: "HXmax40",
				label: "> 40",
			},
		],
		averagingOptions: [
			AveragingType.ALL_YEARS,
			AveragingType.THIRTY_YEARS,
		],
		analysisFields: [
			{
				key: "threshold",
				type: "input",
				label: 'Daily Maximum Humidex Threshold (HXMax)',
				description: 'Set the daily maximum Humidex (HXMax) value that must be exceeded for a day to be included in the analysis.',
				help: 'Only days where the daily maximum Humidex (HXMax) exceeds this threshold will be counted.',
				comparison: '>',
				attributes: {
					type: "number",
					placeholder: "0",
				}
			},
		],
		frequencyConfig: {
			[FrequencyType.ANNUAL]: FrequencyDisplayModeOption.ALWAYS,
			[FrequencyType.ANNUAL_JUL_JUN]: FrequencyDisplayModeOption.DOWNLOAD,
			[FrequencyType.ALL_MONTHS]: FrequencyDisplayModeOption.DOWNLOAD,
			[FrequencyType.MONTHLY]: FrequencyDisplayModeOption.ALWAYS,
			[FrequencyType.SEASONAL]: FrequencyDisplayModeOption.DOWNLOAD,
		},
		unit: "days",
		preCalculatedCanDCSConfig: {
			HXmax30: [FrequencyType.YS, FrequencyType.MS, FrequencyType.QSDEC],
			HXmax35: [FrequencyType.YS, FrequencyType.MS, FrequencyType.QSDEC],
			HXmax40: [FrequencyType.YS, FrequencyType.MS, FrequencyType.QSDEC],
		},
	},
	/** All CanDCS variables */
	{
		id: "all_candcs_variables",
		class: "RasterPrecalculatedClimateVariable",
		threshold: "all",
		frequencyConfig: {
			[FrequencyType.ANNUAL]: FrequencyDisplayModeOption.ALWAYS,
			[FrequencyType.MONTHLY]: FrequencyDisplayModeOption.ALWAYS,
			[FrequencyType.SEASONAL]: FrequencyDisplayModeOption.ALWAYS,
		},
	},
	/** Building Climate Zones */
	{
		id: "building_climate_zones",
		class: "RasterPrecalculatedClimateVariable",
		threshold: "hddheat_18",
		layerStyles: "CDC:building_climate_zones",
		unit: "degree_days",
		unitLegend: "zone",
		legendConfigs: {
			[MapDisplayType.ABSOLUTE]: {
				labels: ['4', '5', '6', '7A', '7B', '8'],
				centerLabels: true,
			},
		},
		frequencyConfig: {
			[FrequencyType.ANNUAL]: FrequencyDisplayModeOption.ALWAYS,
		},
		interactiveRegionConfig: {
			[InteractiveRegionOption.GRIDDED_DATA]: InteractiveRegionDisplay.MAP,
		},
		hasDelta: false,
		enableColourOptions: false,
		customColourSchemes: {
			default: {
				colours: [
					{ label: 'Climate Zone 4', colour: '#C90000', quantity: 3000 },
					{ label: 'Climate Zone 5', colour: '#FAEE02', quantity: 4000 },
					{ label: 'Climate Zone 6', colour: '#00C936', quantity: 5000 },
					{ label: 'Climate Zone 7A', colour: '#0083C9', quantity: 6000 },
					{ label: 'Climate Zone 7B', colour: '#1400C9', quantity: 7000 },
					{ label: 'Climate Zone 8', colour: '#7F00C9', quantity: 99999999 },
				],
				type: ColourType.DISCRETE,
				categorical: true,
			}
		},
		preCalculatedCanDCSConfig: {
			hddheat_18: [FrequencyType.YS],
		},
	},
	/** Maximum Temperature */
	{
		id: "maximum_temperature",
		finch: "tasmax",
		class: "RasterPrecalculatedWithDailyFormatsClimateVariable",
		threshold: "tx_mean",
		legendConfigs: {
			[MapDisplayType.ABSOLUTE]: {
				addTopPadding: true,
				valuesInKelvin: true,
			},
			[MapDisplayType.DELTA]: {
				hideTopLabel: true,
				decimals: 1,
			},
		},
		frequencyConfig: {
			[FrequencyType.ANNUAL]: FrequencyDisplayModeOption.ALWAYS,
			[FrequencyType.ALL_MONTHS]: FrequencyDisplayModeOption.DOWNLOAD,
			[FrequencyType.MONTHLY]: FrequencyDisplayModeOption.ALWAYS,
			[FrequencyType.SEASONAL]: FrequencyDisplayModeOption.ALWAYS,
			[FrequencyType.DAILY]: FrequencyDisplayModeOption.DOWNLOAD,
		},
		unit: "degC",
		unitDecimalPlaces: 1,
		preCalculatedCanDCSConfig: {
			tx_mean: [FrequencyType.YS, FrequencyType.MS, FrequencyType.QSDEC],
		},
	},
	/** Minimum Temperature */
	{
		id: "minimum_temperature",
		finch: "tasmin",
		class: "RasterPrecalculatedWithDailyFormatsClimateVariable",
		threshold: "tn_mean",
		legendConfigs: {
			[MapDisplayType.ABSOLUTE]: {
				addTopPadding: true,
				valuesInKelvin: true,
			},
			[MapDisplayType.DELTA]: {
				hideTopLabel: true,
				decimals: 1,
			},
		},
		frequencyConfig: {
			[FrequencyType.ANNUAL]: FrequencyDisplayModeOption.ALWAYS,
			[FrequencyType.ALL_MONTHS]: FrequencyDisplayModeOption.DOWNLOAD,
			[FrequencyType.MONTHLY]: FrequencyDisplayModeOption.ALWAYS,
			[FrequencyType.SEASONAL]: FrequencyDisplayModeOption.ALWAYS,
			[FrequencyType.DAILY]: FrequencyDisplayModeOption.DOWNLOAD,
		},
		unit: "degC",
		unitDecimalPlaces: 1,
		preCalculatedCanDCSConfig: {
			tn_mean: [FrequencyType.YS, FrequencyType.MS, FrequencyType.QSDEC],
		},
	},
	/** Standardized precipitation evapotranspiration index (12-months) */
	{
		id: "spei_12",
		class: "RasterPrecalculatedClimateVariable",
		threshold: "spei_12m",
		versions: [ "cmip5" ],
		unitDecimalPlaces: 3,
		legendConfigs: {
			[MapDisplayType.ABSOLUTE]: {
				addTopPadding: true,
				decimals: 1,
			},
		},
		frequencyConfig: {
			[FrequencyType.ALL_MONTHS]: FrequencyDisplayModeOption.DOWNLOAD,
			[FrequencyType.MONTHLY]: FrequencyDisplayModeOption.ALWAYS,
		},
		interactiveRegionConfig: {
			[InteractiveRegionOption.GRIDDED_DATA]: InteractiveRegionDisplay.ALWAYS,
		},
		averagingOptions: [
			AveragingType.ALL_YEARS,
		],
		hasDelta: false,
		enableColourOptions: false,
		gridType: "canadagrid1deg",
	},
	/** Standardized precipitation evapotranspiration index (3-months) */
	{
		id: "spei_3",
		class: "RasterPrecalculatedClimateVariable",
		threshold: "spei_3m",
		versions: [ "cmip5" ],
		unitDecimalPlaces: 3,
		legendConfigs: {
			[MapDisplayType.ABSOLUTE]: {
				addTopPadding: true,
				decimals: 1,
			},
		},
		frequencyConfig: {
			[FrequencyType.ALL_MONTHS]: FrequencyDisplayModeOption.DOWNLOAD,
			[FrequencyType.MONTHLY]: FrequencyDisplayModeOption.ALWAYS,
		},
		interactiveRegionConfig: {
			[InteractiveRegionOption.GRIDDED_DATA]: InteractiveRegionDisplay.ALWAYS,
		},
		averagingOptions: [
			AveragingType.ALL_YEARS,
		],
		hasDelta: false,
		enableColourOptions: false,
		gridType: "canadagrid1deg",
	},
	/** Total Precipitation */
	{
		id: "total_precipitation",
		class: "RasterPrecalculatedWithDailyFormatsClimateVariable",
		threshold: "prcptot",
		legendConfigs: {
			[MapDisplayType.ABSOLUTE]: {
				addTopPadding: true,
			},
			[MapDisplayType.DELTA]: {
				hideTopLabel: true,
				decimals: 1,
			},
		},
		frequencyConfig: {
			[FrequencyType.ANNUAL]: FrequencyDisplayModeOption.ALWAYS,
			[FrequencyType.ALL_MONTHS]: FrequencyDisplayModeOption.DOWNLOAD,
			[FrequencyType.MONTHLY]: FrequencyDisplayModeOption.ALWAYS,
			[FrequencyType.SEASONAL]: FrequencyDisplayModeOption.ALWAYS,
			[FrequencyType.DAILY]: FrequencyDisplayModeOption.DOWNLOAD,
		},
		unit: "mm",
		preCalculatedCanDCSConfig: {
			prcptot: [FrequencyType.YS, FrequencyType.MS, FrequencyType.QSDEC],
		},
	},
	/** Average 'Wet Day' Precipitation Intensity */
	{
		id: "average_wet_day_precipitation_intensity",
		finch: "sdii",
		class: "RasterAnalyzeClimateVariable",
		hasDelta: false,
		unit: "mm/day",
		analysisFields: [
			{
				key: "thresh",
				type: "input",
				label: "Average Daily Precipitation on Wet Days (mm/day)",
				description: 'Set the minimum daily precipitation required to count a day as wet.',
				help: 'Only days with daily precipitation greater than or equal to this value will be included.',
				comparison: '>=',
				unit: 'mm/day',
				attributes: {
					type: "number",
					placeholder: "0",
				}
			}
		],
		defaultDateRange: [
			"1980",
			"2010",
		],
		ahccdDownloadRequiredVariables: [
			"pr",
		],
		stationTypeFilter: ['P'],
	},
	/** Cold Spell Days */
	{
		id: "cold_spell_days",
		finch: "cold_spell_days",
		class: "RasterAnalyzeClimateVariable",
		hasDelta: false,
		unit: "days",
		analysisFields: [
			{
				key: "window",
				type: "input",
				label: 'Minimum Consecutive Days (Days)',
				description: 'Set the minimum number of consecutive days required to define a cold spell.',
				help: 'This value determines how many consecutive days must meet the temperature condition for the period to be considered a cold spell.',
				attributes: {
					type: "number",
					placeholder: "0",
				}
			},
			{
				key: "thresh",
				type: "input",
				label: 'Temperature Threshold (°C)',
				description: 'Set the maximum mean daily temperature required for a day to be counted in a cold spell.',
				help: 'Only days with a mean daily temperature less than this threshold will be included.',
				unit: 'degC',
				comparison: '<',
				attributes: {
					type: "number",
					placeholder: "0",
				}
			}
		],
		defaultDateRange: [
			"1980",
			"2010",
		],
		ahccdDownloadRequiredVariables: [
			"tas",
		],
		stationTypeFilter: ['T'],
	},
	/** Cooling Degree Days */
	{
		id: "cooling_degree_days",
		finch: "cooling_degree_days",
		class: "RasterAnalyzeClimateVariable",
		threshold: "cddcold_18",
		unit: "degree_days",
		legendConfigs: {
			[MapDisplayType.ABSOLUTE]: {
				addTopPadding: true,
			},
			[MapDisplayType.DELTA]: {
				hideTopLabel: true,
				decimals: 1,
			},
		},
		frequencyConfig: {
			[FrequencyType.ANNUAL]: FrequencyDisplayModeOption.ALWAYS,
			[FrequencyType.MONTHLY]: FrequencyDisplayModeOption.NONE,
			[FrequencyType.SEASONAL]: FrequencyDisplayModeOption.NONE,
			[FrequencyType.ANNUAL_JUL_JUN]: FrequencyDisplayModeOption.NONE,
		},
		averagingOptions: [
			AveragingType.ALL_YEARS,
			AveragingType.THIRTY_YEARS,
		],
		preCalculatedCanDCSConfig: {
			cddcold_18: [FrequencyType.YS],
		},
		analysisFields: [
			{
				key: "thresh",
				type: "input",
				label: 'Mean Daily Temperature Threshold (°C)',
				description: 'Set the maximum mean daily temperature for accumulating degree days.',
				help: 'Degree days will be accumulated on days where the mean daily temperature is less than this value.',
				unit: 'degC',
				comparison: '>',
				attributes: {
					type: "number",
					placeholder: "0",
				}
			},
		],
		ahccdDownloadRequiredVariables: [
			"tas",
		],
		stationTypeFilter: ['T'],
	},
	/** Days above Tmax */
	{
		id: "days_above_tmax",
		finch: "tx_days_above",
		class: "RasterAnalyzeClimateVariable",
		legendConfigs: {
			[MapDisplayType.ABSOLUTE] : {
				addTopPadding: true,
			},
			[MapDisplayType.DELTA] : {
				hideTopLabel: true,
				decimals: 1,
			},
		},
		thresholds: [
			{
				value: "txgt_25",
				label: "> 25 ºC",
			},
			{
				value: "txgt_27",
				label: "> 27 ºC",
			},
			{
				value: "txgt_29",
				label: "> 29 ºC",
			},
			{
				value: "txgt_30",
				label: "> 30 ºC",
			},
			{
				value: "txgt_32",
				label: "> 32 ºC",
			},
		],
		analysisFields: [
			{
				key: "thresh",
				type: "input",
				label: 'Temperature Threshold (°C)',
				description: 'Set the daily maximum temperature required for a day to be included in the count.',
				help: 'Only days with a daily maximum temperature greater than this threshold will be included.',
				unit: 'degC',
				comparison: '>',
				attributes: {
					type: "number",
					placeholder: "0",
				}
			},
		],
		averagingOptions: [
			AveragingType.ALL_YEARS,
			AveragingType.THIRTY_YEARS,
		],
		unit: "days",
		preCalculatedCanDCSConfig: {
			txgt_25: [FrequencyType.YS, FrequencyType.MS],
			txgt_27: [FrequencyType.YS, FrequencyType.MS],
			txgt_29: [FrequencyType.YS, FrequencyType.MS],
			txgt_30: [FrequencyType.YS, FrequencyType.MS],
			txgt_32: [FrequencyType.YS, FrequencyType.MS],
		},
		ahccdDownloadRequiredVariables: [
			"tasmax",
		],
		stationTypeFilter: ['T'],
	},
	/** Days above Tmax and Tmin */
	{
		id: "days_above_tmax_and_tmin",
		finch: "tx_tn_days_above",
		class: "RasterAnalyzeClimateVariable",
		hasDelta: false,
		unit: "days",
		analysisFields: [
			{
				key: "thresh_tasmin",
				type: "input",
				label: 'Minimum Temperature Threshold (°C)',
				description: 'Set the daily minimum temperature threshold.',
				help: 'Only days with a daily minimum temperature greater than this value will be included.',
				unit: 'degC',
				comparison: '>',
				attributes: {
					type: "number",
					placeholder: "0",
				}
			},
			{
				key: "thresh_tasmax",
				type: "input",
				label: 'Maximum Temperature Threshold (°C)',
				description: 'Set the daily maximum temperature threshold.',
				help: 'Only days with a daily maximum temperature greater than this value will be included.',
				unit: 'degC',
				comparison: '>',
				attributes: {
					type: "number",
					placeholder: "0",
				}
			},
		],
		defaultDateRange: [
			"1980",
			"2010",
		],
		ahccdDownloadRequiredVariables: [
			"tasmin",
			"tasmax",
		],
		stationTypeFilter: ['T'],
	},
	/** Days below Tmin*/
	{
		id: "days_below_tmin",
		finch: "tn_days_below",
		class: "RasterAnalyzeClimateVariable",
		legendConfigs: {
			[MapDisplayType.ABSOLUTE]: {
				addTopPadding: true,
			},
			[MapDisplayType.DELTA]: {
				hideTopLabel: true,
				decimals: 1,
			},
		},
		thresholds: [
			{
				value: "tnlt_-15",
				label: "< -15 ºC",
			},
			{
				value: "tnlt_-25",
				label: "< -25 ºC",
			},
		],
		analysisFields: [
			{
				key: "thresh",
				type: "input",
				label: 'Temperature Threshold (°C)',
				description: 'Set the daily minimum temperature required for a day to be included in the count.',
				help: 'Only days with a daily minimum temperature less than this value will be included.',
				unit: 'degC',
				comparison: '>',
				attributes: {
					type: "number",
					placeholder: "0",
				}
			},
		],
		averagingOptions: [
			AveragingType.ALL_YEARS,
			AveragingType.THIRTY_YEARS,
		],
		unit: "days",
		preCalculatedCanDCSConfig: {
			"tnlt_-15": [FrequencyType.YS, FrequencyType.MS],
			"tnlt_-25": [FrequencyType.YS, FrequencyType.MS],
		},
		ahccdDownloadRequiredVariables: [
			"tasmin",
		],
		stationTypeFilter: ['T'],
	},
	/** Degree days exceedance date */
	{
		id: "degree_days_exceedance_date",
		finch: "degree_days_exceedance_date",
		class: "RasterAnalyzeClimateVariable",
		hasDelta: false,
		unit: "DoY",
		analysisFields: [
			{
				key: "sum_thresh",
				type: "input",
				label: 'Degree-Day Total Threshold (degree-days)',
				description: 'This analysis returns the day of year when the accumulated degree-day total exceeds:',
				help: 'This value defines the cumulative degree-day target. The result will be the day of the year when this threshold is surpassed.',
				unit: 'K days',
				attributes: {
					type: "number",
					placeholder: "0",
				}
			},
			{
				key: "op",
				type: "select",
				label: 'Temperature Comparison Operator',
				description: 'Choose whether to accumulate degree-days when the temperature is greater than or less than the threshold.',
				help: 'Select ">" to accumulate degree-days on days warmer than the threshold, or "<" for colder days.',
				attributes: {
					placeholder: ">",
				},
				options:[
					{
						value: '>',
						label: '>'
					},
					{
						value: '<',
						label: '<'
					}
				]
			},
			{
				key: "thresh",
				type: "input",
				label: 'Mean Daily Temperature Threshold (°C)',
				description: 'Set the temperature threshold used to calculate daily degree-days.',
				help: 'Only days where the mean daily temperature satisfies the comparison condition will contribute to the degree-day total.',
				unit: 'degC',
				attributes: {
					type: "number",
					placeholder: "0",
				}
			},
			{
				key: "after_date",
				type: "input",
				label: 'Start Date (MM-DD)',
				description: 'Specify the date to begin accumulating degree-days. If you want the calculations to include the complete winter season, ' +
					'set "Temporal Frequency" in the Step 5 (Additional Details) Section to Annual (July to June), rather than Annual (January to December).',
				help: 'Use a date like "09-01" to start from September 1st. Avoid end-of-month dates due to inconsistencies in some climate models.',
				format: "MM-DD",
				attributes: {
					type: "date",
					placeholder: "MM-DD",
				}
			}
		],
		defaultDateRange: [
			"1980",
			"2010",
		],
		frequencyConfig: {
			[FrequencyType.ANNUAL]: FrequencyDisplayModeOption.DOWNLOAD,
			[FrequencyType.ANNUAL_JUL_JUN]: FrequencyDisplayModeOption.DOWNLOAD,
		},
		ahccdDownloadRequiredVariables: [
			"tas",
		],
		stationTypeFilter: ['T'],
	},

	/** Freeze-Thaw Cycles */
	{
		id: "freeze_thaw_cycles",
		finch: "dlyfrzthw",
		class: "RasterAnalyzeClimateVariable",
		threshold: "dlyfrzthw_tx0_tn-1",
		legendConfigs: {
			[MapDisplayType.ABSOLUTE]: {
				addTopPadding: true,
			},
			[MapDisplayType.DELTA]: {
				hideTopLabel: true,
				decimals: 1,
			},
		},
		analysisFields: [
			{
				key: "thresh_tasmax",
				type: "input",
				label: 'Maximum Temperature Threshold (°C)',
				description: 'Set the threshold for daily maximum temperature.',
				help: 'Only days with a daily maximum temperature greater than this value will be included.',
				unit: 'degC',
				comparison: '>',
				attributes: {
					type: "number",
					placeholder: "0",
				}
			},
			{
				key: "thresh_tasmin",
				type: "input",
				label: 'Minimum Temperature Threshold (°C)',
				description: 'Set the threshold for daily minimum temperature.',
				help: 'Only days with a daily minimum temperature less than or equal to this value will be included.',
				unit: 'degC',
				comparison: '<',
				attributes: {
					type: "number",
					placeholder: "0",
				}
			},
		],
		frequencyConfig: {
			[FrequencyType.ANNUAL]: FrequencyDisplayModeOption.ALWAYS,
			[FrequencyType.MONTHLY]: FrequencyDisplayModeOption.NONE,
			[FrequencyType.SEASONAL]: FrequencyDisplayModeOption.NONE,
			[FrequencyType.ANNUAL_JUL_JUN]: FrequencyDisplayModeOption.DOWNLOAD,
		},
		averagingOptions: [
			AveragingType.ALL_YEARS,
			AveragingType.THIRTY_YEARS,
		],
		unit: "days",
		preCalculatedCanDCSConfig: {
			"dlyfrzthw_tx0_tn-1": [FrequencyType.YS],
		},
		ahccdDownloadRequiredVariables: [
			"tasmin",
			"tasmax",
		],
		stationTypeFilter: ['T'],

	},
	/** Heat Wave Frequency */
	{
		id: "heat_wave_frequency",
		finch: "heat_wave_frequency",
		class: "RasterAnalyzeClimateVariable",
		hasDelta: false,
		unit: "events",
		analysisFields: [
			{
				key: "thresh_tasmin",
				type: "input",
				label: 'Minimum Temperature Threshold (°C)',
				description: 'Set the minimum temperature required for a day to be included in a heat wave.',
				help: 'Only days with a daily minimum temperature greater than this value will be included.',
				unit: 'degC',
				comparison: '<',
				attributes: {
					type: "number",
					placeholder: "0",
				}
			},
			{
				key: "thresh_tasmax",
				type: "input",
				label: 'Maximum Temperature Threshold (°C)',
				description: 'Set the maximum temperature required for a day to be included in a heat wave.',
				help: 'Only days with a daily maximum temperature greater than this value will be included.',
				unit: 'degC',
				comparison: '>',
				attributes: {
					type: "number",
					placeholder: "0",
				}
			},
			{
				key: "window",
				type: "input",
				label: 'Minimum Consecutive Days (Days)',
				description: 'Set the number of consecutive qualifying days required to define a heat wave.',
				help: 'A heat wave is defined as a sequence of consecutive days that meet both temperature thresholds. This value controls the minimum number of days in that sequence.',
				attributes: {
					type: "number",
					placeholder: "0",
				}
			},
		],
		ahccdDownloadRequiredVariables: [
			"tasmin",
			"tasmax",
		],
		stationTypeFilter: ['T'],
	},
	/** Heat Wave Index */
	{
		id: "heat_wave_index",
		finch: "heat_wave_index",
		class: "RasterAnalyzeClimateVariable",
		hasDelta: false,
		unit: "days",
		analysisFields: [
			{
				key: "window",
				type: "input",
				label: 'Minimum Consecutive Days (Days)',
				description: 'Set the minimum number of consecutive hot days required to define a heat wave.',
				help: 'A heat wave is defined as a sequence of consecutive days where the maximum temperature meets the threshold. This value controls the minimum number of days in that sequence.',
				attributes: {
					type: "number",
					placeholder: "0",
				}
			},
			{
				key: "thresh",
				type: "input",
				label: 'Maximum Temperature Threshold (°C)',
				description: 'Set the maximum temperature required for a day to be counted in a heat wave.',
				help: 'Only days with a daily maximum temperature greater than this value will be included.',
				unit: 'degC',
				comparison: '>',
				attributes: {
					type: "number",
					placeholder: "0",
				}
			},
		],
		defaultDateRange: [
			"1980",
			"2010",
		],
		ahccdDownloadRequiredVariables: [
			"tasmax",
		],
		stationTypeFilter: ['T'],
	},
	/** Heat Wave Total Duration */
	{
		id: "heat_wave_total_duration",
		finch: "heat_wave_total_length",
		class: "RasterAnalyzeClimateVariable",
		hasDelta: false,
		unit: "days",
		analysisFields: [
			{
				key: "thresh_tasmin",
				type: "input",
				label: 'Minimum Temperature Threshold (°C)',
				description: 'Set the minimum daily temperature that must be exceeded for a day to be considered part of a heat wave event.',
				help: 'Only days with a daily minimum temperature greater than this value will be included.',
				unit: 'degC',
				comparison: '<',
				attributes: {
					type: "number",
					placeholder: "0",
				}
			},
			{
				key: "thresh_tasmax",
				type: "input",
				label: 'Maximum Temperature Threshold (°C)',
				description: 'Set the maximum daily temperature that must be exceeded for a day to be considered part of a heat wave event.',
				help: 'Only days with a daily maximum temperature greater than this value will be included.',
				unit: 'degC',
				comparison: '>',
				attributes: {
					type: "number",
					placeholder: "0",
				}
			},
			{
				key: "window",
				type: "input",
				label: 'Minimum Consecutive Days (Days)',
				description: 'Set the minimum number of consecutive qualifying days required to define a heat wave event.',
				help: 'A heat wave is defined as a sequence of consecutive days that meet both temperature thresholds. This value controls the minimum number of days in that sequence.',
				attributes: {
					type: "number",
					placeholder: "0",
				}
			},
		],
		ahccdDownloadRequiredVariables: [
			"tasmin",
			"tasmax",
		],
		stationTypeFilter: ['T'],
	},
	/** Heating Degree Days */
	{
		id: "heating_degree_days",
		finch: "heating_degree_days",
		class: "RasterAnalyzeClimateVariable",
		threshold: "hddheat_18",
		unit: "degree_days",
		legendConfigs: {
			[MapDisplayType.ABSOLUTE]: {
				addTopPadding: true,
			},
			[MapDisplayType.DELTA]: {
				hideTopLabel: true,
			},
		},
		frequencyConfig: {
			[FrequencyType.ANNUAL]: FrequencyDisplayModeOption.ALWAYS,
			[FrequencyType.MONTHLY]: FrequencyDisplayModeOption.DOWNLOAD,
			[FrequencyType.SEASONAL]: FrequencyDisplayModeOption.NONE,
			[FrequencyType.ANNUAL_JUL_JUN]: FrequencyDisplayModeOption.DOWNLOAD,
		},
		averagingOptions: [
			AveragingType.ALL_YEARS,
			AveragingType.THIRTY_YEARS,
		],
		analysisFields: [
			{
				key: "thresh",
				type: "input",
				label: 'Mean Daily Temperature Threshold (°C)',
				description: 'Set the maximum mean daily temperature for accumulating degree days.',
				help: 'Degree days will be accumulated on days where the mean daily temperature is less than this value.',
				unit: 'degC',
				comparison: '>',
				attributes: {
					type: "number",
					placeholder: "0",
				}
			},
		],
		ahccdDownloadRequiredVariables: [
			"tas",
		],
		preCalculatedCanDCSConfig: {
			hddheat_18: [FrequencyType.YS],
		},
	},
	/** Maximum Consecutive Dry Days */
	{
		id: "maximum_consecutive_dry_days",
		finch: "cdd",
		class: "RasterAnalyzeClimateVariable",
		threshold: "cdd",
		unit: "days",
		preCalculatedCanDCSConfig: {
			cdd: [FrequencyType.YS],
		},
		frequencyConfig: {
			[FrequencyType.ANNUAL]: FrequencyDisplayModeOption.ALWAYS,
			[FrequencyType.ANNUAL_JUL_JUN]: FrequencyDisplayModeOption.DOWNLOAD,
			[FrequencyType.ALL_MONTHS]: FrequencyDisplayModeOption.DOWNLOAD,
			[FrequencyType.MONTHLY]: FrequencyDisplayModeOption.DOWNLOAD,
			[FrequencyType.SEASONAL]: FrequencyDisplayModeOption.DOWNLOAD,
		},
		legendConfigs: {
			[MapDisplayType.ABSOLUTE]: {
				addTopPadding: true,
			},
			[MapDisplayType.DELTA]: {
				hideTopLabel: true,
				decimals: 1,
			},
		},
		analysisFields: [
			{
				key: "thresh",
				type: "input",
				label: 'Precipitation Threshold (mm)',
				description: 'Set the maximum daily precipitation allowed to count a day as dry.',
				help: 'Only days with daily precipitation less than this threshold will be included.',
				unit: 'mm/day',
				comparison: '<',
				attributes: {
					type: "number",
					placeholder: "0",
				}
			},
		],
		averagingOptions: [
			AveragingType.ALL_YEARS,
			AveragingType.THIRTY_YEARS,
		],
		ahccdDownloadRequiredVariables: [
			"pr",
		],
		stationTypeFilter: ['P'],
	},
	/** Maximum Consecutive Wet Days */
	{
		id: "maximum_consecutive_wet_days",
		finch: "cwd",
		class: "RasterAnalyzeClimateVariable",
		hasDelta: false,
		unit: "days",
		analysisFields: [
			{
				key: "thresh",
				type: "input",
				label: 'Precipitation Threshold (mm)',
				description: 'Set the minimum daily precipitation required to count a day as wet.',
				help: 'Only days with daily precipitation greater than this threshold will be included.',
				unit: 'mm/day',
				comparison: '>',
				attributes: {
					type: "number",
					placeholder: "0",
				}
			},
		],
		defaultDateRange: [
			"1980",
			"2010",
		],
		ahccdDownloadRequiredVariables: [
			"pr",
		],
		stationTypeFilter: ['T'],
	},
	/** Tropical Nights (Days with Tmin above threshold) */
	{
		id: "tropical_nights_days_with_tmin_above_threshold",
		finch: "tropical_nights",
		class: "RasterAnalyzeClimateVariable",
		legendConfigs: {
			[MapDisplayType.ABSOLUTE]: {
				addTopPadding: true,
			},
			[MapDisplayType.DELTA]: {
				hideTopLabel: true,
				decimals: 1,
			},
		},
		thresholds: [
			{
				value: "tr_18",
				label: "> 18 ºC",
			},
			{
				value: "tr_20",
				label: "> 20 ºC",
			},
			{
				value: "tr_22",
				label: "> 22 ºC",
			},
		],
		averagingOptions: [
			AveragingType.ALL_YEARS,
			AveragingType.THIRTY_YEARS,
		],
		frequencyConfig: {
			[FrequencyType.ANNUAL]: FrequencyDisplayModeOption.ALWAYS,
			[FrequencyType.MONTHLY]: FrequencyDisplayModeOption.ALWAYS,
			[FrequencyType.SEASONAL]: FrequencyDisplayModeOption.NONE,
			[FrequencyType.ANNUAL_JUL_JUN]: FrequencyDisplayModeOption.DOWNLOAD,
		},
		unit: "days",
		preCalculatedCanDCSConfig: {
			tr_18: [FrequencyType.YS, FrequencyType.MS],
			tr_20: [FrequencyType.YS, FrequencyType.MS],
			tr_22: [FrequencyType.YS, FrequencyType.MS],
		},
		analysisFields: [
			{
				key: "thresh",
				type: "input",
				label: 'Days above Tmin (°C)',
				description: 'Set the minimum daily temperature that must be exceeded for a day to be included in the analysis.',
				help: 'Only days with a daily minimum temperature greater than this value will be included.',
				unit: 'degC',
				comparison: '>',
				attributes: {
					type: "number",
					placeholder: "0",
				}
			},
		],
		ahccdDownloadRequiredVariables: [
			"tasmin",
		],
		stationTypeFilter: ['T'],
	},
	/** Wet Days */
	{
		id: "wet_days",
		finch: "wetdays",
		class: "RasterAnalyzeClimateVariable",
		legendConfigs: {
			[MapDisplayType.ABSOLUTE]: {
				addTopPadding: true,
			},
			[MapDisplayType.DELTA]: {
				hideTopLabel: true,
				decimals: 1,
			},
		},
		analysisFields: [
			{
				key: "thresh",
				type: "input",
				label: "Number of Wet Days (mm/day)",
				description: 'Set the precipitation value that defines a wet day.',
				help: 'Only days with daily precipitation greater than or equal to this value will be included.',
				comparison: '>',
				unit: 'mm/day',
				attributes: {
					type: "number",
					placeholder: "0",
				}
			}
		],
		thresholds: [
			{
				value: "r1mm",
				label: ">= 1 mm",
			},
			{
				value: "r10mm",
				label: ">= 10 mm",
			},
			{
				value: "r20mm",
				label: ">= 20 mm",
			},
		],
		frequencyConfig: {
			[FrequencyType.ANNUAL]: FrequencyDisplayModeOption.ALWAYS,
			[FrequencyType.MONTHLY]: FrequencyDisplayModeOption.ALWAYS,
			[FrequencyType.SEASONAL]: FrequencyDisplayModeOption.ALWAYS,
			[FrequencyType.ANNUAL_JUL_JUN]: FrequencyDisplayModeOption.DOWNLOAD,
		},
		averagingOptions: [
			AveragingType.ALL_YEARS,
			AveragingType.THIRTY_YEARS,
		],
		unit: "days",
		preCalculatedCanDCSConfig: {
			r1mm: [FrequencyType.YS, FrequencyType.MS, FrequencyType.QSDEC],
			r10mm: [FrequencyType.YS, FrequencyType.MS, FrequencyType.QSDEC],
			r20mm: [FrequencyType.YS, FrequencyType.MS, FrequencyType.QSDEC],
		},
		ahccdDownloadRequiredVariables: [
			"pr",
		],
		stationTypeFilter: ['P'],
	},
	/** Relative Sea-Level Change */
	{
		id: "sea_level",
		class: "SeaLevelClimateVariable",
		threshold: "slr",
		hasDelta: false,
		enableColourOptions: false,
		defaultDateRange: [
			"2040",
			"2040",
		],
		isTimePeriodARange: false,
		interactiveRegionConfig: {
			[InteractiveRegionOption.GRIDDED_DATA]: InteractiveRegionDisplay.ALWAYS,
		},
		legendConfigs: {
			[MapDisplayType.ABSOLUTE]: {
				hideTopLabel: true,
			},
		},
		frequencyConfig: {
			[FrequencyType.ANNUAL]: FrequencyDisplayModeOption.ALWAYS,
			[FrequencyType.MONTHLY]: FrequencyDisplayModeOption.NONE,
		},
		averagingOptions: [ AveragingType.ALL_YEARS ],
		scenarios: {
			cmip5: [
				"rcp85plus65-p50",
				"rcp85-p05",
				"rcp85-p50",
				"rcp85-p95",
				"rcp45-p05",
				"rcp45-p50",
				"rcp45-p95",
				"rcp26-p05",
				"rcp26-p50",
				"rcp26-p95",
			],
			cmip6: [
				"ssp585highEnd-p98",
				"ssp585lowConf-p83",
				"ssp585",
				"ssp370",
				"ssp245",
				"ssp126",
			],
		},
		unit: "cm",
		downloadType: DownloadType.PRECALCULATED,
	},
	/** Vertical Allowance */
	{
		id: "allowance",
		class: "AllowanceClimateVariable",
		threshold: "allowance",
		hasDelta: false,
		enableColourOptions: false,
		versions: [ "cmip6" ],
		interactiveRegionConfig: {
			[InteractiveRegionOption.GRIDDED_DATA]: InteractiveRegionDisplay.ALWAYS,
		},
		legendConfigs: {
			[MapDisplayType.ABSOLUTE]: {
				addTopPadding: true,
			},
		},
		frequencyConfig: {
			[FrequencyType.ANNUAL]: FrequencyDisplayModeOption.ALWAYS,
		},
		dateRange: [
			"2040",
			"2040",
		],
		isTimePeriodARange: false,
		averagingOptions: [ AveragingType.ALL_YEARS ],
		dateRangeConfig: {
			min: "2020",
			max: "2100",
			interval: 10
		},
		unit: "cm",
		gridType: "allowancegrid",
		downloadType: DownloadType.PRECALCULATED,
	},
	/** MSC Climate Normals 1981-2010 */
	{
		id: "msc_climate_normals",
		class: "StationClimateVariable",
		threshold: "climate-normals",
		hasDelta: false,
		enableColourOptions: false,
		unitDecimalPlaces: 2,
		fileFormatTypes: [
			FileFormatType.CSV,
			FileFormatType.GeoJSON,
		],
		unit: "degC",
	},
	/** Daily AHCCD Temperature and Precipitation */
	{
		id: "daily_ahccd_temperature_and_precipitation",
		class: "StationClimateVariable",
		threshold: "ahccd",
		hasDelta: false,
	},
	/** Future Building Design Value Summaries */
	{
		id: "future_building_design_value_summaries",
		class: "StationClimateVariable",
		threshold: "bdv",
		hasDelta: false,
	},
	/** Short-duration Rainfall IDF Data */
	{
		id: "short_duration_rainfall_idf_data",
		class: "StationClimateVariable",
		threshold: "idf",
		hasDelta: false,
		unitDecimalPlaces: 1,
	},
	/** Station Data */
	{
		id: "station_data",
		class: "StationDataClimateVariable",
		threshold: "station-data",
		versions: [
			"cmip6",
		],
		scenarios: {
			cmip6: [
				"ssp126",
				"ssp245",
				"ssp585",
				"ssp370",
			],
		},
		fileFormatTypes: [
			FileFormatType.CSV,
			FileFormatType.GeoJSON,
		],
	},
];
