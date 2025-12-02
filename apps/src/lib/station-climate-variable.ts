import ClimateVariableBase from "@/lib/climate-variable-base";
import RasterPrecalculatedClimateVariable from "@/lib/raster-precalculated-climate-variable";
import {
	AveragingType,
	DateRangeConfig,
	DownloadFile,
	DownloadType,
	FileFormatType,
	FrequencyConfig,
	FrequencyDisplayModeOption,
	FrequencyType,
	InteractiveMode,
	ScenariosConfig,
	StationDownloadUrlsProps,
} from "@/types/climate-variable-interface";
import { WP_API_DOMAIN } from "@/lib/constants";
import { __ } from "@/context/locale-provider";
import { sprintf } from "@wordpress/i18n";

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
		const configFormats = ClimateVariableBase.prototype.getFileFormatTypes.call(this);
		if (configFormats.length > 0) {
			return configFormats;
		}

		// Only apply defaults if no formats specified in config
		return [
			FileFormatType.CSV,
			FileFormatType.NetCDF,
		];
	}

	getDownloadType(): DownloadType | null {
		return ClimateVariableBase.prototype.getDownloadType.call(this) ?? DownloadType.PRECALCULATED;
	}

	async getStationDownloadFiles(props?: StationDownloadUrlsProps): Promise<DownloadFile[]> {
		console.log('getStationDownloadFiles 0\n', { id: this.getId(), props });

		// For MSC Climate Normals 1981-2010
		if(this.getId() === 'msc_climate_normals') {
			if(!props?.stationIds || !props?.fileFormat) return [];

			const stations = props?.stationIds?.map(stationId => stationId).join('|');
			const fileFormat = props?.fileFormat === FileFormatType.GeoJSON ? 'json' : props?.fileFormat;

			const url = `${window.DATA_URL}/get-geomet-collection-items-links/climate-normals?CLIMATE_IDENTIFIER=${stations}&sortby=MONTH&f=${fileFormat}`;

			const response = await fetch(url);

			if (!response.ok) {
				console.error(`Error fetching data: ${response.status}`);
				return [];
			}

			const links = await response.json();

			if (!Array.isArray(links)) {
				console.error(`Unexpected data received. Was expecting an array, received: ${links}`);
				return [];
			}

			return links.map(link => ({
				label: sprintf(__('Download Records %d to %d'), link.start_index + 1, link.end_index + 1),
				url: link.url,
			}));
		}
		// For Daily AHCCD Temperature and Precipitation
		else if(this.getId() === 'daily_ahccd_temperature_and_precipitation') {
			if(!props?.stationIds || !props?.fileFormat) return [];

			const stations = props.stationIds?.map(stationId => stationId).join(',');
			const url = `${window.DATA_URL}/download-ahccd?format=${props?.fileFormat}&zipped=true&stations=${stations}`;

			return [{
				label: __('Download'),
				url: url
			}];
		}
		// For Future Building Design Value Summaries
		else if(this.getId() === 'future_building_design_value_summaries') {
			if(!props?.filename) return [];

			const locale: string = props?.locale ?? 'en'
			const filename: string = props.filename[locale];

			const url = `${window.DATA_URL}/fileserver/bdv/${locale}/${filename}`;

			return [{
				label: __('Download'),
				url: url
			}];
		}
		// For Short-duration Rainfall IDF Data
		else if(this.getId() === 'short_duration_rainfall_idf_data') {
			if(!props?.stationId) return [];

			const url = `${WP_API_DOMAIN}/wp-json/cdc/v3/idf-station-files?station=${props?.stationId}`;

			try {
				const response = await fetch(url);

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const data = await response.json();
				const files = data?.files ?? [];
				const labels = {
					'historical': 'Historical IDF (ZIP)',
					'cmip5': 'Climate Change-Scaled IDF - CMIP5 (ZIP)',
					'cmip6': 'Climate Change-Scaled IDF - CMIP6 (ZIP)',
					'cmip6-quickstart': 'Quick Start - CMIP6 Climate Change-Scaled IDF (ZIP)',
				};

				return files.map((file: { type: string, url: string}) => {
					return {
						label: labels[file.type as keyof typeof labels] ? __(labels[file.type as keyof typeof labels]) : file.type,
						linkAttributes: {
							// CSS class for Google Tag Manager event tracking
							className: 'download-idf-curves',
						},
						url: file.url,
					}
				});
			} catch (error) {
				console.error('Error fetching data:', error);
			}

			return [];
		}
		// For Station Data - handled in StationDataClimateVariable class now
		else if(this.getId() === 'station_data') {
			return [];
		}

		return [];
	}

	getLocationModalContent(): React.ReactNode {
		// We don't display any value in the modal for station climate variables
		return null;
	}
}

export default StationClimateVariable;
