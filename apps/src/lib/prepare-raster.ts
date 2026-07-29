import L from 'leaflet';

import {
	createExampleLocationPopupHtml,
	EXAMPLE_PREPARE_RASTER_POST_PAYLOAD,
} from '@/lib/prepare-raster.examples';



/**
 * Make an image out of the current map view and prepare it for download.
 *
 * Formerly known as `$.fn.prepare_raster` outside of `apps/`.
 */

export interface PrepareRasterPostHttpPayload {
	/**
	 * The innerHTML of all LocationModal element(s)
	 */
	locationPopupHtml: [string, string?];
	markerLatLon: [number, number];
}



/**
 * This function is called JUST before sending as a POST request to the server-side screenshot service
 * so it can pass that back at `$.fn.prepare_raster` {@link prepareRaster} to prepare the map page for a screenshot. It removes interactive UI elements and tooltips, and dispatches a `resize` event so the map re-lays out at the new size.
 *
 * @remarks
 * This function is designed to be from the web browser used by the person who wants
 * to download a screenshot.
 */
export const getLocationModalInnerHTML = (): null | [string, string?] => {
	const locationModal = document.querySelectorAll('[id^="location-modal-"]');
	if (locationModal.length === 0) {
		return null;
	}

	const [left, right] = [...locationModal].map((child) => {
		const foo = child.innerHTML;
		// TODO: Document Fragment
		// [...child.querySelectorAll('[data-raster]')].map(i => { i.remove(); return i; })
		// do things in HTML here, or not.
		return foo;
	});

	const outcome = [left];
	if (right) {
		outcome.push(right);
	}

	return outcome as [string, string?];
};



/**
 * This function is called from a Selenium (server-side screenshot service) (`climatedata-api`, `climatedata_api/raster.py`) in a headless browser to prepare the map page for a screenshot. It removes interactive UI elements and tooltips, and dispatches a `resize` event so the map re-lays out at the new size.
 * and it expects a payload to be passed to it BEFORE doing what this does.
 *
 * ----
 *
 * Modify the DOM of this app's map page to prepare it for a screenshot.
 *
 * This function is designed to be executed by an external script (e.g. via Selenium)
 * before taking a screenshot. It removes the surrounding chrome (sidebar, headers,
 * sidebar toggle, search and zoom controls) along with any tooltips, then dispatches
 * a `resize` event so the map re-lays out at the new size.
 *
 * Opening the legend is deliberately *not* done here — the caller dispatches
 * `setLegendOpen(true)` instead, because Redux owns that state. This function used
 * to click the `#legend-toggle` button, which flips whatever state it finds rather
 * than setting one. The legend auto-opens once the map container is wide enough and
 * the screenshot runs far above that width, so the click reliably *closed* an
 * already-open legend a moment before the capture. A set cannot misfire that way;
 * do not reintroduce the click. (CLIM-1454 R3.)
 *
 * It does not add the `to-raster` class the screenshot service waits for: that class
 * marks which element gets captured, and this app renders it statically on
 * `#wrapper-map` in `apps/src/components/map.tsx`, so it is already in place.
 *
 * Note: This function does not revert changes. A full page reload is required to restore the original UI.
 *
 * @remarks
 * Nothing inside `apps/` calls this — the caller is outside the bundle.
 * `download-map-modal.tsx` assigns it to `window.$.fn.prepare_raster` while the
 * modal is mounted; the server-side screenshot service (`climatedata-api`,
 * `climatedata_api/raster.py`) then loads this page in a headless browser and
 * evaluates `$.fn.prepare_raster()` to strip the interactive UI before capturing
 * the "Save map as image" PNG. That is the entire call path.
 *
 * The name is a trap: `fw-child/resources/js/map.js` defines its own
 * `$.fn.prepare_raster` for the legacy jQuery Explore Maps page, and a grep for
 * the name finds that one first. It does not apply here, and does not need
 * checking — `fw-child/apps/app-map.php` calls no `wp_head()`/`wp_footer()`, and
 * WordPress fires `wp_enqueue_scripts` from inside `wp_head()`, so nothing the
 * theme enqueues reaches this page, jQuery and `map.js` included. The assignment
 * made by the modal is the only definition present.
 *
 * This is live production behaviour, not scaffolding.
 */
