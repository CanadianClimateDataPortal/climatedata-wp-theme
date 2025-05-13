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
	InteractiveRegionConfig,
	InteractiveRegionOption,
	ScenariosConfig
} from "@/types/climate-variable-interface";
import SeaLevelClimateVariableValues from "@/components/map-layers/sea-level-climate-variable-values";
import SeaLevelMap from "@/components/sea-level-map";

class SeaLevelClimateVariable extends RasterPrecalculatedClimateVariable {

	getVersions(): string[] {
		return ClimateVariableBase.prototype.getVersions.call(this).length > 0
			? ClimateVariableBase.prototype.getVersions.call(this)
			: [
				"cmip5",
				"cmip6",
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
				cmip6: [
					"ssp585highEnd-p98",
					"ssp585lowConf-p83",
					"ssp585",
					"ssp370",
					"ssp245",
					"ssp126",
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
		const defaultGrid = (this.getVersion() === "cmip6")
			? "slrgrid-cmip6" : "slrgrid";

		return ClimateVariableBase.prototype.getGridType.call(this)
			? ClimateVariableBase.prototype.getGridType.call(this)
			: defaultGrid;
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

	getDateRangeConfig(): DateRangeConfig | null {
		return {
			min: (this.getVersion() === "cmip6") ? "2020" : "2006",
			max: "2100",
			interval: 10,
		}
	}

	getDownloadType(): DownloadType | null {
		return ClimateVariableBase.prototype.getDownloadType.call(this) ?? DownloadType.PRECALCULATED;
	}

	getLocationModalContent(latlng: L.LatLng, featureId: number, mode: "modal" | "panel" = "modal"): React.ReactNode {
		return (
			<SeaLevelClimateVariableValues latlng={latlng} featureId={featureId} mode={mode} />
		);
	}

	/**
	 * Override the renderMap method to return the sea-level custom map component
	 * which has the modified layer ordering (raster under basemap)
	 */
	renderMap(): React.ReactElement {
		return <SeaLevelMap />;
	}
}

export default SeaLevelClimateVariable;
