import { encodeURL } from '@/lib/utils';

/**
 * Builds the screenshot service's own `/raster?url=` endpoint, carrying the map
 * page's URL salted and encoded with {@link encodeURL}.
 *
 * This is the fallback branch of {@link resolveRasterFetchTarget}, reached when
 * `window.RASTER_PROXY_DATA_URL` is absent — the deployment has no same-origin raster
 * proxy, so the request goes to the service directly. It is also the target
 * `createRasterDebugger`'s `createFetchFor` uses unconditionally, since retargeting
 * another deployment means addressing that deployment's service by host.
 *
 * @param mapUrlString - The map page's own URL, hash already stripped by the caller.
 *
 * @returns `window.DATA_URL` + `/raster?url=` + the encoded map URL.
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
	const outcome = window.DATA_URL + '/raster?url=' + encoded_url;
	return outcome;
};
