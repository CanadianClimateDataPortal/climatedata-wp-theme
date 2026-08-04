/**
 * Screenshot round trip for the map Download button — sender in the user's browser,
 * receiver in the screenshot service's headless browser via `$.fn.prepare_raster()`.
 * Full walkthrough and symbol-by-symbol map: ./README.md.
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
export { prepareRaster } from './prepare-raster';
export {
	createRasterDebugger,
	PrepareRasterPostHttpPayloadDebugger,
} from './create-raster-debugger';
