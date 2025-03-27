import ClimateVariableBase from "@/lib/climate-variable-base";
import {
	FileFormatType,
	FrequencyConfig, FrequencyDisplayModeOption, FrequencyType,
	InteractiveRegionConfig,
	InteractiveRegionOption,
	ScenariosConfig
} from "@/types/climate-variable-interface";

class RasterPrecalculatedClimateVariable extends ClimateVariableBase {

	getVersions(): string[] {
		return [
			"cmip5",
			"cmip6",
		];
	}

	getScenariosConfig(): ScenariosConfig | null {
		return {
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
		};
	}

	getInteractiveRegionConfig(): InteractiveRegionConfig | null {
		return {
			[InteractiveRegionOption.GRIDDED_DATA]: true,
			[InteractiveRegionOption.CENSUS]: true,
			[InteractiveRegionOption.HEALTH]: true,
			[InteractiveRegionOption.WATERSHED]: true
		};
	}

	getFrequencyConfig(): FrequencyConfig | null {
		return {
			[FrequencyType.ANNUAL]: FrequencyDisplayModeOption.ALWAYS,
			[FrequencyType.MONTHLY]: FrequencyDisplayModeOption.ALWAYS,
			[FrequencyType.ALL_MONTHS]: FrequencyDisplayModeOption.DOWNLOAD,
		};
	}

	getFileFormatTypes(): FileFormatType[] | null {
		return [
			FileFormatType.CSV,
			FileFormatType.JSON,
			FileFormatType.NetCDF,
		];
	}
}

export default RasterPrecalculatedClimateVariable;
