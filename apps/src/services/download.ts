import { FileFormatType } from '@/types/climate-variable-interface';

import type {
	MapBoundaryBox,
	MapPointsList,
} from '@/types/types';

class FetchPostDownloadError extends Error {
	constructor(message: string, options?: ErrorOptions) {
		super(message, options);
		this.name = 'FetchPostDownloadError';
	}
}

/**
 * The payload to send to the download endpoint to request a file download.
 *
 * Depending on the requested file format and the provided geographical region,
 * the payload may include a bounding box or a list of points.
 */
export interface PostDownloadToBlobObjectURLPayload {
	format: FileFormatType | null;
	bbox?: MapBoundaryBox;
	points?: MapPointsList;
}

/**
 * Validates that a download payload has exactly one geographic selector: bbox OR points.
 *
 * @param payload - The download payload to validate
 * @throws {Error} If neither bbox nor points is present, or if both are present
 */
export const assertHasExactlyOneGeographicSelector = (
	payload: PostDownloadToBlobObjectURLPayload
): void => {
	const hasBbox = 'bbox' in payload && payload.bbox !== undefined;
	const hasPoints = 'points' in payload && payload.points !== undefined;

	if (!hasBbox && !hasPoints) {
		throw new Error(
			'Download requires either a selected region (bbox) or selected grid cells (points)'
		);
	}

	if (hasBbox && hasPoints) {
		throw new Error(
			'Download cannot have both bbox and points - only one geographic selector allowed'
		);
	}
};

/**
 * Fetches binary file data from a download endpoint and returns a temporary blob URL.
 *
 * Validates the response contains actual file data (not empty or error page) before
 * creating a browser-usable object URL for triggering downloads.
 *
 * @param url - Download endpoint URL (must contain '/download' in pathname)
 * @param payload - Request data specifying file format and geographic region
 * @returns Temporary blob URL string for use with download links
 * @throws {FetchPostDownloadError} On network errors, invalid responses, or empty files
 */
export const postDownloadToBlobObjectURL = async (
	url: string,
	payload: PostDownloadToBlobObjectURLPayload
): Promise<string | null> => {
	const urlObj = new URL(url);

	// Validate URL points to download endpoint
	if (urlObj.pathname.startsWith('/download') === false) {
		const message = `The provided URL does not point to a download endpoint: ${url}`;
		console.error(message);
		throw new FetchPostDownloadError(message);
	}

	try {
		// Send the POST request with the payload as JSON
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(payload),
		});

		// Throw an error if the response is not OK (4xx or 5xx)
		if (!response.ok) {
			throw new FetchPostDownloadError(
				`HTTP error! status: ${response.status}`
			);
		}

		/**
		 * Example response from download endpoint:
		 *
		 * ```http
		 * POST /download HTTP/1.1
		 * Content-Type: application/json
		 *
		 * HTTP/1.1 200 OK
		 * Content-Type: application/zip
		 * Content-Length: 25077
		 * Content-Disposition: attachment; filename=tx_max.zip
		 * Cache-Control: max-age=604800
		 * ```
		 *
		 * Note: Content-Disposition is ignored by fetch() - only affects direct browser navigation
		 */

		// Validate response contains binary file data, not an error page
		const contentType = response.headers.get('Content-Type');
		if (
			!contentType?.includes('application/zip') &&
			!contentType?.includes('application/octet-stream')
		) {
			throw new FetchPostDownloadError(
				`Unexpected content type: ${contentType}`
			);
		}

		// Check response isn't empty before reading stream
		const contentLength = response.headers.get('Content-Length');
		if (contentLength && parseInt(contentLength) === 0) {
			throw new FetchPostDownloadError('Response is empty');
		}

		// Convert the response to a Blob (usually a ZIP file)
		// Read response stream into Blob (typed from Content-Type header)
		// https://developer.mozilla.org/docs/Web/API/Response/blob
		const blob = await response.blob();
		if (blob.size === 0) {
			throw new FetchPostDownloadError('Downloaded file is empty');
		}

		// Create temporary object URL for browser download
		// https://developer.mozilla.org/docs/Web/API/URL/createObjectURL_static
		const objectUrl = window.URL.createObjectURL(blob);
		return objectUrl;
	} catch (error) {
		// Log and rethrow any errors during the request
		console.error('Download error:', error);
		throw new FetchPostDownloadError('Failed to obtain the file to download', {
			cause: error,
		});
	}
};
