import L from 'leaflet';

import { SEARCH_DEFAULT_ZOOM } from '@/lib/constants';

/**
 * Per-map "intended latlng" channel.
 *
 * Producers (search, recent-locations, locate-me) know the precise lat/lng
 * the user expressed before we synthesise a click. The synthetic click round-
 * trips through `latLngToContainerPoint` → integer pixels → `containerPointToLatLng`
 * inside Leaflet's downstream click handler, which drops sub-pixel precision
 * (~80 m drift at typical zooms — enough to land on the wrong gridded-data row
 * for popup titles; see CLIM-1322).
 *
 * The fix: stash the intended latlng keyed by `L.Map` instance just before
 * dispatching the synthetic click; the consumer (`useMapInteractions.handleClick`)
 * reads-and-deletes it via {@link consumeIntendedLatlng}. The read is one-shot
 * so a stale value cannot bleed into a later real user click. `WeakMap` keying
 * on the map instance lets entries get GC'd with the map, no leak.
 *
 * Producer side is owned by {@link moveAndPointAt} (the only path that creates
 * the synthetic click), so callers don't need to opt in.
 */
const _intendedLatlngByMap = new WeakMap<L.Map, L.LatLng>();

/**
 * Read-and-delete the intended latlng for a map, if any was set by a recent
 * {@link moveAndPointAt} synthetic-click dispatch. One-shot by design — see
 * the module comment on `_intendedLatlngByMap`.
 */
export const consumeIntendedLatlng = (
	map: L.Map,
): L.LatLng | null => {
	const latlng = _intendedLatlngByMap.get(map) ?? null;
	if (latlng !== null) {
		_intendedLatlngByMap.delete(map);
	}
	return latlng;
};

/**
 * Moves the map to a specific lat/lng and triggers the location-selection
 * cascade at that point.
 *
 * Used by the search and locate-me flows: the user expressed where they
 * want to go, this function drives the map there and triggers the same
 * downstream effects as a manual click would.
 *
 * The click-on-canvas dispatch is an implementation detail — VectorGrid's
 * click handler is what triggers fetchLocationByCoords + popup open, so we
 * synthesise a real DOM PointerEvent at the typed lat/lng's screen
 * coordinates.
 *
 * `Promise.race` with a 1,000 ms timeout guards the case where `setView`
 * fires `moveend` synchronously (short pan, no animation) before the
 * listener is attached.
 *
 * The intended `latlng` is stashed via the per-map channel above so the
 * downstream click consumer can recover the precise coordinate instead of
 * the lossy pixel-rounded one Leaflet rebuilds from the synthetic event.
 */
export const moveAndPointAt = async (
	map: L.Map,
	latlng: L.LatLng | { lat: number; lng: number },
	zoom: number = SEARCH_DEFAULT_ZOOM,
): Promise<void> => {
	map.setView(latlng, zoom);
	await Promise.race([
		new Promise<void>((resolve) => map.once('moveend', () => resolve())),
		new Promise<void>((resolve) => setTimeout(resolve, 1_000)),
	]);
	await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
	const container = map.getContainer();
	const rect = container.getBoundingClientRect();
	const point = map.latLngToContainerPoint(latlng);
	const clientX = rect.left + point.x;
	const clientY = rect.top + point.y;
	const gridPane = map.getPane('grid') ?? null;
	if (!gridPane) {
		return;
	}
	// `pointer-events: none` on Leaflet's pane wrapper divs causes
	// `document.elementFromPoint` to return the outermost container — the
	// canvas tiles themselves are not hit-testable through that API. We
	// enumerate the grid pane's canvases and filter by their bounding rect
	// to find the one under (clientX, clientY) instead.
	const canvases = Array.from(gridPane.querySelectorAll('canvas'));
	const target = canvases.find((canvas) => {
		const r = canvas.getBoundingClientRect();
		return (
			clientX >= r.left
			&& clientX <= r.right
			&& clientY >= r.top
			&& clientY <= r.bottom
		);
	}) ?? null;
	if (target) {
		// Preserve the precise caller-supplied latlng across the synthetic
		// click's pixel round-trip — see `_intendedLatlngByMap` doc above.
		const intended = latlng instanceof L.LatLng
			? latlng
			: L.latLng(latlng.lat, latlng.lng);
		_intendedLatlngByMap.set(map, intended);
		target.dispatchEvent(new PointerEvent('click', {
			bubbles: true,
			cancelable: true,
			clientX,
			clientY,
			pointerId: 1,
			pointerType: 'mouse',
			view: window,
		}));
	}
};
