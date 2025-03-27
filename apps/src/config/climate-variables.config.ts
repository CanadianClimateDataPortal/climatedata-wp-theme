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
	{
		id: "hottest_day",
		class: "RasterPrecalculatedClimateVariable",
		threshold: "tx_max",
	},
	{
		id: "test_variable",
		class: "ClimateVariableBase",
		versions: [
			"cmip5",
			"cmip6"
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
		averagingOptions: [
			AveragingType.ALL_YEARS,
			AveragingType.THIRTY_YEARS
		],
		dateRangeConfig: {
			min: "2000",
			max: "2020",
			interval: 5
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
