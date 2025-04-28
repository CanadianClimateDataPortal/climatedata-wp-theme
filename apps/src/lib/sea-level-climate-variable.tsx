import ClimateVariableBase from "@/lib/climate-variable-base";
import RasterPrecalculatedClimateVariable from "@/lib/raster-precalculated-climate-variable";
import {
	AveragingType,
	DownloadType,
	FileFormatType,
	FrequencyConfig,
	FrequencyDisplayModeOption,
	FrequencyType,
	InteractiveRegionConfig,
	InteractiveRegionOption,
	ScenariosConfig
} from "@/types/climate-variable-interface";
import SeaLevelClimateVariableValues from "@/components/map-layers/sea-level-climate-variable-values";

class SeaLevelClimateVariable extends RasterPrecalculatedClimateVariable {

	getVersions(): string[] {
		return ClimateVariableBase.prototype.getVersions.call(this).length > 0
			? ClimateVariableBase.prototype.getVersions.call(this)
			: [
				"cmip5",
			];
	}

	getScenariosConfig(): ScenariosConfig | null {
		return ClimateVariableBase.prototype.getScenariosConfig.call(this)
			? ClimateVariableBase.prototype.getScenariosConfig.call(this)
			: {
				cmip5: [
					"rcp85plus65-p50",
					"rcp85-p05",
					"rcp85-p50",
					"rcp85-p95",
					"rcp45-p05",
					"rcp45-p50",
					"rcp45-p95",
					"rcp26-p05",
					"rcp26-p50",
					"rcp26-p95",
				],
			};
	}

	getInteractiveRegionConfig(): InteractiveRegionConfig | null {
		return ClimateVariableBase.prototype.getInteractiveRegionConfig.call(this)
			? ClimateVariableBase.prototype.getInteractiveRegionConfig.call(this)
			: {
				[InteractiveRegionOption.GRIDDED_DATA]: true,
				[InteractiveRegionOption.CENSUS]: false,
				[InteractiveRegionOption.HEALTH]: false,
				[InteractiveRegionOption.WATERSHED]: false
			};
	}

	getFrequencyConfig(): FrequencyConfig | null {
		return ClimateVariableBase.prototype.getFrequencyConfig.call(this)
			? ClimateVariableBase.prototype.getFrequencyConfig.call(this)
			: {
				[FrequencyType.ANNUAL]: FrequencyDisplayModeOption.ALWAYS,
				[FrequencyType.MONTHLY]: FrequencyDisplayModeOption.NONE,
				[FrequencyType.SEASONAL]: FrequencyDisplayModeOption.NONE,
				[FrequencyType.ALL_MONTHS]: FrequencyDisplayModeOption.NONE,
			};
	}

	getGridType(): string | null {
		return ClimateVariableBase.prototype.getGridType.call(this)
			? ClimateVariableBase.prototype.getGridType.call(this)
			: "slrgrid";
	}

	hasDelta(): boolean | undefined {
		return ClimateVariableBase.prototype.hasDelta.call(this) !== undefined
			? ClimateVariableBase.prototype.hasDelta.call(this)
			: false;
	}

	getAveragingOptions(): AveragingType[] {
		return ClimateVariableBase.prototype.getAveragingOptions.call(this).length > 0
			? ClimateVariableBase.prototype.getAveragingOptions.call(this)
			: [
				AveragingType.ALL_YEARS
			];
	}

	getFileFormatTypes(): FileFormatType[] {
		return ClimateVariableBase.prototype.getFileFormatTypes.call(this).length > 0
			? ClimateVariableBase.prototype.getFileFormatTypes.call(this)
			: [
				FileFormatType.CSV,
				FileFormatType.JSON,
				FileFormatType.NetCDF,
			];
	}

	getDownloadType(): DownloadType | null {
		return ClimateVariableBase.prototype.getDownloadType.call(this) ?? DownloadType.PRECALCULATED;
	}

	getLocationModalContent(latlng: L.LatLng, featureId: number, mode: "modal" | "panel" = "modal"): React.ReactNode {
		return (
			<SeaLevelClimateVariableValues latlng={latlng} featureId={featureId} mode={mode} />
		);
	}
}

export default SeaLevelClimateVariable;
