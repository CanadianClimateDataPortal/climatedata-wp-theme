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

		const points: [number, number][] = [];

		Object.values(this.getSelectedPoints() ?? {}).forEach(({lat, lng}) => {
			points.push([lat, lng]);
		});

		const payload = {
			dataset_name: this.getVersion(),
			dataset_type: this.getAveragingType() === AveragingType.ALL_YEARS
				? "allyears"
				: "30ygraph",
			format: this.getFileFormat(),
			month: frequencyCode,
			points: points,
			var: this.getThreshold(),
			zipped: true,
		};

		const url = "https://data.climatedata.ca/download";

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
}

export default RasterPrecalculatedClimateVariable;
