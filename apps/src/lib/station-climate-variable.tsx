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
	StationDownloadUrlsProps,
	DownloadFile,
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

	async getStationDownloadFiles(props?: StationDownloadUrlsProps): Promise<DownloadFile[]> {
		// For MSC Climate Normals 1981-2010
		if(this.getId() === 'msc_climate_normals') {
			if(!props?.stationIds || !props?.fileFormat) return [];

			const stations = props?.stationIds?.map(stationId => stationId).join('|');
			const fileFormat = props?.fileFormat === FileFormatType.GeoJSON ? 'json' : props?.fileFormat;
			const url = `https://api.weather.gc.ca/collections/climate-normals/items?CLIMATE_IDENTIFIER=${stations}&sortby=MONTH&f=${fileFormat}&limit=150000&startindex=0`;

			return [{
				label: '',
				url: url
			}];
		}
		// For Daily AHCCD Temperature and Precipitation
		else if(this.getId() === 'daily_ahccd_temperature_and_precipitation') {
			if(!props?.stationIds || !props?.fileFormat) return [];

			const stations = props.stationIds?.map(stationId => stationId).join(',');
			const url = `https://data.climatedata.ca/download-ahccd?format=${props?.fileFormat}&zipped=true&stations=${stations}`;

			return [{
				label: '',
				url: url
			}];
		}
		// For Future Building Design Value Summaries
		else if(this.getId() === 'future_building_design_value_summaries') {
			if(!props?.stationName) return [];

			const url = `https://data.climatedata.ca/fileserver/bdv/en/DVE Guidance_${props?.stationName}.pdf`;

			return [{
				label: '',
				url: url
			}];
		}
		// For Short-duration Rainfall IDF Data
		else if(this.getId() === 'short_duration_rainfall_idf_data') {
			if(!props?.stationId) return [];

			const url = `https://climatedata.ca/site/assets/themes/climate-data-ca/resources/app/run-frontend-sync/search_idfs.php?idf=${props?.stationId}`;

			const fetchData = async () => {
				try {
					const response = await fetch(url);
					if (!response.ok) {
						throw new Error(`HTTP error! status: ${response.status}`);
					}

					const data = await response.json();
					return data.map((element: { filename: string; label: string }): DownloadFile => ({
						...element,
						url: `https://climatedata.ca${element.filename}`,
					}));
				} catch (error) {
					console.error('Error fetching data:', error);
				}
			};
			fetchData();
		}
		// For Station Data
		else if(this.getId() === 'station_data') {
			if(!props?.stationIds || !props?.dateRange || !props?.fileFormat) return [];

			const stations = props?.stationIds?.map(stationId => stationId).join('|');
			const start = props?.dateRange.start + ' 00:00:00';
			const end = props?.dateRange.end + ' 00:00:00';
			const fileFormat = props?.fileFormat === FileFormatType.GeoJSON ? 'json' : props?.fileFormat;
			const url = `https://api.weather.gc.ca/collections/climate-daily/items?datetime=${start}/${end}&STN_ID=${stations}&sortby=PROVINCE_CODE,STN_ID,LOCAL_DATE&f=${fileFormat}&limit=150000&startindex=0`;

			return [{
				label: '',
				url: url
			}];
		}

		return [];
	}

	getLocationModalContent(): React.ReactNode {
		// We don't display any value in the modal for station climate variables
		return null;
	}
}

export default StationClimateVariable;
