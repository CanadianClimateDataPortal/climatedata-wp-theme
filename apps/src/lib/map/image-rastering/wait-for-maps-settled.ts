import L from 'leaflet';

/**
 * How long {@link prepareRaster} waits for the map to settle before signalling
 * readiness regardless.
 *
 * The service allows ten seconds for the class above to appear and has no error
 * branch, so failing to signal does not produce a degraded screenshot — it
 * produces no screenshot at all and an error for whoever clicked Download.
 * Signalling late with a possibly imperfect map is the better of those two, so
 * this sits below the service's ceiling with room to spare.
 */
export const MAP_SETTLE_TIMEOUT_MS = 8_000;

/**
 * How many consecutive animation frames every tiled layer must report idle
 * before the map counts as settled.
 *
 * More than one, because the two panes are synchronised in both directions (see
 * the `sync` calls in `map.tsx`): a move on one pane propagates to the other, so
 * the second pane starts requesting its tiles slightly *after* the first pane
 * has finished with its own. A single idle reading can land in that gap and
 * report a map that has not finished. Requiring consecutive idle frames narrows
 * the window. It does not close it, and no finite number would.
 */
const MAP_SETTLE_STABLE_FRAMES = 3;

/** A layer that takes part in Leaflet's tile-loading lifecycle. */
type TiledLayer = { isLoading: () => boolean };

const isTiledLayer = (
	layer: L.Layer,
): layer is L.Layer & TiledLayer =>
	typeof (layer as Partial<TiledLayer>).isLoading === 'function';

/**
 * Resolves once every tiled layer on every mounted map has reported idle for
 * {@link MAP_SETTLE_STABLE_FRAMES} consecutive animation frames, or after
 * {@link MAP_SETTLE_TIMEOUT_MS} — `true` when the map settled, `false` on
 * timeout.
 *
 * The state is polled each frame rather than composed from Leaflet's `load`
 * event, deliberately. A layer that already finished before a listener attaches
 * never fires `load` again, so awaiting the events would wait forever on
 * precisely the layers that had nothing left to do. Reading the current state
 * has no such edge to miss.
 *
 * `isLoading()` here is Leaflet's own method on `GridLayer` and everything that
 * extends it — the base map tiles, the WMS layers, and the vector-tile
 * choropleth. It is unrelated to the `isLoading` flags this app keeps in Redux
 * for the S2D release date.
 *
 * KNOWN LIMIT, and it is worth stating rather than implying completeness: this
 * cannot detect a layer that has not been created yet. Several layers only
 * construct themselves once their own data request resolves — `variable-layer.ts`
 * and `interactive-regions-layer.tsx` both return early from their effect until
 * then. While such a request is in flight there is no layer on the map to report
 * as loading, so a page that is not finished looks identical to one that is.
 * Covering that would require those layers to advertise that they are pending,
 * which they currently do not.
 *
 * @remark Where does this run?: In the screenshot service's browser.
 */
export const waitForMapsSettled = (
	maps: (L.Map | null)[],
): Promise<boolean> => {
	const mounted = maps.filter((map): map is L.Map => Boolean(map));
	const startedAt = performance.now();
	let idleFrames = 0;

	return new Promise<boolean>((resolve) => {
		const check = () => {
			let loading = false;
			mounted.forEach((map) => {
				map.eachLayer((layer) => {
					if (isTiledLayer(layer) && layer.isLoading()) {
						loading = true;
					}
				});
			});

			idleFrames = loading ? 0 : idleFrames + 1;

			if (idleFrames >= MAP_SETTLE_STABLE_FRAMES) {
				resolve(true);
				return;
			}
			if (performance.now() - startedAt >= MAP_SETTLE_TIMEOUT_MS) {
				resolve(false);
				return;
			}
			requestAnimationFrame(check);
		};
		requestAnimationFrame(check);
	});
};
