import {
	ClimateVariableConfigInterface,
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
				value: 1,
				label: "Value 1",
			},
			{
				value: 2,
				label: "Value 2",
			}
		],
		scenarios: [
			{
				value: "scenario1",
				label: "Scenario 1",
				version: "cmip5",
			},
			{
				value: "scenario2",
				label: "Scenario 2",
				version: "cmip5",
			},
			{
				value: "scenario3",
				label: "Scenario 3",
				version: "cmip6",
			},
			{
				value: "scenario4",
				label: "Scenario 4",
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
			seasons: FrequencyDisplayModeOption.NONE
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
	},
];
