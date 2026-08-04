import L from 'leaflet';

/**
 * Shared budget for BOTH {@link waitForMapsSettled} calls inside `prepareRaster`
 * combined — not per call. `prepareRaster` computes one deadline from this at entry
 * and threads it through both calls unchanged, so neither call can spend the other's
 * share.
 *
 * Sized against the screenshot service's real ceiling: after invoking `prepare_raster`
 * the service waits up to 10s for the `to-raster` class to become visible, then raises
 * an unhandled timeout — HTTP 500, no image. 9s leaves roughly a second under that for
 * the synchronous DOM work between the two calls (marker placement, popup injection,
 * chrome removal) and for script-invocation overhead, neither of which this budget
 * otherwise accounts for.
 *
 * The service also sleeps 4s AFTER the ready class appears, before screenshotting —
 * which is why this budget does not need to guarantee every tile finished; a tile
 * landing inside that trailing window is still captured. It grants no time before the
 * 10s wait, so it cannot rescue a signal that arrives too late.
 *
 * @remark `document.fonts.ready` and {@link waitForMarkerIcons} are NOT bounded by
 * this budget. They run alongside the second settle call via `Promise.all` and have
 * no timeout of their own, so a slow font or icon load can still push `prepareRaster`
 * past it. Pre-existing; out of scope.
 */
export const MAP_SETTLE_TOTAL_BUDGET_MS = 9_000;

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
 *
 * This value and the original 8000ms single-call timeout were introduced together
 * in one commit and never tuned against observed behaviour — the provenance is
 * "chosen alongside the design", not measured. Do not re-derive either number.
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
 * {@link MAP_SETTLE_STABLE_FRAMES} consecutive animation frames, or once
 * `performance.now()` reaches `deadline` — `true` when the map settled, `false`
 * on timeout.
 *
 * This function keeps no clock of its own — `deadline` is caller-supplied so
 * that two calls in the same request (see `prepareRaster`) can share a single
 * budget instead of each getting a fresh one.
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
 * @param maps - Mounted map instances to poll; `null` entries (no comparison pane) are ignored.
 * @param deadline - `performance.now()`-scale absolute time this call must not run past. See
 * {@link MAP_SETTLE_TOTAL_BUDGET_MS} for how callers derive it.
 *
 * @remark Where does this run?: In the screenshot service's browser.
 */
export const waitForMapsSettled = (
	maps: (L.Map | null)[],
	deadline: number,
): Promise<boolean> => {
	const mounted = maps.filter((map): map is L.Map => Boolean(map));
	let idleFrames = 0;

	// Deadline check lives inside the rAF callback deliberately — not a missing
	// `setTimeout` fallback. Frames ARE the measurement: no frames means the page isn't
	// rendering, so "settled" has no answer to give. A wall-clock fallback would claim
	// ready with nothing painted, and since the service has no error branch that turns a
	// visible failure into a silently wrong image. Browsers only pause frames for
	// backgrounded/hidden/minimised pages — this drives one headless page, so frames fire.
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
			if (performance.now() >= deadline) {
				resolve(false);
				return;
			}
			requestAnimationFrame(check);
		};
		requestAnimationFrame(check);
	});
};
