import L from 'leaflet';

import {
	LOCATION_MODAL_BASE_CLASS_NAMES,
	LOCATION_MODAL_POSITION_CLASS_NAMES,
} from '@/lib/location-modal-class-names';
import { cn } from '@/lib/utils';
import { signalRasterReady } from './signal-raster-ready';
import { MAP_SETTLE_TOTAL_BUDGET_MS, waitForMapsSettled } from './wait-for-maps-settled';
import { waitForMarkerIcons } from './wait-for-marker-icons';

import type { PrepareRaster } from './types';

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
 * Ends by calling `signalReady`, the injected readiness signal — defaults to
 * {@link signalRasterReady} — which is how the service learns it may proceed.
 * Everything awaited before that point is something the screenshot depends on
 * *and* that the platform can report the completion of. Nothing here waits out
 * a fixed delay.
 *
 * Exposed globally as `$.fn.prepare_raster` because the screenshot service
 * invokes that exact expression against the page.
 * The legacy WordPress theme ships an unrelated function under the same name, and
 * it never loads on this page, so this definition is the only one that runs here.
 */
export const prepareRaster: PrepareRaster = async (
	payload,
	handles,
	// Injected so the same function can serve production, a debug hold, and a
	// test spy — without a debug branch inside this receiver-side production
	// code. Defaults to the real signal, so two-argument callers are unaffected.
	signalReady = signalRasterReady,
): Promise<void> => {
	const maps = [
		handles?.map ?? null,
		handles?.comparisonMap ?? null,
	];

	// Computed ONCE: both waitForMapsSettled calls below share this single
	// deadline (see MAP_SETTLE_TOTAL_BUDGET_MS) rather than each getting their
	// own clock, so neither can spend the other's share of the budget.
	const settleDeadline = performance.now() + MAP_SETTLE_TOTAL_BUDGET_MS;

	// The service calls this about a second after requesting the page, which can
	// be before the map's own first tiles have arrived. Settling here means the
	// work below runs against a finished map rather than racing it.
	await waitForMapsSettled(maps, settleDeadline);

	const {
		locationPopupHtml,
		markerLatLon,
	} = payload || {};

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
	const containers = [
		handles?.map?.getContainer(),
		handles?.comparisonMap?.getContainer(),
	];
	const className = cn(
		...LOCATION_MODAL_BASE_CLASS_NAMES,
		...LOCATION_MODAL_POSITION_CLASS_NAMES,
	);
	(locationPopupHtml || []).forEach((innerHtml, index) => {
		const container = containers[index];
		if (!container || !innerHtml) {
			return;
		}
		container.insertAdjacentHTML(
			'beforeend',
			`<div class="${className}">${innerHtml}</div>`,
		);
	});

	// `[data-raster="false"]` is a one-shot removal marker: every node carrying it
	// leaves the DOM here, which is what lets the map take the whole viewport.
	// Consumed before the mode flag below, so the two never both apply to a node.
	document
		.querySelectorAll('[data-raster="false"]')
		.forEach((el) => el.remove());

	// `html[data-raster="true"]` is the persistent inclusion flag marking what
	// belongs in the capture. Styling keys off it to reveal elements normally
	// hidden, such as the info pills.
	document.documentElement.setAttribute('data-raster', 'true');

	document.querySelectorAll('.tooltip').forEach((el) => el.remove());

	window.dispatchEvent(new Event('resize'));

	// Leaflet does not act on `resize` synchronously — `Map._onResize` defers
	// `invalidateSize` through `requestAnimationFrame`. This frame is where the
	// map actually changes size and starts requesting tiles for the new viewport,
	// so waiting for it is what makes the checks below measure the resized map
	// instead of the one that existed a moment ago.
	await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

	const [settled] = await Promise.all([
		// Tiles for the viewport the resize just produced. Same deadline as the
		// call above — inherits whatever share of the budget is left.
		waitForMapsSettled(maps, settleDeadline),
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
			`prepareRaster: map still loading after ${MAP_SETTLE_TOTAL_BUDGET_MS}ms, capturing anyway.`,
		);
	}

	signalReady();
};
