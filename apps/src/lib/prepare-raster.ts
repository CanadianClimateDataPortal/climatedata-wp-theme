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
 * 8. Once everything it can observe has settled, it adds the `to-raster` class to the
 *    element the service captures. That class is the signal the service waits on.
 */
import L from 'leaflet';

import type {
	MapState,
} from '@/types/types';

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
 * The class name the screenshot service polls for, and then screenshots.
 *
 * It does two jobs at once, which is easy to miss from inside this repository:
 * the service waits up to ten seconds for an element carrying this class to
 * become visible, and then captures *that element* rather than the whole
 * viewport. So it is both the "ready" signal and the definition of what ends
 * up in the PNG. It therefore has to land on the element we want captured, and
 * only once the contents of that element have stopped changing.
 */
const RASTER_READY_CLASS_NAME = 'to-raster';

/** The element the service captures — the grid holding both map panes. */
const RASTER_TARGET_ELEMENT_ID = 'map-root';

/**
 * How long {@link prepareRaster} waits for the map to settle before signalling
 * readiness regardless.
 *
 * The service allows ten seconds for the class above to appear and has no error
 * branch, so failing to signal does not produce a degraded screenshot — it
 * produces no screenshot at all and an error for whoever clicked Download.
 * Signalling late with a possibly imperfect map is the better of those two, so
 * this sits below the service's ceiling with room to spare.
 */
const MAP_SETTLE_TIMEOUT_MS = 8_000;

/**
 * How many consecutive animation frames every tiled layer must report idle
 * before the map counts as settled.
 *
 * More than one, because the two panes are synchronised in both directions (see
 * the `sync` calls in `map.tsx`): a move on one pane propagates to the other, so
 * the second pane starts requesting its tiles slightly *after* the first pane
 * has finished with its own. A single idle reading can land in that gap and
 * report a map that has not finished. Requiring consecutive idle frames narrows
 * the window. It does not close it, and no finite number would.
 */
const MAP_SETTLE_STABLE_FRAMES = 3;

/** A layer that takes part in Leaflet's tile-loading lifecycle. */
type TiledLayer = { isLoading: () => boolean };

const isTiledLayer = (layer: L.Layer): layer is L.Layer & TiledLayer =>
	typeof (layer as Partial<TiledLayer>).isLoading === 'function';

/**
 * Resolves once every tiled layer on every mounted map has reported idle for
 * {@link MAP_SETTLE_STABLE_FRAMES} consecutive animation frames, or after
 * {@link MAP_SETTLE_TIMEOUT_MS} — `true` when the map settled, `false` on
 * timeout.
 *
 * The state is polled each frame rather than composed from Leaflet's `load`
 * event, deliberately. A layer that already finished before a listener attaches
 * never fires `load` again, so awaiting the events would wait forever on
 * precisely the layers that had nothing left to do. Reading the current state
 * has no such edge to miss.
 *
 * `isLoading()` here is Leaflet's own method on `GridLayer` and everything that
 * extends it — the base map tiles, the WMS layers, and the vector-tile
 * choropleth. It is unrelated to the `isLoading` flags this app keeps in Redux
 * for the S2D release date.
 *
 * KNOWN LIMIT, and it is worth stating rather than implying completeness: this
 * cannot detect a layer that has not been created yet. Several layers only
 * construct themselves once their own data request resolves — `variable-layer.ts`
 * and `interactive-regions-layer.tsx` both return early from their effect until
 * then. While such a request is in flight there is no layer on the map to report
 * as loading, so a page that is not finished looks identical to one that is.
 * Covering that would require those layers to advertise that they are pending,
 * which they currently do not.
 *
 * @remark Where does this run?: In the user's browser.
 */
