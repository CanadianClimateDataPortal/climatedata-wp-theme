/**
 * Both halves of a screenshot round trip live in this namespace, running across two
 * separate browser sessions — never assume "here" means the same browser throughout.
 *
 * Sender half — the user's browser, on clicking Download:
 * 1. {@link getLocationModalInnerHTML} scrapes the open LocationModal's markup.
 * 2. {@link createPrepareRasterPostHttpPayload} pairs it with the clicked marker position.
 * 3. {@link createFetchRequestInitOptions} wraps that payload as a POST body.
 * 4. That POST reaches an external screenshot service; dataset, variable, and viewport
 *    already travel separately, encoded in the request URL built by
 *    {@link createFetchTargetToRasterWithEncodedUrl}.
 *
 * Receiver half — the screenshot service's headless browser, on a fresh reload of
 * that same URL, with no popup open and no marker placed:
 * 5. The service evaluates the global `$.fn.prepare_raster()` — the reason the
 *    {@link Prepare_Raster} type's literal name exists at all — a closure that calls
 *    {@link prepareRaster} below.
 * 6. {@link prepareRaster} replays the marker and popup carried in the POST body.
 * 7. It strips interactive chrome and fires a resize, so the layout matches what the
 *    user saw, before the screenshot is taken — {@link waitForMapsSettled} and
 *    {@link waitForMarkerIcons} confirm the map and the replayed marker have actually
 *    finished loading before that happens.
 * 8. Once everything it can observe has settled, {@link signalRasterReady} adds the
 *    `to-raster` class to the element the service captures. That class is the signal
 *    the service waits on.
 */

export {
	type PrepareRasterMapHandles,
	type PrepareRasterPostHttpPayload,
	type Prepare_Raster,
	type PrepareRaster,
} from './types';
export { getLocationModalInnerHTML } from './get-location-modal-inner-html';
export { createPrepareRasterPostHttpPayload } from './create-prepare-raster-post-http-payload';
export { createFetchRequestInitOptions } from './create-fetch-request-init-options';
export { createFetchTargetToRasterWithEncodedUrl } from './create-fetch-target-to-raster-with-encoded-url';
export { waitForMapsSettled } from './wait-for-maps-settled';
export { waitForMarkerIcons } from './wait-for-marker-icons';
export { signalRasterReady } from './signal-raster-ready';
export { prepareRaster } from './prepare-raster';
export {
	createRasterDebugger,
	PrepareRasterPostHttpPayloadDebugger,
} from './create-raster-debugger';
