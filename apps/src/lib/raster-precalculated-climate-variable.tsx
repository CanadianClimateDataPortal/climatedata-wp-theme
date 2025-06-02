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
import RasterPrecalcultatedClimateVariableValues from '../components/map-layers/raster-precalculated-climate-variable-values'

interface DownloadPayloadProps {
	dataset_name: string | null;
	dataset_type: string;
	format: FileFormatType | null;
	month: string | null;
	var: string | null;
	zipped: boolean;
	bbox?: [number, number, number, number];
	points?: [number, number][];
}

class RasterPrecalculatedClimateVariable extends ClimateVariableBase {

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
					"ssp370",
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
				[FrequencyType.MONTHLY]: FrequencyDisplayModeOption.ALWAYS,
				[FrequencyType.ALL_MONTHS]: FrequencyDisplayModeOption.DOWNLOAD,
			};
	}

	getGridType(): string | null {
		if (super.getGridType()) {
			// Prioritize getting value from config.
			return super.getGridType()
		} else {
			// Fallback based on the version.
			if (this.getVersion() === "cmip6") {
				return "canadagrid-m6";
			} else {
				return "canadagrid";
			}
		}
	}

	hasDelta(): boolean | undefined {
		return super.hasDelta() !== undefined
			? super.hasDelta()
			: true;
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
				FileFormatType.JSON,
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
		return super.getDownloadType() ?? DownloadType.PRECALCULATED;
	}

	// TODO: it seems this method is only used for gridded_data + drawn region
	// 	if that's the case, remove the `points` key from DownloadPayloadProps and
	// 	the logic below that handles selectedPoints
	async getDownloadUrl(): Promise<string | null> {
		const downloadUrl = await super.getDownloadUrl();
		if (downloadUrl) {
			return downloadUrl;
		}

		let frequencyCode;
		switch (this.getFrequency()) {
			case FrequencyType.ALL_MONTHS:
				frequencyCode = "all";
				break;
			default:
				frequencyCode = this.getFrequency();
		}

		const selectedRegion = this.getSelectedRegion?.(); // For a drawn region
		const selectedPoints = this.getSelectedPoints?.(); // For selected points/cells

		let payload: DownloadPayloadProps = {
			dataset_name: this.getVersion(),
			dataset_type: this.getAveragingType() === AveragingType.ALL_YEARS
				? "allyears"
				: "30ygraph",
			format: this.getFileFormat(),
			month: frequencyCode,
			var: this.getThreshold(),
			zipped: true,
		};

		if (selectedRegion && selectedRegion.bounds) {
			// Region (bbox) selection
			const bounds = selectedRegion.bounds as [[number, number], [number, number]];
			payload = {
				...payload,
				bbox: [
					bounds[0][0], // minLat
					bounds[0][1], // minLng
					bounds[1][0], // maxLat
					bounds[1][1], // maxLng
				],
			};
		} else if (selectedPoints && Object.keys(selectedPoints).length > 0) {
			payload = {
				...payload,
				points: selectedPoints && Object.keys(selectedPoints).length > 0
					? Object.values(selectedPoints).map(({ lat, lng }) => [lat, lng])
					: [],
			};
		}

		const url = `${window.DATA_URL}/download`;

		try {
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload)
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const blob = await response.blob();
			return window.URL.createObjectURL(blob);
		} catch (error) {
			console.error('Download error:', error);
			throw error;
		}
	}

	getLocationModalContent(latlng: L.LatLng, featureId: number, mode: "modal" | "panel" = "modal"): React.ReactNode {
		return (
			<RasterPrecalcultatedClimateVariableValues latlng={latlng} featureId={featureId} mode={mode} />
		);
	}
}

export default RasterPrecalculatedClimateVariable;
