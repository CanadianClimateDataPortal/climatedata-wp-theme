/**
 * Screenshot round trip for the map Download button — sender in the user's browser,
 * receiver in the screenshot service's headless browser via `$.fn.prepare_raster()`.
 * Full walkthrough and symbol-by-symbol map: ./README.md.
 */

export type * from './types';
export * from './get-location-modal-inner-html';
export * from './create-prepare-raster-post-http-payload';
export * from './create-fetch-request-init-options';
export * from './create-fetch-target-to-raster-with-encoded-url';
export * from './prepare-raster';
export * from './signal-raster-ready';
export * from './install-prepare-raster-stub';
