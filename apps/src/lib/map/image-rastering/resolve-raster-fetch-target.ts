import { createFetchTargetToRasterWithEncodedUrl } from './create-fetch-target-to-raster-with-encoded-url';

/**
 * Resolves the POST target for a Download-button screenshot request.
 *
 * @param mapUrl - The map page's own URL, hash already stripped by the caller.
 * @param proxyEnabled - `window.RASTER_PROXY_ENABLED` — set only when the
 * page render found the same-origin PHP proxy configured for this
 * environment.
 *
 * @returns `mapUrl.href` directly when the proxy is enabled, since the proxy
 * derives path and query string from the request it receives. Otherwise the
 * salted, encoded screenshot-service URL {@link createFetchTargetToRasterWithEncodedUrl}
 * builds, which addresses the service directly.
 *
 * @example
 * ```typescript
 * resolveRasterFetchTarget(mapUrl, true); // mapUrl.href
 * resolveRasterFetchTarget(mapUrl, undefined); // createFetchTargetToRasterWithEncodedUrl(mapUrl.href)
 * ```
 */
export const resolveRasterFetchTarget = (
	mapUrl: URL,
	proxyEnabled: boolean | undefined,
): string => {
	if (proxyEnabled) {
		return mapUrl.href;
	}
	return createFetchTargetToRasterWithEncodedUrl(mapUrl.href);
};
