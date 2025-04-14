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
		analysisFields: [
			{
				key: "tasmin",
				type: "input",
				label: "Tasmin",
				description: "Tasmin description",
				help: "Tasmin help",
				attributes: {
					type: "text",
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
		class: "RasterAnalyzeClimateVariable",
		hasDelta: false,
		analysisFields: [
			{
				key: "thresh",
				type: "input",
				label: "Average Daily Precipitation on Wet Days",
				description: 'Set the minimum precipitation required for a day to be classified as wet.',
				help: 'Days with precipitation greater than or equal to this value will be included in the average calculation of wet day precipitation.',
				comparison: '>=',
				unit: 'mm/dd',
				attributes: {
					type: "number",
					placeholder: "0",
				}
			}
		],
	},
	/** Cold Spell Days */
	{
		id: "cold_spell_days",
		class: "RasterAnalyzeClimateVariable",
		hasDelta: false,
		analysisFields: [
			{
				key: "window",
				type: "input",
				label: 'Minimum Consecutive Days',
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
				description: 'Set the maximum mean daily temperature allowed for a day to be counted in a cold spell.',
				help: 'Days with a mean daily temperature below this threshold are considered part of a cold spell.',
				unit: 'C',
				comparison: '<',
				attributes: {
					type: "number",
					placeholder: "0",
				}
			}
		],
	},
	/** Cooling Degree Days */
	{
		id: "cooling_degree_days",
		class: "RasterAnalyzeClimateVariable",
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
		class: "RasterAnalyzeClimateVariable",
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
		class: "RasterAnalyzeClimateVariable",
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
		analysisFields: [
			{
				key: "thresh",
				type: "input",
				label: 'Temperature Threshold (°C)',
				description: 'Set the minimum daily maximum temperature required for a day to be included in the count.',
				help: 'Days with a maximum temperature greater than this threshold will be counted in the analysis.',
				unit: 'C',
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
	},
	/** Days above Tmax and Tmin */
	{
		id: "days_above_tmax_and_tmin",
		class: "RasterAnalyzeClimateVariable",
		hasDelta: false,
	},
	/** Days below temperature threshold */
	{
		id: "days_below_temperature_threshold",
		class: "RasterAnalyzeClimateVariable",
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
		analysisFields: [
			{
				key: "thresh_tasmin",
				type: "input",
				label: 'Minimum Temperature Threshold (°C)',
				description: 'Set the threshold for daily minimum temperature.',
				help: 'Only days where the minimum temperature exceeds this value will be included in the analysis.',
				unit: 'C',
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
				description: 'Set the threshold for daily maximum temperature.',
				help: 'Only days where the maximum temperature exceeds this value will be included in the analysis.',
				unit: 'C',
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
	},
	/** Degree days exceedance date */
	{
		id: "degree_days_exceedance_date",
		class: "RasterAnalyzeClimateVariable",
		hasDelta: false,
		analysisFields: [
			{
				key: "sum_thresh",
				type: "input",
				label: 'Degree-Day Total Threshold',
				description: 'Set the degree-day total that must be exceeded to trigger the result.',
				help: 'This value defines the cumulative degree-day target. The result will be the day of year when this threshold is surpassed.',
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
				unit: 'C',
				attributes: {
					type: "number",
					placeholder: "0",
				}
			},
			{
				key: "after_date",
				type: "input",
				label: 'Start Date (MM-DD)',
				description: 'Specify the date to begin accumulating degree-days.',
				help: 'Use a date like "09-01" to start from September 1st. Avoid end-of-month dates due to inconsistencies in some climate models.',
				unit: 'MM-DD',
				attributes: {
					type: "text",
					placeholder: "0",
				}
			}
		]
	},

	/** Freeze-Thaw Cycles */
	{
		id: "freeze_thaw_cycles",
		class: "RasterAnalyzeClimateVariable",
		threshold: "dlyfrzthw_tx0_tn-1",
		analysisFields: [
			{
				key: "thresh_tasmax",
				type: "input",
				label: 'Maximum Temperature Threshold (°C)',
				description: 'Set the threshold for daily maximum temperature.',
				help: 'Only days where the maximum temperature satisfies the comparison condition will be included in the analysis.',
				unit: 'C',
				comparison: '>',
				attributes: {
					type: "number",
					placeholder: "0",
				}
			},
			{
				key: "thresh_tasmin",
				type: "input",
				label: 'Maximum Temperature Comparison Operator',
				description: 'Select the comparison operator for the maximum temperature threshold.',
				help: 'Choose whether the maximum temperature must be greater than (>) or less than or equal to (<=) the threshold.',
				unit: 'C',
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
		},
		averagingOptions: [
			AveragingType.ALL_YEARS,
			AveragingType.THIRTY_YEARS,
		],
	},
	/** Heat Wave Frequency */
	{
		id: "heat_wave_frequency",
		class: "RasterAnalyzeClimateVariable",
		hasDelta: false,
		analysisFields: [
						{
				key: "thresh_tasmin",
				type: "input",
				label: 'Maximum Temperature Threshold (°C)',
				description: 'Set the maximum temperature required for a day to be included in a heat wave.',
				help: 'Only days where the daily maximum temperature is above this threshold will count toward a heat wave.',
				unit: 'C',
				comparison: '>',
				attributes: {
					type: "number",
					placeholder: "0",
				}
			},
			{
				key: "window",
				type: "input",
				label: 'Minimum Consecutive Days',
				description: 'Set the number of consecutive qualifying days required to define a heat wave.',
				help: 'A heat wave is defined as a sequence of consecutive days that meet both temperature thresholds. This value controls how many days must be in that sequence.',
				unit: 'days',
				attributes: {
					type: "number",
					placeholder: "0",
				}
			},
		],
	},
	/** Heat Wave */
	{
		id: "heat_wave_index",
		class: "RasterAnalyzeClimateVariable",
		hasDelta: false,
		analysisFields: [
			{
				key: "window",
				type: "input",
				label: 'Minimum Consecutive Days',
				description: 'Set the number of consecutive hot days required to define a heat wave.',
				help: 'A heat wave is defined as a sequence of consecutive days where the maximum temperature meets the threshold. This value determines how long that sequence must be.',
				unit: 'days',
				attributes: {
					type: "number",
					placeholder: "0",
				}
			},
			{
				key: "thresh_tasmin",
				type: "input",
				label: 'Maximum Temperature Threshold (°C)',
				description: 'Set the maximum temperature required for a day to be counted in a heat wave.',
				help: 'Only days where the daily maximum temperature exceeds this threshold will be included in the heat wave calculation.',
				unit: 'C',
				comparison: '>',
				attributes: {
					type: "number",
					placeholder: "0",
				}
			},
		],
	},
	/** Heat Wave Total Duration */
	{
		id: "heat_wave_total_duration",
		class: "RasterAnalyzeClimateVariable",
		hasDelta: false,
		analysisFields: [
			{
				key: "thresh_tasmin",
				type: "input",
				label: 'Minimum Temperature Threshold (°C)',
				description: 'Set the threshold for daily minimum temperature during a heat wave event.',
				help: 'Only days where the daily minimum temperature exceeds this threshold will count toward the heat wave event.',
				unit: 'C',
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
				description: 'Set the threshold for daily maximum temperature during a heat wave event.',
				help: 'Only days where the daily maximum temperature exceeds this threshold will count toward the heat wave event.',
				unit: 'C',
				comparison: '>',
				attributes: {
					type: "number",
					placeholder: "0",
				}
			},
			{
				key: "window",
				type: "input",
				label: 'Minimum Consecutive Days',
				description: 'Set the minimum number of consecutive days required for a heat wave event.',
				help: 'A heat wave event is defined as a sequence of consecutive days meeting both temperature thresholds.',
				unit: 'days',
				attributes: {
					type: "number",
					placeholder: "0",
				}
			},
		],
	},
	/** Heating Degree Days */
	{
		id: "heating_degree_days",
		class: "RasterAnalyzeClimateVariable",
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
		class: "RasterAnalyzeClimateVariable",
		hasDelta: false,
		analysisFields: [
			{
				key: "thresh",
				type: "input",
				label: 'Precipitation Threshold (mm/day)',
				description: 'Set the maximum daily precipitation allowed for a day to be considered dry.',
				help: 'Only days where precipitation is below this threshold will be considered in the dry spell analysis.',
				unit: 'mm/day',
				comparison: '<',
				attributes: {
					type: "number",
					placeholder: "0",
				}
			},
		],
	},
	/** Maximum Consecutive Wet Days */
	{
		id: "maximum_consecutive_wet_days",
		class: "RasterAnalyzeClimateVariable",
		hasDelta: false,
		analysisFields: [
			{
				key: "thresh",
				type: "input",
				label: 'Precipitation Threshold (mm/day)',
				description: 'Set the minimum daily precipitation required to count a day as wet.',
				help: 'Only days with precipitation above this threshold are included in the wet day streak calculation.',
				unit: 'mm/day',
				comparison: '>',
				attributes: {
					type: "number",
					placeholder: "0",
				}
			},
		],
	},
	/** Tropical Nights (Days with Tmin above threshold) */
	{
		id: "tropical_nights_days_with_tmin_above_threshold",
		class: "RasterAnalyzeClimateVariable",
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
		class: "RasterAnalyzeClimateVariable",
		analysisFields: [
			{
				key: "thresh",
				type: "input",
				label: "Number of Wet Days",
				description: 'Set the precipitation value that defines a wet day.',
				help: 'Days with precipitation greater than this threshold will be counted as wet days in the analysis.',
				comparison: '>',
				unit: 'mm/dd',
				attributes: {
					type: "number",
					placeholder: "0",
				}
			}
		],
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
