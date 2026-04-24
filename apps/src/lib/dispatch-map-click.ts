import L from 'leaflet';

/**
 * Dispatches a real DOM PointerEvent on the VectorGrid canvas tile at the
 * map container center after the view settles.
 *
 * `pointer-events: none` on Leaflet's pane wrapper divs causes
 * `document.elementFromPoint` to return the outermost container — canvas
 * tiles are queried via `gridPane.querySelectorAll('canvas')` and filtered
 * by bounding rect instead.
 *
 * `Promise.race` with a 1,000 ms timeout guards the case where `setView`
 * fires `moveend` synchronously (short pan, no animation) before the
 * listener is attached.
 */
export const dispatchMapClick = async (
	map: L.Map,
	latlng: { lat: number; lng: number },
): Promise<void> => {
	void latlng;
	await Promise.race([
		new Promise<void>((resolve) => map.once('moveend', () => resolve())),
		new Promise<void>((resolve) => setTimeout(resolve, 1_000)),
	]);
	await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
	const container = map.getContainer();
	const rect = container.getBoundingClientRect();
	const clientX = rect.left + rect.width / 2;
	const clientY = rect.top + rect.height / 2;
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