export const prepareRaster = async (payload?: PrepareRasterPostHttpPayload): Promise<void> => {
	console.log('0 prepareRaster: payload', payload);
	await new Promise(resolve => {
		console.log('0a prepareRaster: Promise 0');
		// This is a no-op, but it is here to illustrate the async nature of this function.
		resolve(null);
	});

	let marker: ReturnType<typeof L.marker> | null = null;

	await new Promise(resolve => {
		console.log('1 prepareRaster: Promise 0');
		const {
			// locationPopupHtml,
			markerLatLon,
		} = payload || {};
		const [
			markerLat,
			markerLon,
		] = markerLatLon || [0, 0];

		if (markerLat > 0 && markerLon > 0) {
			const latlng = new L.LatLng(markerLat, markerLon);
			marker = L.marker(latlng);
		}
		resolve(null);
	});

	console.log('2 prepareRaster: marker', marker);

	await new Promise(resolve => {
		console.log('3 prepareRaster: Promise 1');
		document.documentElement.setAttribute('data-raster', 'true');

		// Remove elements that should not appear in the screenshot
		// Which basically makes the map take up all the available space by removing the surrounding elements.
		[
			'map-sidebar',
			'header',
			'sidebar-toggle',
			'header-map',
		].forEach(id => {
			const el = document.getElementById(id);
			if (el) {
				el.remove();
			}
		});

		// Remove all tooltip elements
		document.querySelectorAll('.tooltip').forEach(el => el.remove());

		// Resize the window to force a layout update.
		window.dispatchEvent(new Event('resize'));

		resolve(null);
	});

	console.log('3 prepareRaster: done');
}

// TEMPORARY UTILITIES UNTIL i FIGURE OUT

const createMarkerLatLon = (): PrepareRasterPostHttpPayload['markerLatLon'] => {
	const url = new URL(window.location.href);
	const lat = parseFloat(url.searchParams.get('lat') || '0');
	const lon = parseFloat(url.searchParams.get('lon') || '0');

	return [lat, lon] as [number, number];
}

const INTERNAL_URLS_TEMPORARY = 'https://dataclimatedata.crim.ca/raster'

const getCurrentLocationEscaped = (): string => {
	const enc = btoa(window.location.href);
	return `${INTERNAL_URLS_TEMPORARY}?url=${enc}`;
}

export const createFetchRequestInitOptions = (payload: PrepareRasterPostHttpPayload) => {
	const fetchOptions: RequestInit = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(payload),
	};
	return fetchOptions;
};

export const createPrepareRasterPostHttpPayload = (latLon?: [number, number]): PrepareRasterPostHttpPayload => {
	const locationPopupHtml = getLocationModalInnerHTML() || EXAMPLE_PREPARE_RASTER_POST_PAYLOAD.locationPopupHtml;
	const markerLatLon = latLon ||createMarkerLatLon();

	return {
		locationPopupHtml,
		markerLatLon,
	};
}

const prepareRaster2 = {
	createExampleLocationPopupHtml,
	createFetchRequestInitOptions,
	createMarkerLatLon,
	createPrepareRasterPostHttpPayload,
	EXAMPLE_PREPARE_RASTER_POST_PAYLOAD,
	getCurrentLocationEscaped,
	getLocationModalInnerHTML,
	INTERNAL_URLS_TEMPORARY,
	prepareRaster,
};

console.log('prepareRaster', prepareRaster2);
window.prepareRaster = prepareRaster2;

/*
var attempt = fetch('https://dataclimatedata.crim.ca/raster?url=aHR0cHM6Ly91YXQuY2xpbWF0ZWRhdGEuY2EvbWFwcy8%2FdmFyPWFsbG93YW5jZSZ0aD1hbGxvd2FuY2UmZGF0YXNldD0yMTkmZGF0YU9wYWNpdHk9MTAwJmxhYmVsT3BhY2l0eT0xMDAmbGF0PTU2Ljk1MDk3JmxuZz0tNzUuNDU0MTAmem9vbT03fDExNTUwNzI0ODQ%3D',
    { method: "POST",
	  headers: { 'content-type': 'application/json' },
      body: JSON.stringify({locationPopupHtml: ["Allo"],
         markerLatLon: [56.94797, -75.45410]})
})
*/

