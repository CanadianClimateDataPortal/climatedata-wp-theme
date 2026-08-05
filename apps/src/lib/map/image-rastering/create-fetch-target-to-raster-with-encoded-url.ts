import { encodeURL } from '@/lib/utils';

/**
 * Builds the screenshot service's own `/raster?url=` endpoint, carrying the map
 * page's URL salted and encoded with {@link encodeURL}.
 *
 * This is the fallback branch of {@link resolveRasterFetchTarget}, reached when
 * `window.MAP_RASTER_PROXYPHP_DATA_URL` is absent — the deployment has no same-origin raster
 * proxy, so the request goes to the service directly. It is also the target
 * `createRasterDebugger`'s `createFetchFor` uses unconditionally, since retargeting
 * another deployment means addressing that deployment's service by host.
 *
 * @param mapUrlString - The map page's own URL, hash already stripped by the caller.
 *
 * @returns The screenshot service's `/raster` endpoint on `window.DATA_URL`, carrying
 * the encoded map URL as its `url` query parameter.
 *
 * @remark The `URL` constructor joins the base and the path, so a `window.DATA_URL`
 * carrying a trailing slash resolves to the same single-slash address as one without.
 * The query string is appended as text on purpose.
 * {@link encodeURL} already returns a percent-encoded value, and handing that value to
 * `URLSearchParams` would encode it a second time into a signature the screenshot
 * service rejects.
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
