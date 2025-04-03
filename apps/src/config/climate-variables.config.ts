import {
	AveragingType,
	ClimateVariableConfigInterface,
	DownloadType,
	FileFormatType,
	FrequencyDisplayModeOption,
	FrequencyType,
	InteractiveRegionOption,
} from "@/types/climate-variable-interface";

export const ClimateVariables: ClimateVariableConfigInterface[] = [
	/** Hottest Day */
	{
		id: "hottest_day",
		class: "RasterPrecalculatedClimateVariable",
		threshold: "tx_max",
	},
	/** Coldest Day */
	{
		id: "coldest_day",
		class: "RasterPrecalculatedClimateVariable",
		threshold: "tn_min",
	},
	/** Cumulative degree-days above 0°C */
	{
		id: "cumulative_degree_days_above_0",
		class: "RasterPrecalculatedClimateVariable",
		threshold: "gddgrow_0",
	},
	/** Maximum 5-Day Precipitation */
	{
		id: "max_5d_total_precipitation",
		class: "RasterPrecalculatedClimateVariable",
		threshold: "rx5day",
	},
	/** Number of Periods with more than 5 Consecutive Dry Days */
	{
		id: "periods_more_5_consecutive_dry_days",
		class: "RasterPrecalculatedClimateVariable",
		threshold: "nr_cdd",
	},
	/** Ice Days */
	{
		id: "ice_days",
		class: "RasterPrecalculatedClimateVariable",
		threshold: "ice_days",
		frequencyConfig: {
			[FrequencyType.ANNUAL]: FrequencyDisplayModeOption.ALWAYS,
		},
	},
	/** First fall frost */
	{
		id: "first_fall_frost",
		class: "RasterPrecalculatedClimateVariable",
		threshold: "first_fall_frost",
		frequencyConfig: {
			[FrequencyType.ANNUAL]: FrequencyDisplayModeOption.ALWAYS,
		},
	},
	/** Frost Days */
	{
		id: "frost_days",
		class: "RasterPrecalculatedClimateVariable",
		threshold: "frost_days",
		frequencyConfig: {
			[FrequencyType.ANNUAL]: FrequencyDisplayModeOption.ALWAYS,
		},
	},
	/** Frost free season */
	{
		id: "frost_free_season",
		class: "RasterPrecalculatedClimateVariable",
		threshold: "frost_free_season",
		frequencyConfig: {
			[FrequencyType.ANNUAL]: FrequencyDisplayModeOption.ALWAYS,
		},
	},
	/** Growing Degree Days (5°C) */
	{
		id: "growing_degree_days_5",
		class: "RasterPrecalculatedClimateVariable",
		threshold: "gddgrow_5",
		frequencyConfig: {
			[FrequencyType.ANNUAL]: FrequencyDisplayModeOption.ALWAYS,
		},
	},
	/** Last spring frost */
	{
		id: "last_spring_frost",
		class: "RasterPrecalculatedClimateVariable",
		threshold: "last_spring_frost",
		frequencyConfig: {
			[FrequencyType.ANNUAL]: FrequencyDisplayModeOption.ALWAYS,
		},
	},
	/** Maximum Number of Consecutive Dry Days */
	{
		id: "max_number_consecutive_dry_days",
		class: "RasterPrecalculatedClimateVariable",
		threshold: "cdd",
		frequencyConfig: {
			[FrequencyType.ANNUAL]: FrequencyDisplayModeOption.ALWAYS,
		},
	},
	/** Maximum 1-Day Total Precipitation */
	{
		id: "max_1d_total_precipitation",
		class: "RasterPrecalculatedClimateVariable",
		threshold: "rx1day",
		frequencyConfig: {
			[FrequencyType.ANNUAL]: FrequencyDisplayModeOption.ALWAYS,
			[FrequencyType.ALL_MONTHS]: FrequencyDisplayModeOption.DOWNLOAD,
			[FrequencyType.MONTHLY]: FrequencyDisplayModeOption.ALWAYS,
			[FrequencyType.SEASONAL]: FrequencyDisplayModeOption.ALWAYS,
		},
	},
	/** Mean Temperature */
	{
		id: "mean_temp",
		class: "RasterPrecalculatedClimateVariable",
		threshold: "tg_mean",
		frequencyConfig: {
			[FrequencyType.ANNUAL]: FrequencyDisplayModeOption.ALWAYS,
			[FrequencyType.ALL_MONTHS]: FrequencyDisplayModeOption.DOWNLOAD,
			[FrequencyType.MONTHLY]: FrequencyDisplayModeOption.ALWAYS,
			[FrequencyType.SEASONAL]: FrequencyDisplayModeOption.ALWAYS,
		},
	},
	/** Days with Humidex above threshold */
	{
		id: "days_humidex_above_threshold",
		class: "RasterPrecalculatedClimateVariable",
		versions: [ "cmip6" ],
		gridType: "era5landgrid",
		thresholds: [
			{
				value: "HXmax30",
				label: "30",
			},
			{
				value: "HXmax35",
				label: "35",
			},
			{
				value: "HXmax40",
				label: "40",
			},
		],
		frequencyConfig: {
			[FrequencyType.ANNUAL]: FrequencyDisplayModeOption.ALWAYS,
			[FrequencyType.ALL_MONTHS]: FrequencyDisplayModeOption.DOWNLOAD,
			[FrequencyType.MONTHLY]: FrequencyDisplayModeOption.ALWAYS,
			[FrequencyType.SEASONAL]: FrequencyDisplayModeOption.ALWAYS,
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
		hasDownload: false,
		layerStyles: "CDC:building_climate_zones",
		frequencyConfig: {
			[FrequencyType.ANNUAL]: FrequencyDisplayModeOption.ALWAYS,
		},
		interactiveRegionConfig: {
			[InteractiveRegionOption.GRIDDED_DATA]: true,
			[InteractiveRegionOption.CENSUS]: false,
			[InteractiveRegionOption.HEALTH]: false,
			[InteractiveRegionOption.WATERSHED]: false
		},
		hasDelta: false,
	},
	/** Maximum Temperature */
	{
		id: "maximum_temperature",
		class: "RasterPrecalculatedWithDailyFormatsClimateVariable",
		threshold: "tx_mean",
		frequencyConfig: {
			[FrequencyType.ANNUAL]: FrequencyDisplayModeOption.ALWAYS,
			[FrequencyType.ALL_MONTHS]: FrequencyDisplayModeOption.DOWNLOAD,
			[FrequencyType.MONTHLY]: FrequencyDisplayModeOption.ALWAYS,
			[FrequencyType.SEASONAL]: FrequencyDisplayModeOption.ALWAYS,
			[FrequencyType.DAILY]: FrequencyDisplayModeOption.DOWNLOAD,
		},
	},
	/** Minimum Temperature */
	{
		id: "minimum_temperature",
		class: "RasterPrecalculatedWithDailyFormatsClimateVariable",
		threshold: "tn_mean",
		frequencyConfig: {
			[FrequencyType.ANNUAL]: FrequencyDisplayModeOption.ALWAYS,
			[FrequencyType.ALL_MONTHS]: FrequencyDisplayModeOption.DOWNLOAD,
			[FrequencyType.MONTHLY]: FrequencyDisplayModeOption.ALWAYS,
			[FrequencyType.SEASONAL]: FrequencyDisplayModeOption.ALWAYS,
			[FrequencyType.DAILY]: FrequencyDisplayModeOption.DOWNLOAD,
		},
	},
	/** Standardized precipitation evapotranspiration index (12-months) */
	{
		id: "spei_12",
		class: "RasterPrecalculatedClimateVariable",
		threshold: "spei_12m",
		versions: [ "cmip5" ],
		frequencyConfig: {
			[FrequencyType.ALL_MONTHS]: FrequencyDisplayModeOption.DOWNLOAD,
			[FrequencyType.MONTHLY]: FrequencyDisplayModeOption.ALWAYS,
		},
		interactiveRegionConfig: {
			[InteractiveRegionOption.GRIDDED_DATA]: true,
			[InteractiveRegionOption.CENSUS]: false,
			[InteractiveRegionOption.HEALTH]: false,
			[InteractiveRegionOption.WATERSHED]: false
		},
		averagingOptions: [
			AveragingType.ALL_YEARS,
		],
	},
	/** Standardized precipitation evapotranspiration index (3-months) */
	{
		id: "spei_3",
		class: "RasterPrecalculatedClimateVariable",
		threshold: "spei_3m",
		versions: [ "cmip5" ],
		frequencyConfig: {
			[FrequencyType.ALL_MONTHS]: FrequencyDisplayModeOption.DOWNLOAD,
			[FrequencyType.MONTHLY]: FrequencyDisplayModeOption.ALWAYS,
		},
		interactiveRegionConfig: {
			[InteractiveRegionOption.GRIDDED_DATA]: true,
			[InteractiveRegionOption.CENSUS]: false,
			[InteractiveRegionOption.HEALTH]: false,
			[InteractiveRegionOption.WATERSHED]: false
		},
		averagingOptions: [
			AveragingType.ALL_YEARS,
		],
	},
	/** Total Precipitation */
	{
		id: "total_precipitation",
		class: "RasterPrecalculatedWithDailyFormatsClimateVariable",
		threshold: "prcptot",
		frequencyConfig: {
			[FrequencyType.ANNUAL]: FrequencyDisplayModeOption.ALWAYS,
			[FrequencyType.ALL_MONTHS]: FrequencyDisplayModeOption.DOWNLOAD,
			[FrequencyType.MONTHLY]: FrequencyDisplayModeOption.ALWAYS,
			[FrequencyType.SEASONAL]: FrequencyDisplayModeOption.ALWAYS,
			[FrequencyType.DAILY]: FrequencyDisplayModeOption.DOWNLOAD,
		},
	},
	/** Average ‘Wet Day’ Precipitation Intensity */
	{
		id: "average_wet_day_precipitation_intensity",
		class: "AnalyzeClimateVariable",
		hasMap: false,
		hasDelta: false,
	},
	/** Cold Spell Days */
	{
		id: "cold_spell_days",
		class: "AnalyzeClimateVariable",
		hasMap: false,
		hasDelta: false,
	},
	/** Cooling Degree Days */
	{
		id: "cooling_degree_days",
		class: "AnalyzeClimateVariable",
		threshold: "cddcold_18",
		frequencyConfig: {
			[FrequencyType.ANNUAL]: FrequencyDisplayModeOption.ALWAYS,
		},
		averagingOptions: [
			AveragingType.ALL_YEARS,
			AveragingType.THIRTY_YEARS,
		],
	},
	/** Days above HXmax */
	{
		id: "days_above_hxmax",
		class: "AnalyzeClimateVariable",
		hasMap: false,
		hasDelta: false,
		versions: [ "humidex" ],
		scenarios: {
			humidex: [
				"ssp126",
				"ssp245",
				"ssp585",
			],
		},
		gridType: "era5landgrid",
	},
	/** Days above Tmax */
	{
		id: "days_above_tmax",
		class: "AnalyzeClimateVariable",
		thresholds: [
			{
				value: "txgt_25",
				label: "25 ºC",
			},
			{
				value: "txgt_27",
				label: "27 ºC",
			},
			{
				value: "txgt_29",
				label: "29 ºC",
			},
			{
				value: "txgt_30",
				label: "30 ºC",
			},
			{
				value: "txgt_32",
				label: "32 ºC",
			},
		],
		averagingOptions: [
			AveragingType.ALL_YEARS,
			AveragingType.THIRTY_YEARS,
		],
	},
	/** Days above Tmax and Tmin */
	{
		id: "days_above_tmax_and_tmin",
		class: "AnalyzeClimateVariable",
		hasMap: false,
		hasDelta: false,
	},
	/** Days below temperature threshold */
	{
		id: "days_below_temperature_threshold",
		class: "AnalyzeClimateVariable",
		thresholds: [
			{
				value: "tnlt_-15",
				label: "-15 ºC",
			},
			{
				value: "tnlt_-25",
				label: "-25 ºC",
			},
		],
		averagingOptions: [
			AveragingType.ALL_YEARS,
			AveragingType.THIRTY_YEARS,
		],
	},
	/** Degree days exceedance date */
	{
		id: "degree_days_exceedance_date",
		class: "AnalyzeClimateVariable",
		hasMap: false,
		hasDelta: false,
	},
	/** Freeze-Thaw Cycles */
	{
		id: "freeze_thaw_cycles",
		class: "AnalyzeClimateVariable",
		threshold: "dlyfrzthw_tx0_tn-1",
		frequencyConfig: {
			[FrequencyType.ANNUAL]: FrequencyDisplayModeOption.ALWAYS,
			[FrequencyType.ANNUAL_JUL_JUN]: FrequencyDisplayModeOption.DOWNLOAD,
		},
		averagingOptions: [
			AveragingType.ALL_YEARS,
			AveragingType.THIRTY_YEARS,
		],
	},
	/** Heat Wave Frequency */
	{
		id: "heat_wave_frequency",
		class: "AnalyzeClimateVariable",
		hasMap: false,
		hasDelta: false,
	},
	/** Heat Wave */
	{
		id: "heat_wave_index",
		class: "AnalyzeClimateVariable",
		hasMap: false,
		hasDelta: false,
	},
	/** Heat Wave Total Duration */
	{
		id: "heat_wave_total_duration",
		class: "AnalyzeClimateVariable",
		hasMap: false,
		hasDelta: false,
	},
	/** Heating Degree Days */
	{
		id: "heating_degree_days",
		class: "AnalyzeClimateVariable",
		threshold: "hddheat_18",
		frequencyConfig: {
			[FrequencyType.ANNUAL]: FrequencyDisplayModeOption.ALWAYS,
			[FrequencyType.ALL_MONTHS]: FrequencyDisplayModeOption.DOWNLOAD,
			[FrequencyType.SEASONAL]: FrequencyDisplayModeOption.ALWAYS,
			[FrequencyType.ANNUAL_JUL_JUN]: FrequencyDisplayModeOption.DOWNLOAD,
		},
		averagingOptions: [
			AveragingType.ALL_YEARS,
			AveragingType.THIRTY_YEARS,
		],
	},
	/** Maximum Consecutive Dry Days */
	{
		id: "maximum_consecutive_dry_days",
		class: "AnalyzeClimateVariable",
		hasMap: false,
		hasDelta: false,
	},
	/** Maximum Consecutive Wet Days */
	{
		id: "maximum_consecutive_wet_days",
		class: "AnalyzeClimateVariable",
		hasMap: false,
		hasDelta: false,
	},
	/** Tropical Nights (Days with Tmin above threshold) */
	{
		id: "tropical_nights_days_with_tmin_above_threshold",
		class: "AnalyzeClimateVariable",
		thresholds: [
			{
				value: "tr_18",
				label: "18 ºC",
			},
			{
				value: "tr_20",
				label: "20 ºC",
			},
			{
				value: "tr_22",
				label: "22 ºC",
			},
		],
		averagingOptions: [
			AveragingType.ALL_YEARS,
			AveragingType.THIRTY_YEARS,
		],
	},
	/** Wet Days */
	{
		id: "wet_days",
		class: "AnalyzeClimateVariable",
		thresholds: [
			{
				value: "r1mm",
				label: "1 mm",
			},
			{
				value: "r10mm",
				label: "10 mm",
			},
			{
				value: "r20mm",
				label: "20 mm",
			},
		],
		averagingOptions: [
			AveragingType.ALL_YEARS,
			AveragingType.THIRTY_YEARS,
		],
	},
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
			}
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
				"ssp585",
			],
		},
		interactiveRegionConfig: {
			[InteractiveRegionOption.GRIDDED_DATA]: true,
			[InteractiveRegionOption.CENSUS]: true,
			[InteractiveRegionOption.HEALTH]: true,
			[InteractiveRegionOption.WATERSHED]: true
		},
		frequencyConfig: {
			[FrequencyType.ANNUAL]: FrequencyDisplayModeOption.ALWAYS,
			[FrequencyType.MONTHLY]: FrequencyDisplayModeOption.ALWAYS,
			[FrequencyType.SEASONAL]: FrequencyDisplayModeOption.DOWNLOAD,
			[FrequencyType.ALL_MONTHS]: FrequencyDisplayModeOption.DOWNLOAD,
			[FrequencyType.DAILY]: FrequencyDisplayModeOption.DOWNLOAD,
			[FrequencyType.ANNUAL_JUL_JUN]: FrequencyDisplayModeOption.NONE,
		},
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
		hasDelta: false,
		defaultColourScheme: [
			"#ffffcc",
			"#fff8ba",
			"#fff4b2",
			"#ffeda0",
			"#ffe58f",
			"#fee187",
			"#fed976",
			"#fec965",
			"#fec25d",
			"#feb24c",
			"#fea346",
			"#fd9c42",
			"#fd8d3c",
			"#fd7435",
			"#fc6731",
			"#fc4e2a",
			"#f23924",
			"#ed2f22",
			"#e31a1c",
			"#d41020",
			"#cc0a22",
			"#bd0026",
			"#a50026",
			"#990026",
			"#800026",
		],
		enableColourOptions: true,
		analysisFields: [
			{
				key: "tasmin",
				type: "input",
				label: "Tasmin",
				description: "Tasmin description",
				help: "Tasmin help",
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
];