const waitForMapsSettled = (maps: (L.Map | null)[]): Promise<boolean> => {
	const mounted = maps.filter((map): map is L.Map => Boolean(map));
	const startedAt = performance.now();
	let idleFrames = 0;

	return new Promise<boolean>((resolve) => {
		const check = () => {
			let loading = false;
			mounted.forEach((map) => {
				map.eachLayer((layer) => {
					if (isTiledLayer(layer) && layer.isLoading()) {
						loading = true;
					}
				});
			});

			idleFrames = loading ? 0 : idleFrames + 1;

			if (idleFrames >= MAP_SETTLE_STABLE_FRAMES) {
				resolve(true);
				return;
			}
			if (performance.now() - startedAt >= MAP_SETTLE_TIMEOUT_MS) {
				resolve(false);
				return;
			}
			requestAnimationFrame(check);
		};
		requestAnimationFrame(check);
	});
};

/**
 * Resolves once the marker icons on the page have finished decoding.
 *
 * The marker replayed below carries a real `<img>`: Leaflet's `L.Icon` builds
 * one from `iconUrl`, and fires no event to say it has painted. This browser
 * has never placed a marker, so that image may not be cached and its request
 * may only begin when the marker is added. The selector is restricted to `img`
 * because `L.DivIcon` puts the same class on a `<div>`, and those markers carry
 * inline SVG with nothing to fetch.
 *
 * Never rejects. An icon that fails to load should cost us the icon, not the
 * whole screenshot.
 *
 * @remark Where does this run?: In the user's browser.
 */
