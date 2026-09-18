import L from 'leaflet';

import { getLocationModalInnerHTML } from './get-location-modal-inner-html';

import type { PrepareRasterPostHttpPayload } from './types';

/**
 * Builds the outgoing POST payload from the sending browser's own current
 * state — the person clicking "Download", not the screenshot service.
 *
 * Returns `undefined`, never a payload with an empty `locationPopupHtml`,
 * whenever either half is missing: no popup currently open, or no location
 * selected.
 * `createFetchRequestInitOptions` then sends `{}` as the body.
 * The screenshot service then calls `$.fn.prepare_raster()` without arguments,
 * instead of receiving a partial payload.
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
