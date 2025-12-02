import {
	DateRangeConfig,
	DownloadFile,
	FileFormatType,
	FrequencyConfig,
	StationDownloadUrlsProps,
} from "@/types/climate-variable-interface";
import StationClimateVariable from "@/lib/station-climate-variable";
import { __ } from "@/context/locale-provider";
import { sprintf } from "@wordpress/i18n";
import { AbstractError } from "@/lib/errors";

/**
 * Error thrown when fetching station data fails due to network or HTTP errors.
 *
 * Captures HTTP response details for debugging.
 */
export class StationDataFetchError extends AbstractError {
	readonly response?: Pick<Response, 'url' | 'status' | 'statusText'>;

	constructor(
		message: string,
		options?: ErrorOptions,
	) {
		super(message, options);
		this.name = 'StationDataFetchError';
	}

	/**
	 * Attach HTTP response details to the error for debugging.
	 *
	 * @param response - The Response object from fetch
	 * @returns this error instance for chaining
	 */
	withHttpDetails(
		response: Response,
	): this {
		console.log('StationDataFetchError.withHttpDetails\n', { response });
		const picked = {
			url: response.url,
			status: response.status,
			statusText: response.statusText,
		} as Pick<Response, 'url' | 'status' | 'statusText'>;
		/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
		(this as any).response = picked;
		return this;
	}
}

/**
 * Error thrown when station data API returns unexpected response format.
 *
 * Used for data validation errors (e.g., expected array but got object).
 */
export class StationDataResponseError extends AbstractError {
	constructor(
		message: string,
		options?: ErrorOptions,
	) {
		super(message, options);
		this.name = 'StationDataResponseError';
	}
}


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
		// But we need before That!
		console.log('CLIM-1088 Tracing execution flow honk(3)\n', {
			path: 'StationDataClimateVariable.getDownloadFiles(props)',
			id: this.getId(),
			props,
		});
		if(!props?.stationIds || !props?.dateRange || !props?.fileFormat) return [];

		const stations = props?.stationIds?.map(stationId => stationId).join('|');
		const start = props?.dateRange.start + ' 00:00:00';
		const end = props?.dateRange.end + ' 00:00:00';
		const fileFormat = props?.fileFormat === FileFormatType.GeoJSON ? 'json' : props?.fileFormat;
		const url = `${window.DATA_URL}/get-geomet-collection-items-links/climate-daily?datetime=${start}/${end}&STN_ID=${stations}&sortby=PROVINCE_CODE,STN_ID,LOCAL_DATE&f=${fileFormat}`;

		try {
			const response = await fetch(url);

			if (!response.ok) {
				throw new StationDataFetchError(
					`Failed to fetch station data: HTTP ${response.status}`
				).withHttpDetails(response);
			}

			const links = await response.json();

			if (!Array.isArray(links)) {
				throw new StationDataResponseError(
					`Expected array, received: ${typeof links}`
				);
			}

			// When the API returns an empty array, it means the station has no data for the selected date range.
			// This is a valid state (not an error). The handling of this "no data available" scenario
			// happens in the calling code (steps.tsx), where it can display an appropriate message to the user.
			if (links.length === 0) {
				console.warn('No download links available for the selected stations and date range.');
				return [];
			}

			return links.map(link => ({
				label: sprintf(__('Download Records %d to %d'), link.start_index + 1, link.end_index + 1),
				linkAttributes: {
					// id attributes for Google Tag Manager event tracking
					id: 'station-process',
				},
				url: link.url,
			}));

		} catch (error) {
			// Re-throw our custom errors as-is
			if (error instanceof AbstractError) {
				throw error;
			}
			// Wrap unexpected errors (network errors, JSON parse errors, etc.)
			throw new StationDataFetchError(
				'Failed to fetch station download files',
				{ cause: error }
			);
		}
	}
}

export default StationDataClimateVariable;