const waitForMarkerIcons = (): Promise<unknown> => {
	const icons = document.querySelectorAll<HTMLImageElement>('img.leaflet-marker-icon');
	return Promise.all(
		[...icons].map((icon) => icon.decode().catch(() => undefined)),
	);
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
 *
 * Ends by adding {@link RASTER_READY_CLASS_NAME} to the capture target, which is
 * how the service learns it may proceed. Everything awaited before that point is
 * something the screenshot depends on *and* that the platform can report the
 * completion of. Nothing here waits out a fixed delay.
 */
// Exposed globally as $.fn.prepare_raster because a server-side headless-browser
// screenshot service invokes that exact expression against the page. A second,
// unrelated function under the same name lives in fw-child/resources/js/map.js;
// it never loads on this page, so only this definition ever runs here.
export const prepareRaster: PrepareRaster = async (
	payload,
	handles,
): Promise<void> => {
	const maps = [handles?.map ?? null, handles?.comparisonMap ?? null];

	// The service calls this about a second after requesting the page, which can
	// be before the map's own first tiles have arrived. Settling here means the
	// work below runs against a finished map rather than racing it.
	await waitForMapsSettled(maps);

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

	// Remove elements that should not appear in the screenshot
	// Which basically makes the map take up all the available space by removing the surrounding elements.
	document.querySelectorAll('[data-raster="false"]').forEach(el => el.remove());

	document.documentElement.setAttribute('data-raster', 'true');

	document.querySelectorAll('.tooltip').forEach(el => el.remove());

	// Resize the window to force a layout update.
	window.dispatchEvent(new Event('resize'));

	// Leaflet does not act on `resize` synchronously — `Map._onResize` defers
	// `invalidateSize` through `requestAnimationFrame`. This frame is where the
	// map actually changes size and starts requesting tiles for the new viewport,
	// so waiting for it is what makes the checks below measure the resized map
	// instead of the one that existed a moment ago.
	await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

	const [settled] = await Promise.all([
		// Tiles for the viewport the resize just produced.
		waitForMapsSettled(maps),
		// Fonts for the popup markup injected above: this browser never rendered
		// that text before, so those font requests may only have started just now.
		document.fonts.ready,
		// The replayed marker's icon image.
		waitForMarkerIcons(),
	]);

	if (!settled) {
		// Worth surfacing in the headless browser's console. It is the difference
		// between "the map was ready" and "we stopped waiting and captured it
		// anyway", which is otherwise invisible in the resulting PNG.
		console.warn(
			`prepareRaster: map still loading after ${MAP_SETTLE_TIMEOUT_MS}ms, capturing anyway.`,
		);
	}

	document
		.getElementById(RASTER_TARGET_ELEMENT_ID)
		?.classList.add(RASTER_READY_CLASS_NAME);
}

/**
 * Wraps the payload as the POST `fetch` init.
 *
 * @remark Where does this run?: In the user's browser.
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
 *
 * @remark Where does this run?: In the user's browser.
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

/**
 * Use this to both start the execution for "Download image from viewport" and
 * for testing the payload using cURL via CLI against the screenshot service.
 *
 * @remark Where does this run?: In the user's browser.
 */
export const fromSelectedLocationToPrepareRasterPostHttpPayload = (
	latlng?: Record<'lat' | 'lng', number>,
): PrepareRasterPostHttpPayload | null => {
	let payload: PrepareRasterPostHttpPayload | null = null;
	const markerLatLon: PrepareRasterPostHttpPayload['markerLatLon'] | null = latlng
		? [latlng.lat, latlng.lng]
		: null;

	payload =  createPrepareRasterPostHttpPayload(markerLatLon) ?? null;

	// For when we need to test using cURL against the screenshot service.
	// To use, make sure you activate by `window.mapPrepareRasterPostHttpPayload = null` in the browser Dev Tools
	if ('mapPrepareRasterPostHttpPayload' in window) {
		console.info('For Manual testing against screenshot service: window.mapPrepareRasterPostHttpPayload = ', payload);
		if (payload) {
			window.mapPrepareRasterPostHttpPayload = window.structuredClone(payload);
		} else {
			window.mapPrepareRasterPostHttpPayload = null;
			console.info('For Manual testing against screenshot service: we did not get payload', { selectedLocation, markerLatLon, locationPopupHtml: getLocationModalInnerHTML() 	});
		}
	}

	return payload;
};


/**
 * In order to test the screenshot service, we need to set the DATA_URL and URL_ENCODER_SALT in the browser's window object.
 * This is because the screenshot service is a separate service that needs to know where to send the request to get the data.
 *
 * @remark Where does this run?: In the user's browser.
 *
 * @example Usage example
 *
 * ```js
 * // 1. From any map page, open the browser's developer console.:
 *
 * // 1.1. Paste and the following:
 * window.mapPrepareRasterPostHttpPayload = null;
 *
 * // The above enables the debugger and will make the code to write the payload info to be written to the window object.
 *
 * // 1.2. Adjust the debugger to point to ANOTHER deployed screenshot service.
 * window.mapPrepareRasterPostHttpPayloadDebugger.setup('staging.climatedata.ca', 'https://staging-data.example.org', '<salt to use>' );
 *
 * // The above adjusts what's needed so that we can use our local frontend app as if it was deployed at the same environment.
 *
 * // 2. Click the "Download" button on the map page.
 * ```
 */
export class PrepareRasterPostHttpPayloadDebugger {
	#urlHost: string | '' = '';

	#places: [string, string, string][] = [];

	get isSetup(): boolean {
		return this.#urlHost !== '';
	}

	get places(): [string, string, string][] {
		return [...this.#places];
	}

	setup(
		urlHost: string,
		dataUrl: string,
		salt: string,
	) {
		this.#urlHost = urlHost;
		window.DATA_URL = dataUrl;
		window.URL_ENCODER_SALT = salt;
		console.log('DebugPrepareRasterPostHttpPayload: setup', { urlHost, dataUrl, salt });
	}

	fixUrlHost(url: URL) {
		if (url.host !== this.#urlHost) {
			const previousHost = url.host;
			url.host = this.#urlHost;
			console.warn(`fixUrlHost fixed from ${previousHost} to be ${this.#urlHost} (${url.href})`);
		}
	}

	addPlace(
		placeName: string,
		currentLocation: string,
		saltedBackendLocation: string,
	) {
		this.#places.push([placeName, currentLocation, saltedBackendLocation]);
	}
}
