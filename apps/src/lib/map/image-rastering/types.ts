import L from 'leaflet';

import { useMapMarker } from '@/hooks/use-map-marker';

import type { SignalReady } from './signal-raster-ready';

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
	 * @see {@link useMapMarker} — its `addMarker`.
	 */
	addMarker: AddMarker;
	/**
	 * Removes any marker(s) from every mounted pane.
	 * @see {@link useMapMarker} — its `clearMarkers`.
	 */
	clearMarkers: ClearMarkers;
}

/**
 * The part of the user's view that the map URL does not carry: the open location popup and its marker.
 * Sent as the POST body so that the screenshot service can reproduce it.
 */
export interface SelectedLocationSnapshot {
	/**
	 * The HTML of the LocationPopup(s) that was/were open when the user clicked the "Download" button.
	 */
	locationPopupHtml: [string, string?];
	/**
	 * The clicked location, read by the caller from `selectSelectedLocation`
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
export type Window_Fn_Prepare_Raster = (
	locationPopupHtml?: SelectedLocationSnapshot['locationPopupHtml'],
	markerLatLon?: SelectedLocationSnapshot['markerLatLon'],
) => void;

/** Signature of `prepareRaster`, which documents what it does. */
export type PrepareRasterClosure = (
	payload?: SelectedLocationSnapshot,
	handles?: PrepareRasterMapHandles,
	signalReady?: SignalReady,
) => Promise<void>;
