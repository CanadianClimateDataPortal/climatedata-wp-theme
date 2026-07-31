/**
 * Both halves of a screenshot round trip live in this module, running across two
 * separate browser sessions — never assume "here" means the same browser throughout.
 *
 * Sender half — the user's browser, on clicking Download:
 * 1. `getLocationModalInnerHTML` scrapes the open LocationModal's markup.
 * 2. `createPrepareRasterPostHttpPayload` pairs it with the clicked marker position.
 * 3. `createFetchRequestInitOptions` wraps that payload as a POST body.
 * 4. That POST reaches an external screenshot service; dataset, variable, and viewport
 *    already travel separately, encoded in the request URL.
 *
 * Receiver half — the screenshot service's headless browser, on a fresh reload of
 * that same URL, with no popup open and no marker placed:
 * 5. The service evaluates the global `$.fn.prepare_raster()` — the reason that literal
 *    name exists at all — a closure that calls `prepareRaster` below.
 * 6. `prepareRaster` replays the marker and popup carried in the POST body.
 * 7. It strips interactive chrome and fires a resize, so the layout matches what the
 *    user saw, before the screenshot is taken.
 */
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

/** The payload POSTed to the external screenshot service before it replays this page. */
export interface PrepareRasterPostHttpPayload {
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
 * Runs in the user's browser.
 *
 * Captures the currently open LocationModal's HTML so it can travel in the
 * outgoing payload — the screenshot service's browser has no popup of its
 * own to read.
 */
export const getLocationModalInnerHTML = (): null | [string, string?] => {
	const locationModal = document.querySelectorAll('[id^="location-modal-"]');
	if (locationModal.length === 0) {
		return null;
	}

	// We may have two maps side-by side
	const [left, right] = [...locationModal].map((child) => child.innerHTML);

	const outcome = [left];
	if (right) {
		outcome.push(right);
	}

	return outcome as [string, string?];
};



/**
 * Runs in the screenshot service's headless browser.
 *
 * Replays the popup and marker carried in `payload` (see {@link PrepareRasterMapHandles}) —
 * the screenshot service's browser has clicked nothing, so without this step there is
 * nothing to capture — then removes the surrounding chrome and any tooltips, and dispatches
 * a `resize` event so the map re-lays out at the new size.
 *
 * The legend is opened by the caller dispatching `setLegendOpen(true)` rather than by
 * clicking `#legend-toggle` here: that button flips whatever state it finds, and the
 * legend auto-opens once the map container is wide enough — a width the screenshot always
 * exceeds — so a click would reliably close an already-open legend just before capture.
 * `setLegendOpen(true)` cannot misfire that way.
 *
 * Not reversible — restoring the original UI requires a full page reload.
 */
// Exposed globally as $.fn.prepare_raster because a server-side headless-browser
// screenshot service invokes that exact expression against the page. A second,
// unrelated function under the same name lives in fw-child/resources/js/map.js;
// it never loads on this page, so only this definition ever runs here.
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

		// Injects straight into the DOM node `LocationModal` itself would mount
		// into (`map.tsx` / `map-container.tsx`). Index 0 is the left/main pane,
		// index 1 (compare mode only) the right pane — the same order
		// `getLocationModalInnerHTML` captured them in.
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
		// Remove elements that should not appear in the screenshot
		// Which basically makes the map take up all the available space by removing the surrounding elements.
		document.querySelectorAll('[data-raster="false"]').forEach(el => el.remove());

		document.documentElement.setAttribute('data-raster', 'true');

		document.querySelectorAll('.tooltip').forEach(el => el.remove());

		// Resize the window to force a layout update.
		window.dispatchEvent(new Event('resize'));

		resolve(null);
	});
}

/**
 * Runs in the user's browser. Wraps the payload as the POST `fetch` init.
 */
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
 * receiving a partially-empty payload.
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
