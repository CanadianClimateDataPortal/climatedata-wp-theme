import { encodeURL } from '@/lib/utils';

/**
 * Builds the screenshot service's own `/raster?url=` endpoint, carrying the map
 * page's URL salted and encoded with {@link encodeURL}.
 *
 * Append to `window.DATA_URL + '/raster?url='` the string given as argument, encode using `window.URL_ENCODER_SALT`.
 *
 * @remark Where does this run?: In the user's browser.
 */
export const createFetchTargetToRasterWithEncodedUrl = (
	mapUrlString: string,
): string => {
	const mapUrl = new URL(mapUrlString);
	const encoded_url = encodeURL(
		mapUrl.toString(),
		window.URL_ENCODER_SALT,
	).encoded;
	const rasterEndpoint = new URL('/raster', window.DATA_URL);
	return `${rasterEndpoint.href}?url=${encoded_url}`;
};
