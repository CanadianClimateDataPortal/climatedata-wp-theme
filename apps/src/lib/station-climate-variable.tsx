import ClimateVariableBase from "@/lib/climate-variable-base";
import RasterPrecalculatedClimateVariable from "@/lib/raster-precalculated-climate-variable";
import {
	AveragingType,
	DownloadType,
	FileFormatType,
	FrequencyConfig,
	FrequencyDisplayModeOption,
	FrequencyType,
	InteractiveMode,
	ScenariosConfig,
	DateRangeConfig,
} from "@/types/climate-variable-interface";

class StationClimateVariable extends RasterPrecalculatedClimateVariable {

	getVersions(): string[] {
		return ClimateVariableBase.prototype.getVersions.call(this)
			? ClimateVariableBase.prototype.getVersions.call(this)
			: [];
	}

	getScenariosConfig(): ScenariosConfig | null {
		return ClimateVariableBase.prototype.getScenariosConfig.call(this)
			? ClimateVariableBase.prototype.getScenariosConfig.call(this)
			: {};
	}

	getInteractiveMode(): InteractiveMode {
		return 'station';
	}

	getFrequencyConfig(): FrequencyConfig | null {
		return ClimateVariableBase.prototype.getFrequencyConfig.call(this)
			? ClimateVariableBase.prototype.getFrequencyConfig.call(this)
			: {
				[FrequencyType.ANNUAL]: FrequencyDisplayModeOption.NONE,
				[FrequencyType.MONTHLY]: FrequencyDisplayModeOption.NONE,
				[FrequencyType.SEASONAL]: FrequencyDisplayModeOption.NONE,
				[FrequencyType.ALL_MONTHS]: FrequencyDisplayModeOption.NONE,
			};
	}

	getDateRangeConfig(): DateRangeConfig | null {
		return ClimateVariableBase.prototype.getDateRangeConfig.call(this)
			? ClimateVariableBase.prototype.getDateRangeConfig.call(this)
			: null;
	}

	hasDelta(): boolean | undefined {
		return ClimateVariableBase.prototype.hasDelta.call(this) !== undefined
			? ClimateVariableBase.prototype.hasDelta.call(this)
			: false;
	}

	getAveragingOptions(): AveragingType[] {
		return ClimateVariableBase.prototype.getAveragingOptions.call(this).length > 0
			? ClimateVariableBase.prototype.getAveragingOptions.call(this)
			: [];
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
		return ClimateVariableBase.prototype.getDownloadType.call(this) ?? DownloadType.PRECALCULATED;
	}

	getLocationModalContent(): React.ReactNode {
		// We don't display any value in the modal for station climate variables
		return null;
	}
}

export default StationClimateVariable;
