/**
 * Resolves once the marker icons on the page have finished decoding.
 *
 * The marker `prepareRaster` replays carries a real `<img>`: Leaflet's `L.Icon`
 * builds one from `iconUrl`, and fires no event to say it has painted. This
 * browser has never placed a marker, so that image may not be cached and its
 * request may only begin when the marker is added. The selector is restricted
 * to `img` because `L.DivIcon` puts the same class on a `<div>`, and those
 * markers carry inline SVG with nothing to fetch.
 *
 * Never rejects. An icon that fails to load should cost us the icon, not the
 * whole screenshot.
 *
 * @remark Where does this run?: In the screenshot service's browser.
 */
export const waitForMarkerIcons = (): Promise<unknown> => {
	const icons = document.querySelectorAll<HTMLImageElement>(
		'img.leaflet-marker-icon',
	);
	return Promise.all(
		[...icons].map((icon) => icon.decode().catch(() => undefined)),
	);
};
