import {
	DateRangeConfig,
	DownloadFile,
	FileFormatType,
	FrequencyConfig,
	StationDownloadUrlsProps,
} from "@/types/climate-variable-interface";
import StationClimateVariable from "@/lib/station-climate-variable";
import { __ } from "@/context/locale-provider";

class StationDataClimateVariable extends StationClimateVariable {

	getVersions(): string[] {
		return [];
	}

	getVersion(): string | null {
		return null;
	}

	getFrequencyConfig(): FrequencyConfig | null {
		return null;
	}

	getDateRangeConfig(): DateRangeConfig | null {
		return {
			min: "1840-01-01",
			max: new Date().toISOString().split('T')[0],
			interval: 1,
			type: "day"
		};
	}

	getDefaultDateRange(): string[] | null {
		return [
			"1840-03-01",
			new Date().toISOString().split('T')[0]
		]
	}
	
	getFileFormatTypes(): FileFormatType[] {
		return [
			FileFormatType.CSV,
			FileFormatType.GeoJSON,
		];
	}
	
	async getStationDownloadFiles(props?: StationDownloadUrlsProps): Promise<DownloadFile[]> {
		if(!props?.stationIds || !props?.dateRange || !props?.fileFormat) return [];
		
		const stations = props?.stationIds?.map(stationId => stationId).join('|');
		const start = props?.dateRange.start + ' 00:00:00';
		const end = props?.dateRange.end + ' 00:00:00';
		const fileFormat = props?.fileFormat === FileFormatType.GeoJSON ? 'json' : props?.fileFormat;
		const url = `https://api.weather.gc.ca/collections/climate-daily/items?datetime=${start}/${end}&STN_ID=${stations}&sortby=PROVINCE_CODE,STN_ID,LOCAL_DATE&f=${fileFormat}&limit=150000&offset=0`;

		return [{
			label: __('Download'),
			url: url
		}];
	}
}

export default StationDataClimateVariable;
