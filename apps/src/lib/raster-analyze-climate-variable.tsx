import ClimateVariableBase from "@/lib/climate-variable-base";
import RasterPrecalculatedClimateVariable from "@/lib/raster-precalculated-climate-variable";
import {
	AveragingType,
	DateRangeConfig,
	DownloadType,
	FileFormatType,
	FrequencyConfig,
	FrequencyDisplayModeOption,
	FrequencyType,
	InteractiveMode,
} from "@/types/climate-variable-interface";

class RasterAnalyzeClimateVariable extends RasterPrecalculatedClimateVariable {

	getVersions(): string[] {
		return this.getDatasetType() === "ahccd" ? [] : super.getVersions();
	}

	getDateRangeConfig(): DateRangeConfig | null {
		return this.getDatasetType() === "ahccd" ? null : super.getDateRangeConfig();
	}

	getDownloadDateRangeConfig(): DateRangeConfig | null {
		if (this.getDatasetType() === "ahccd") {
			return null;
		}

		return {
			min: "1950",
			max: "2100",
			interval: 5
		};
	}

	getFrequencyConfig(): FrequencyConfig | null {
		return ClimateVariableBase.prototype.getFrequencyConfig.call(this)
			? ClimateVariableBase.prototype.getFrequencyConfig.call(this)
			: {
				[FrequencyType.ANNUAL]: FrequencyDisplayModeOption.ALWAYS,
				[FrequencyType.MONTHLY]: FrequencyDisplayModeOption.ALWAYS,
				[FrequencyType.SEASONAL]: FrequencyDisplayModeOption.DOWNLOAD,
				[FrequencyType.ANNUAL_JUL_JUN]: FrequencyDisplayModeOption.DOWNLOAD,
			};
	}

	getAveragingOptions(): AveragingType[] {
		if (this.getDatasetType() === "ahccd") {
			return [];
		} else {
			return ClimateVariableBase.prototype.getAveragingOptions.call(this).length > 0
				? ClimateVariableBase.prototype.getAveragingOptions.call(this)
				: [];
		}
	}

	getFileFormatTypes(): FileFormatType[] {
		return ClimateVariableBase.prototype.getFileFormatTypes.call(this).length > 0
			? ClimateVariableBase.prototype.getFileFormatTypes.call(this)
			: [
				FileFormatType.CSV,
				FileFormatType.NetCDF,
			];
	}

	getDownloadType(): DownloadType | null {
		return ClimateVariableBase.prototype.getDownloadType.call(this) ?? DownloadType.ANALYZED;
	}

	getScenarios(): string[] {
		return this.getDatasetType() === "ahccd" ? [] : super.getScenarios();
	}

	getPercentileOptions(): string[] {
		return this.getDatasetType() === "ahccd" ? [] : [ "5", "10", "25", "50", "75", "90", "95", ];
	}

	getMissingDataOptions(): string[] {
		return this.getDatasetType() === "ahccd" ? [ "5", "10", "15", "wmo" ] : [];
	}

	getModelOptions(): string[] {
		if (this.getDatasetType() === "ahccd") {
			return [];
		} else {
			if (this.getVersion() === "cmip5") {
				return [ "pcic12", "24models" ];
			} else if (this.getVersion() === "humidex") {
				return [ "humidex_models" ];
			} else {
				return [ "26models" ];
			}
		}
	}

	getInteractiveMode(): InteractiveMode {
		return this.getDatasetType() === "ahccd" ? "station" : super.getInteractiveMode();
	}
}

export default RasterAnalyzeClimateVariable;
