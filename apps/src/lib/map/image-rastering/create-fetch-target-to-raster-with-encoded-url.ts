import { encodeURL } from '@/lib/utils';

/**
 * Take the current Map URL, encode to be used against the screenshot service.
 *
 * Append to `window.DATA_URL + '/raster?url='` the string given as argument, encode using `window.URL_ENCODER_SALT`.
 *
 * @remark Where does this run?: In the user's browser.
 */
export const createFetchTargetToRasterWithEncodedUrl = (
	mapUrlString: string,
): string => {
	const mapUrl = new URL(mapUrlString);
	// Encode the URL
	const encoded_url = encodeURL(
		mapUrl.toString(),
		window.URL_ENCODER_SALT,
	).encoded;
	// Generate the generateMap URL.
	const outcome = window.DATA_URL + '/raster?url=' + encoded_url;
	return outcome;
};
