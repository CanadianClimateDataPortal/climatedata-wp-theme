import ClimateVariableBase from "@/lib/climate-variable-base";
import {
	AveragingType,
	DateRangeConfig,
	DownloadType,
	FileFormatType,
	FrequencyConfig,
	FrequencyDisplayModeOption,
	FrequencyType,
	InteractiveRegionConfig,
	InteractiveRegionOption,
	ScenariosConfig
} from "@/types/climate-variable-interface";

class AnalyzeClimateVariable extends ClimateVariableBase {

	getVersions(): string[] {
		return super.getVersions().length > 0
			? super.getVersions()
			: [
				"cmip6",
				"cmip5",
			];
	}

	getScenariosConfig(): ScenariosConfig | null {
		return super.getScenariosConfig()
			? super.getScenariosConfig()
			: {
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
		return super.getInteractiveRegionConfig()
			? super.getInteractiveRegionConfig()
			: {
				[InteractiveRegionOption.GRIDDED_DATA]: true,
				[InteractiveRegionOption.CENSUS]: true,
				[InteractiveRegionOption.HEALTH]: true,
				[InteractiveRegionOption.WATERSHED]: true
			};
	}

	getFrequencyConfig(): FrequencyConfig | null {
		return super.getFrequencyConfig()
			? super.getFrequencyConfig()
			: {
				[FrequencyType.ANNUAL]: FrequencyDisplayModeOption.ALWAYS,
				[FrequencyType.ALL_MONTHS]: FrequencyDisplayModeOption.DOWNLOAD,
				[FrequencyType.MONTHLY]: FrequencyDisplayModeOption.ALWAYS,
				[FrequencyType.SEASONAL]: FrequencyDisplayModeOption.ALWAYS,
				[FrequencyType.ANNUAL_JUL_JUN]: FrequencyDisplayModeOption.DOWNLOAD,
			};
	}

	getGridType(): string | null {
		return super.getGridType() ? super.getGridType() : "canadagrid";
	}

	hasDelta(): boolean | undefined {
		return super.hasDelta() !== undefined
			? super.hasDelta()
			: true;
	}

	getFrequency(): string | null {
		return super.getFrequency() ? super.getFrequency() : FrequencyType.ANNUAL;
	}

	getAveragingOptions(): AveragingType[] {
		return super.getAveragingOptions().length > 0
			? super.getAveragingOptions()
			: [
				AveragingType.ALL_YEARS,
				AveragingType.THIRTY_YEARS
			];
	}

	getFileFormatTypes(): FileFormatType[] {
		return super.getFileFormatTypes().length > 0
			? super.getFileFormatTypes()
			: [
				FileFormatType.CSV,
				FileFormatType.NetCDF,
			];
	}

	getDateRangeConfig(): DateRangeConfig | null {
		return super.getDateRangeConfig()
			? super.getDateRangeConfig()
			: {
				min: "1950",
				max: "2100",
				interval: 30
			};
	}

	getDownloadType(): DownloadType | null {
		return super.getDownloadType() ?? DownloadType.ANALYZED;
	}
}

export default AnalyzeClimateVariable;
