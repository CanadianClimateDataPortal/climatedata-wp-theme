import L from 'leaflet';

import { getLocationModalInnerHTML } from './get-location-modal-inner-html';

import type { PrepareRasterPostHttpPayload } from './types';

/**
 * Builds the outgoing POST payload from the sending browser's own current
 * state — the person clicking "Download", not the screenshot service.
 *
 * Returns `undefined`, never a payload with an empty `locationPopupHtml`,
 * whenever either half is missing: no popup currently open, or no location
 * selected. `undefined` becomes an absent request body; the server-side
 * hook then calls `$.fn.prepare_raster()` argument-less rather than
 * receiving a partially-empty payload.
 *
 * @remark Where does this run?: In the user's browser.
 */
export const createPrepareRasterPostHttpPayload = (
	latlng: L.LatLngLiteral,
): PrepareRasterPostHttpPayload | undefined => {
	const markerLatLon: PrepareRasterPostHttpPayload['markerLatLon'] | null = latlng
		? [latlng.lat, latlng.lng]
		: null;

	const locationPopupHtml = getLocationModalInnerHTML();

	if (!locationPopupHtml || markerLatLon === null) {
		return undefined;
	}

	return {
		locationPopupHtml,
		markerLatLon,
	};
};
