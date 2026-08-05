import { createFetchTargetToRasterWithEncodedUrl } from './create-fetch-target-to-raster-with-encoded-url';

/**
 * Resolves the POST target for a Download-button screenshot request.
 *
 * @param mapUrl - The map page's own URL, hash already stripped by the caller.
 * @param proxyDataUrl - `window.RASTER_PROXY_DATA_URL` — the screenshot service
 * address to raster through when the same-origin raster proxy is configured for
 * this environment. Its presence is the flag; the value itself stays on the
 * server side of the round trip. An empty string counts as absent, so an
 * environment variable set to `""` leaves the fallback in place.
 *
 * @returns `mapUrl.href` directly when a proxy data URL is present, since the
 * proxy derives path and query string from the request it receives. Otherwise the
 * salted, encoded screenshot-service URL {@link createFetchTargetToRasterWithEncodedUrl}
 * builds, which addresses the service directly.
 *
 * @example
 * ```typescript
 * resolveRasterFetchTarget(mapUrl, 'https://data.example.test'); // mapUrl.href
 * resolveRasterFetchTarget(mapUrl, undefined); // createFetchTargetToRasterWithEncodedUrl(mapUrl.href)
 * ```
 */
export const resolveRasterFetchTarget = (
	mapUrl: URL,
	proxyDataUrl: string | undefined,
): string => {
	const hasProxyDataUrl = typeof proxyDataUrl === 'string' && proxyDataUrl !== '';
	if (hasProxyDataUrl) {
		return mapUrl.href;
	}
	return createFetchTargetToRasterWithEncodedUrl(mapUrl.href);
};
