import L from 'leaflet';

import { SEARCH_DEFAULT_ZOOM } from '@/lib/constants';

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
