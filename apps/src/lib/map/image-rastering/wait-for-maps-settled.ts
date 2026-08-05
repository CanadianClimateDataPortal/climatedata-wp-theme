import L from 'leaflet';

/**
 * Shared budget for BOTH {@link waitForMapsSettled} calls inside `prepareRaster`
 * combined — not per call. `prepareRaster` computes one deadline from this at entry
 * and threads it through both calls unchanged, so neither call can spend the other's
 * share.
 *
 * Sized against the screenshot service's real ceiling: it waits up to 10s for the
 * `to-raster` class to become visible, then raises an unhandled timeout — HTTP 500,
 * no image.
 * 9s leaves roughly a second under that for the synchronous DOM work between the two
 * calls (marker placement, popup injection, chrome removal) and for script-invocation
 * overhead, neither of which this budget otherwise accounts for.
 * The full service timeline this arithmetic runs against is in ./README.md.
 *
 * 9s is that arithmetic and nothing more.
 * How long the work it covers actually takes has never been measured, so treat the
 * headroom as assumed rather than demonstrated.
 *
 * @remark `document.fonts.ready` and {@link waitForMarkerIcons} sit outside this
 * budget.
 * They run alongside the second settle call via `Promise.all` and have no timeout of
 * their own, so a slow font or icon load can still push `prepareRaster` past it.
 * A known limit of the design, left as it stands.
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
 * 3 is judgement rather than measurement — chosen alongside the design and never
 * tuned against observed behaviour, the same provenance
 * {@link MAP_SETTLE_TOTAL_BUDGET_MS} carries.
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

	// The deadline check lives inside the rAF callback deliberately: frames ARE the
	// measurement here.
	// No frames means the page is not rendering, and a map that is not rendering has no
	// settled state to report.
	// A wall-clock fallback would report ready with nothing painted, and the service has
	// no error branch to catch that — it would turn a visible failure into a silently
	// wrong image.
	// Browsers pause frames for backgrounded, hidden, and minimised pages only, and this
	// drives one headless page, so frames fire.
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
