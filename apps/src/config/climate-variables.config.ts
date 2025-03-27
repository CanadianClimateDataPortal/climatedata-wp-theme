import {
	AveragingType,
	ClimateVariableConfigInterface,
	DownloadType,
	FileFormatType,
	FrequencyDisplayModeOption,
} from "@/types/climate-variable-interface";

export const ClimateVariables: ClimateVariableConfigInterface[] = [
	{
		id: "test_full",
		class: "ClimateVariableBase",
		name: "Test variable",
		versions: [
			{
				value: "cmip5",
				label: "CMIP5",
			},
			{
				value: "cmip6",
				label: "CMIP6",
			}
		],
		thresholds: [
			{
				value: "tx_max",
				label: "",
			}
		],
		scenarios: [
			{
				value: "rcp26",
				label: "RCP 2.6",
				version: "cmip5",
			},
			{
				value: "rcp45",
				label: "RCP 4.5",
				version: "cmip5",
			},
			{
				value: "rcp85",
				label: "RCP 8.5",
				version: "cmip5",
			},
			{
				value: "ssp126",
				label: "SSP 1–2.6",
				version: "cmip6",
			},
			{
				value: "ssp245",
				label: "SSP 2–4.5",
				version: "cmip6",
			},
			{
				value: "ssp585",
				label: "SSP 5–8.5",
				version: "cmip6",
			},
		],
		interactiveRegionConfig: {
			gridded_data: true,
			census: true,
			health: false,
			watershed: false
		},
		frequencyConfig: {
			annual: FrequencyDisplayModeOption.ALWAYS,
			months: FrequencyDisplayModeOption.ALWAYS,
			seasons: FrequencyDisplayModeOption.DOWNLOAD,
			allMonths: FrequencyDisplayModeOption.DOWNLOAD,
			daily: FrequencyDisplayModeOption.DOWNLOAD
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
		downloadType: DownloadType.PRECALCULATED,
		fileFormatTypes: [
			FileFormatType.CSV,
			FileFormatType.JSON,
			FileFormatType.NetCDF,
		],
	},
];
