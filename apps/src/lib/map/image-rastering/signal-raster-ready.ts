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
 * Signals the screenshot service that the capture target is ready, by adding
 * {@link RASTER_READY_CLASS_NAME} to the element identified by
 * {@link RASTER_TARGET_ELEMENT_ID}.
 *
 * Called last by `prepareRaster`, once everything it can observe has settled.
 * Everything awaited before that call is something the screenshot depends on
 * *and* that the platform can report the completion of — nothing before this
 * point waits out a fixed delay.
 *
 * @remark Where does this run?: In the screenshot service's browser.
 */
export const signalRasterReady = (): void => {
	document
		.getElementById(RASTER_TARGET_ELEMENT_ID)
		?.classList.add(RASTER_READY_CLASS_NAME);
};
