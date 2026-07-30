import L from 'leaflet';

import { useMapMarker } from '@/hooks/use-map-marker';
import {
	LOCATION_MODAL_BASE_CLASS_NAMES,
	LOCATION_MODAL_POSITION_CLASS_NAMES,
} from '@/lib/location-modal-class-names';
import { cn } from '@/lib/utils';

// To avoid circular dependency, and having to update elsewhere when/if these types change.
type AddMarker = ReturnType<typeof useMapMarker>['addMarker'];
type ClearMarkers = ReturnType<typeof useMapMarker>['clearMarkers'];

/**
 * The map handles `prepareRaster` needs to replay a popup and marker that
 * only exist in the browser that sent the POST request. The screenshot
 * service's browser has clicked nothing, so there is no real
 * `LocationModal` DOM or marker for it to strip in the first place — this
 * is what lets `prepareRaster` build one before stripping chrome.
 *
 * Supplied by `download-map-modal.tsx`, the only caller, via `useMap()` and
 * `useMapMarker()` — `prepareRaster` is a plain module-level function with
 * no React context of its own.
 */
export interface PrepareRasterMapHandles {
	/** The primary map instance; `null` until Leaflet has mounted it. */
	map: L.Map | null;
	/** The comparison-pane map instance; `null` outside compare mode. */
	comparisonMap: L.Map | null;
	/**
	 * Places a marker on every mounted pane. Mirrors the click handling in `use-map-interactions.tsx`.
	 * @see {@link useMapMarker.addMarker}
	 */
	addMarker: AddMarker;
	/**
	 * Removes any marker(s) from every mounted pane.
	 * @see {@link useMapMarker.clearMarkers}
	 */
	clearMarkers: ClearMarkers;
}

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
	/**
	 * The clicked location, read by the caller from {@link selectSelectedLocation}
	 * or `null` when nothing is selected.
	 *
	 * Comes from Redux rather than the URL because the URL only carries the viewport centre,
	 * not the clicked point.
	 */
	markerLatLon: [number, number];
}

/**
 * The function we attach to `window.$.fn.prepare_raster` that is called by the server-side
 * screenshot service (`climatedata-api`, `climatedata_api/raster.py`) in a headless browser
 * to prepare the map page for a screenshot.
 */
export type Prepare_Raster = (
	locationPopupHtml?: PrepareRasterPostHttpPayload['locationPopupHtml'],
	markerLatLon?: PrepareRasterPostHttpPayload['markerLatLon'],
) => void;

export type PrepareRaster = (
	payload?: PrepareRasterPostHttpPayload,
	handles?: PrepareRasterMapHandles,
) => Promise<void>;

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

	const [left, right] = [...locationModal].map((child) => child.innerHTML);

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
 * before taking a screenshot. It first replays the popup and marker carried in
 * `payload` (see {@link PrepareRasterMapHandles}) — the screenshot service's browser
 * has clicked nothing, so without this step there is nothing to capture — then removes
 * the surrounding chrome (sidebar, headers, sidebar toggle, search and zoom controls)
 * along with any tooltips, then dispatches a `resize` event so the map re-lays out at
 * the new size.
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
export const prepareRaster: PrepareRaster = async (
	payload,
	handles,
): Promise<void> => {
	// Making sure the map has finished moving and loading what it has to load.
	await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

	await new Promise(resolve => {
		const { locationPopupHtml, markerLatLon } = payload || {};

		// `Number.isFinite` rather than `> 0`: every Canadian longitude is
		// negative, so a `> 0` check silently dropped every real marker. The
		// `[NaN, NaN]` fallback (rather than `[0, 0]`) keeps a missing
		// `markerLatLon` from being read as a real position at 0,0.
		const [markerLat, markerLon] = markerLatLon || [NaN, NaN];
		if (Number.isFinite(markerLat) && Number.isFinite(markerLon)) {
			// Placing the marker directly, instead of dispatching
			// `setSelectedLocation`, is deliberate: that dispatch mounts the
			// real `LocationModal` and fires its location-lookup fetch
			// chain, which would fight the popup HTML injected below.
			handles?.clearMarkers();
			handles?.addMarker(new L.LatLng(markerLat, markerLon), '');
		}

		// Re-create the popup(s) the sending browser had open, by injecting
		// straight into the DOM node `<LMapContainer>` renders its React
		// children into — the same node `LocationModal` itself would mount
		// into (`map.tsx` / `map-container.tsx`). Index 0 is the left/main
		// pane, index 1 (present only in compare mode) is the right/compare
		// pane — the same order `getLocationModalInnerHTML` captured them in.
		const containers = [handles?.map?.getContainer(), handles?.comparisonMap?.getContainer()];
		const className = cn(...LOCATION_MODAL_BASE_CLASS_NAMES, ...LOCATION_MODAL_POSITION_CLASS_NAMES);
		(locationPopupHtml || []).forEach((innerHtml, index) => {
			const container = containers[index];
			if (!container || !innerHtml) {
				return;
			}
			container.insertAdjacentHTML('beforeend', `<div class="${className}">${innerHtml}</div>`);
		});

		resolve(null);
	});

	await new Promise(resolve => {
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
}

export const createFetchRequestInitOptions = (payload?: PrepareRasterPostHttpPayload): RequestInit => {
	const fetchOptions: RequestInit = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
	};
	if (payload) {
		fetchOptions.body = JSON.stringify(payload);
	}
	return fetchOptions;
};

/**
 * Builds the outgoing POST payload from the sending browser's own current
 * state — the person clicking "Download", not the screenshot service.
 *
 * Returns `undefined`, never a payload with an empty `locationPopupHtml`,
 * whenever either half is missing: no popup currently open, or no location
 * selected. `undefined` becomes an absent request body; the server-side
 * hook then calls `$.fn.prepare_raster()` argument-less rather than
 * receiving a partially-empty payload. (CLIM-1454 T2.)
 *
 * @param markerLatLon The clicked location, read by the caller from
 * {@link selectSelectedLocation}, or `null` when nothing is selected. Comes
 * from Redux rather than the URL because the URL only carries the viewport
 * centre, not the clicked point.
 */
export const createPrepareRasterPostHttpPayload = (
	markerLatLon: PrepareRasterPostHttpPayload['markerLatLon'] | null,
): PrepareRasterPostHttpPayload | undefined => {
	const locationPopupHtml = getLocationModalInnerHTML();
	if (!locationPopupHtml || !markerLatLon) {
		return undefined;
	}

	return {
		locationPopupHtml,
		markerLatLon,
	};
};
