/**
 * The class name the screenshot service polls for, and then screenshots.
 *
 * It does two jobs at once, which is easy to miss from inside this repository:
 * the service waits up to ten seconds for an element carrying this class to
 * become visible, and then captures *that element* rather than the whole
 * viewport. So it is both the "ready" signal and the definition of what ends
 * up in the PNG. It therefore has to land on the element we want captured, and
 * only once the contents of that element have stopped changing.
 */
const RASTER_READY_CLASS_NAME = 'to-raster';

/** The element the service captures — the grid holding both map panes. */
const RASTER_TARGET_ELEMENT_ID = 'map-root';

/**
 * The readiness action `prepareRaster` calls once the capture target is ready.
 * Lets production, a debug hold, and a test spy share one call site.
 */
export type SignalReady = () => void;

/**
 * Signals the screenshot service that the capture target is ready, by adding
 * {@link RASTER_READY_CLASS_NAME} to the element identified by
 * {@link RASTER_TARGET_ELEMENT_ID}.
 *
 * Called last by {@link prepareRaster}, once everything it can observe has
 * settled. What it awaits first, and why, is documented there.
 *
 * @remark Where does this run?: In the screenshot service's browser.
 */
export const signalRasterReady = (): void => {
	document
		.getElementById(RASTER_TARGET_ELEMENT_ID)
		?.classList.add(RASTER_READY_CLASS_NAME);
};
