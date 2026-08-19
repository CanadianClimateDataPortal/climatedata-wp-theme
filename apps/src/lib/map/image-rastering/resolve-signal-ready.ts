import type { SignalReady } from './signal-raster-ready';

/**
 * Returns the readiness callback `prepareRaster` should use — the seam a
 * caller substitutes its own through. Ships as an identity function.
 */
export const resolveSignalReady = (
	fallback: SignalReady,
): SignalReady => {
	return fallback;
};
