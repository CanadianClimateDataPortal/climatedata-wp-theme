import {
	AveragingType,
	ClimateVariableConfigInterface,
	ColourType,
	DownloadType,
	FileFormatType,
	FrequencyDisplayModeOption,
	FrequencyType,
	InteractiveRegionOption,
} from "@/types/climate-variable-interface";


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
		temporalThresholdConfig: {
			thresholds: {
				tx_max: {
					ys: {
						absolute: { low: 6.0, high: 40.0 },
						delta: { low: -1.0, high: 8.0 },
						unit: 'K',
					},
					ms: {
						absolute: { low: -20.0, high: 40.0 },
						delta: { low: -2.0, high: 10.0 },
						unit: 'K',
					},
				},
			},
			decimals: 1,
		},
		analysisFields: [
			{
				key: "degrees",
				type: "input",
				label: "> Degree Celsius",
				description: "This variable returns the number of degree days accumulated when daily mean temperature are above a certain temperature. Please set one below :",
				help: "Degrees help",
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
		unit: "°C",
		temporalThresholdConfig: {
			thresholds: {
				tx_max: {
					ys: {
						absolute: { low: 6.0, high: 40.0 },
						delta: { low: -1.0, high: 8.0 },
						unit: 'K',
					},
					ms: {
						absolute: { low: -20.0, high: 40.0 },
						delta: { low: -2.0, high: 10.0 },
						unit: 'K',
					},
				},
			},
		},
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
		unit: "°C",
		temporalThresholdConfig: {
			thresholds: {
				tn_min: {
					ys: {
						absolute: { low: -60.0, high: -5.0 },
						delta: { low: -2.0, high: 20.0 },
						unit: 'K',
					},
					ms: {
						absolute: { low: -50.0, high: 10.0 },
						delta: { low: -3.0, high: 20.0 },
						unit: 'K',
					},
				},
			},
		},
	},
	/** Cumulative degree-days above 0°C */
	{
		id: "cumulative_degree_days_above_0",
		class: "RasterPrecalculatedClimateVariable",
		threshold: "gddgrow_0",
		temporalThresholdConfig: {
			thresholds: {
				gddgrow_0: {
					ys: {
						absolute: { low: 20.0, high: 5000.0 },
						delta: { low: -300.0, high: 2000.0 },
						unit: 'K days',
					},
					ms: {
						absolute: { low: 0.0, high: 700.0 },
						delta: { low: -40.0, high: 200.0 },
						unit: 'K days',
					},
				},
			},
		},
	},
	/** Maximum 5-Day Precipitation */
	{
		id: "max_5d_total_precipitation",
		class: "RasterPrecalculatedClimateVariable",
		threshold: "rx5day",
		unit: "mm",
		temporalThresholdConfig: {
			thresholds: {
				rx5day: {
					ys: {
						absolute: { low: 10.0, high: 200.0 },
						delta: { low: -4.0, high: 20.0 },
						unit: 'mm',
					},
					ms: {
						absolute: { low: 3.0, high: 100.0 },
						delta: { low: -4.0, high: 10.0 },
						unit: 'mm',
					},
				},
			},
		},
	},
	/** Number of Periods with more than 5 Consecutive Dry Days */
	{
		id: "periods_more_5_consecutive_dry_days",
		class: "RasterPrecalculatedClimateVariable",
		threshold: "nr_cdd",
		temporalThresholdConfig: {
			thresholds: {
				nr_cdd: {
					ys: {
						absolute: { low: 5.0, high: 20.0 },
						delta: { low: -4.0, high: 3.0 },
						unit: '',
					},
					ms: {
						absolute: { low: 0.2, high: 2.0 },
						delta: { low: -0.7, high: 0.3 },
						unit: '',
					},
				},
			},
		},
	},
	/** Ice Days */
	{
		id: "ice_days",
		class: "RasterPrecalculatedClimateVariable",
		threshold: "ice_days",
		frequencyConfig: {
			[FrequencyType.ANNUAL]: FrequencyDisplayModeOption.ALWAYS,
		},
		unit: "days",
		temporalThresholdConfig: {
			thresholds: {
				ice_days: {
					ys: {
						absolute: { low: 1.0, high: 300.0 },
						delta: { low: -60.0, high: 10.0 },
						unit: 'days',
					},
				},
			},
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
		unit: "doy",
		temporalThresholdConfig: {
			thresholds: {
				first_fall_frost: {
					ys: {
						absolute: { low: 200.0, high: 300.0 },
						delta: { low: -10.0, high: 60.0 },
						unit: '',
					},
				},
			},
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
		unit: "days",
		temporalThresholdConfig: {
			thresholds: {
				frost_days: {
					ys: {
						absolute: { low: 20.0, high: 400.0 },
						delta: { low: -80.0, high: 10.0 },
						unit: 'days',
					},
				},
			},
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
		unit: "days",
		temporalThresholdConfig: {
			thresholds: {
				frost_free_season: {
					ys: {
						absolute: { low: 2.0, high: 300.0 },
						delta: { low: -20.0, high: 90.0 },
						unit: 'days',
					},
				},
			},
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
		temporalThresholdConfig: {
			thresholds: {
				gddgrow_5: {
					ys: {
						absolute: { low: 0.5, high: 3000.0 },
						delta: { low: -200.0, high: 1000.0 },
						unit: 'degree_days',
					},
				},
			},
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
		unit: "doy",
		temporalThresholdConfig: {
			thresholds: {
				last_spring_frost: {
					ys: {
						absolute: { low: 60.0, high: 200.0 },
						delta: { low: -40.0, high: 9.0 },
						unit: '',
					},
				},
			},
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
		unit: "days",
		temporalThresholdConfig: {
			thresholds: {
				cdd: {
					ys: {
						absolute: { low: 10.0, high: 100.0 },
						delta: { low: -40.0, high: 9.0 },
						unit: 'days',
					},
				},
			},
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
		unit: "mm",
		temporalThresholdConfig: {
			thresholds: {
				rx1day: {
					ys: {
						absolute: { low: 7.0, high: 90.0 },
						delta: { low: -3.0, high: 10.0 },
						unit: 'mm day-1',
					},
					ms: {
						absolute: { low: 1.0, high: 50.0 },
						delta: { low: -2.0, high: 6.0 },
						unit: 'mm',
					},
					qsdec: {
						absolute: { low: 2.0, high: 70.0 },
						delta: { low: -2.0, high: 8.0 },
						unit: 'mm/day',
					},
				},
			},
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
		unit: "°C",
		temporalThresholdConfig: {
			thresholds: {
				tg_mean: {
					ys: {
						absolute: { low: -20.0, high: 10.0 },
						delta: { low: -2.0, high: 10.0 },
						unit: 'K',
					},
					ms: {
						absolute: { low: -40.0, high: 20.0 },
						delta: { low: -3.0, high: 20.0 },
						unit: 'K',
					},
					qsdec: {
						absolute: { low: -40.0, high: 20.0 },
						delta: { low: -3.0, high: 10.0 },
						unit: 'K',
					},
				},
			},
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
		unit: "days",
		temporalThresholdConfig: {
			thresholds: {
				HXmax30: {
					ys: {
						absolute: { low: 0.0, high: 100.0 },
						delta: { low: -10.0, high: 70.0 },
						unit: 'days',
					},
					ms: {
						absolute: { low: 0.0, high: 20.0 },
						delta: { low: -3.0, high: 20.0 },
						unit: 'days',
					},
					qsdec: {
						absolute: { low: 0.0, high: 70.0 },
						delta: { low: -7.0, high: 40.0 },
						unit: 'days',
					},
				},
				HXmax35: {
					ys: {
						absolute: { low: 0.0, high: 60.0 },
						delta: { low: -5.0, high: 50.0 },
						unit: 'days',
					},
					ms: {
						absolute: { low: 0.0, high: 10.0 },
						delta: { low: -1.0, high: 10.0 },
						unit: 'days',
					},
					qsdec: {
						absolute: { low: 0.0, high: 40.0 },
						delta: { low: -2.0, high: 30.0 },
						unit: 'days',
					},
				},
				HXmax40: {
					ys: {
						absolute: { low: 0.0, high: 30.0 },
						delta: { low: -1.0, high: 20.0 },
						unit: 'days',
					},
					ms: {
						absolute: { low: 0.0, high: 4.0 },
						delta: { low: 0.0, high: 4.0 },
						unit: 'days',
					},
					qsdec: {
						absolute: { low: 0.0, high: 10.0 },
						delta: { low: 0.0, high: 10.0 },
						unit: 'days',
					},
				},
			},
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
			}
		},
		temporalThresholdConfig: {
			thresholds: {
				hddheat_18: {
					ys: {
						absolute: { low: 3000.0, high: 20000.0 },
						delta: { low: -4000.0, high: 700.0 },
						unit: 'degree_days',
					},
				},
			},
		},
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
		unit: "°C",
		temporalThresholdConfig: {
			thresholds: {
				tx_mean: {
					ys: {
						absolute: { low: -20.0, high: 20.0 },
						delta: { low: -2.0, high: 10.0 },
						unit: 'K',
					},
					ms: {
						absolute: { low: -40.0, high: 30.0 },
						delta: { low: -3.0, high: 10.0 },
						unit: 'K',
					},
					qsdec: {
						absolute: { low: -30.0, high: 30.0 },
						delta: { low: -2.0, high: 10.0 },
						unit: 'K',
					},
				},
			},
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
		unit: "°C",
		temporalThresholdConfig: {
			thresholds: {
				tn_mean: {
					ys: {
						absolute: { low: -30.0, high: 8.0 },
						delta: { low: -2.0, high: 10.0 },
						unit: 'K',
					},
					ms: {
						absolute: { low: -40.0, high: 20.0 },
						delta: { low: -3.0, high: 20.0 },
						unit: 'K',
					},
					qsdec: {
						absolute: { low: -40.0, high: 20.0 },
						delta: { low: -3.0, high: 20.0 },
						unit: 'K',
					},
				},
			},
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
		hasDelta: false,
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
		hasDelta: false,
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
		unit: "mm",
		temporalThresholdConfig: {
			thresholds: {
				prcptot: {
					ys: {
						absolute: { low: 60.0, high: 3000.0 },
						delta: { low: -40.0, high: 200.0 },
						unit: 'mm',
					},
					ms: {
						absolute: { low: 6.0, high: 300.0 },
						delta: { low: -10.0, high: 30.0 },
						unit: 'mm day-1',
					},
					qsdec: {
						absolute: { low: 20.0, high: 900.0 },
						delta: { low: -20.0, high: 70.0 },
						unit: 'mm day-1',
					},
				},
			},
		},
	},
	/** Average 'Wet Day' Precipitation Intensity */
	{
		id: "average_wet_day_precipitation_intensity",
		class: "RasterAnalyzeClimateVariable",
		hasDelta: false,
		unit: "mm/day",
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
		unit: "days",
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
		interactiveRegionConfig: {
			[InteractiveRegionOption.GRIDDED_DATA]: true,
			[InteractiveRegionOption.CENSUS]: true,
			[InteractiveRegionOption.HEALTH]: true,
			[InteractiveRegionOption.WATERSHED]: true
		},
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
		temporalThresholdConfig: {
			thresholds: {
				cddcold_18: {
					ys: {
						absolute: { low: 0.0, high: 800.0 },
						delta: { low: -80.0, high: 600.0 },
						unit: 'degree_days',
					},
				},
			},
		},
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
		unit: "days",
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
		frequencyConfig: {
			[FrequencyType.ANNUAL]: FrequencyDisplayModeOption.ALWAYS,
			[FrequencyType.ALL_MONTHS]: FrequencyDisplayModeOption.DOWNLOAD,
			[FrequencyType.MONTHLY]: FrequencyDisplayModeOption.ALWAYS,
			[FrequencyType.SEASONAL]: FrequencyDisplayModeOption.DOWNLOAD,
			[FrequencyType.ANNUAL_JUL_JUN]: FrequencyDisplayModeOption.DOWNLOAD,
		},
		unit: "days",
		temporalThresholdConfig: {
			thresholds: {
				txgt_25: {
					ys: {
						absolute: { low: 0.0, high: 100.0 },
						delta: { low: -10.0, high: 70.0 },
						unit: 'days',
					},
					ms: {
						absolute: { low: 0.0, high: 30.0 },
						delta: { low: -3.0, high: 10.0 },
						unit: 'days',
					},
				},
				txgt_27: {
					ys: {
						absolute: { low: 0.0, high: 100.0 },
						delta: { low: -10.0, high: 60.0 },
						unit: 'days',
					},
					ms: {
						absolute: { low: 0.0, high: 20.0 },
						delta: { low: -3.0, high: 20.0 },
						unit: 'days',
					},
				},
				txgt_29: {
					ys: {
						absolute: { low: 0.0, high: 80.0 },
						delta: { low: -10.0, high: 60.0 },
						unit: 'days',
					},
					ms: {
						absolute: { low: 0.0, high: 20.0 },
						delta: { low: -2.0, high: 10.0 },
						unit: 'days',
					},
				},
				txgt_30: {
					ys: {
						absolute: { low: 0.0, high: 70.0 },
						delta: { low: -8.0, high: 50.0 },
						unit: 'days',
					},
					ms: {
						absolute: { low: 0.0, high: 20.0 },
						delta: { low: -1.0, high: 10.0 },
						unit: 'days',
					},
				},
				txgt_32: {
					ys: {
						absolute: { low: 0.0, high: 50.0 },
						delta: { low: -5.0, high: 40.0 },
						unit: 'days',
					},
					ms: {
						absolute: { low: 0.0, high: 10.0 },
						delta: { low: -0.7, high: 9.0 },
						unit: 'days',
					},
				},
			},
		},
	},
	/** Days above Tmax and Tmin */
	{
		id: "days_above_tmax_and_tmin",
		class: "RasterAnalyzeClimateVariable",
		hasDelta: false,
		unit: "days",
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
		unit: "days",
		temporalThresholdConfig: {
			thresholds: {
				'tnlt_-15': {
					ys: {
						absolute: { low: 0.0, high: 300.0 },
						delta: { low: -100.0, high: 10.0 },
						unit: 'days',
					},
					ms: {
						absolute: { low: 0.0, high: 30.0 },
						delta: { low: -20.0, high: 5.0 },
						unit: 'days',
					},
				},
				'tnlt_-25': {
					ys: {
						absolute: { low: 0.0, high: 200.0 },
						delta: { low: -100.0, high: 20.0 },
						unit: 'days',
					},
					ms: {
						absolute: { low: 0.0, high: 30.0 },
						delta: { low: -20.0, high: 5.0 },
						unit: 'days',
					},
				},
			},
		},
	},
	/** Degree days exceedance date */
	{
		id: "degree_days_exceedance_date",
		class: "RasterAnalyzeClimateVariable",
		hasDelta: false,
		unit: "doy",
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
					type: "date",
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
		unit: "days",
		temporalThresholdConfig: {
			thresholds: {
				'dlyfrzthw_tx0_tn-1': {
					ys: {
						absolute: { low: 8.0, high: 100.0 },
						delta: { low: -40.0, high: 8.0 },
						unit: 'days',
					},
				},
			},
		},
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
		unit: "days",
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
		unit: "days",
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
		unit: "days",
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
		unit: "days",
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
		unit: "days",
		temporalThresholdConfig: {
			thresholds: {
				tr_18: {
					ys: {
						absolute: { low: 0.0, high: 60.0 },
						delta: { low: -5.0, high: 50.0 },
						unit: 'days',
					},
					ms: {
						absolute: { low: 0.0, high: 10.0 },
						delta: { low: -0.9, high: 10.0 },
						unit: 'days',
					},
				},
				tr_20: {
					ys: {
						absolute: { low: 0.0, high: 40.0 },
						delta: { low: -2.0, high: 30.0 },
						unit: 'days',
					},
					ms: {
						absolute: { low: 0.0, high: 8.0 },
						delta: { low: -0.3, high: 7.0 },
						unit: 'days',
					},
				},
				tr_22: {
					ys: {
						absolute: { low: 0.0, high: 20.0 },
						delta: { low: -0.4, high: 20.0 },
						unit: 'days',
					},
					ms: {
						absolute: { low: 0.0, high: 3.0 },
						delta: { low: -0.03, high: 3.0 },
						unit: 'days',
					},
				},
			},
		},
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
		unit: "days",
		temporalThresholdConfig: {
			thresholds: {
				r1mm: {
					ys: {
						absolute: {low: 20.0, high: 200.0},
						delta: {low: -7.0, high: 40.0},
						unit: 'days',
					},
					ms: {
						absolute: {low: 0.7, high: 20.0},
						delta: {low: -2.0, high: 6.0},
						unit: 'days',
					},
					qsdec: {
						absolute: {low: 2.0, high: 70.0},
						delta: {low: -4.0, high: 20.0},
						unit: 'days',
					},
				},
				r10mm: {
					ys: {
						absolute: {low: 0.1, high: 100.0},
						delta: {low: -2.0, high: 9.0},
						unit: 'days',
					},
					ms: {
						absolute: {low: 0.0, high: 6.0},
						delta: {low: -0.2, high: 0.6},
						unit: 'days',
					},
					qsdec: {
						absolute: {low: 0.0, high: 20.0},
						delta: {low: -0.3, high: 2.0},
						unit: 'days',
					},
				},
				r20mm: {
					ys: {
						absolute: {low: 0.0, high: 50.0},
						delta: {low: -0.8, high: 5.0},
						unit: 'days',
					},
					ms: {
						absolute: {low: 0.0, high: 6.0},
						delta: {low: -0.2, high: 0.6},
						unit: 'days',
					},
					qsdec: {
						absolute: {low: 0.0, high: 20.0},
						delta: {low: -0.3, high: 2.0},
						unit: 'days',
					},
				},
			},
		},
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
	},
];
