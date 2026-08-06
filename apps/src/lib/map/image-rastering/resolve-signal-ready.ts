import type { SignalReady } from './signal-raster-ready';

/**
 * Some NoOp function to use and call back only when we have what we need.
 */
export const resolveSignalReady = (
	fallback: SignalReady,
): SignalReady => {
	return fallback;
};
