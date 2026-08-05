import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type L from 'leaflet';

import { prepareRaster } from './prepare-raster';
import { MAP_SETTLE_TOTAL_BUDGET_MS } from './wait-for-maps-settled';
import { EXAMPLE_PREPARE_RASTER_POST_PAYLOAD, renderLocationModal } from './types.examples';

import type { PrepareRasterMapHandles } from './types';

/**
 * Orchestrator tests for {@link prepareRaster} — the receiver-side replay,
 * chrome-strip, settle, and signal sequence `$.fn.prepare_raster` invokes.
 *
 * Group A exercises the seam and its side effects against the null-maps
 * path — no `L.Map` mounted — which resolves rather than deadlocking,
 * because every map read goes through optional chaining.
 *
 * Group B is the regression that matters most: `prepareRaster` must spend
 * ONE shared {@link MAP_SETTLE_TOTAL_BUDGET_MS} window across both of its
 * internal `waitForMapsSettled` calls, not one window per call. See
 * `wait-for-maps-settled.ts`'s doc comment on that constant for why the
 * budget exists and what its arithmetic runs against.
 */

/**
 * Fresh, uninstrumented handles for the null-maps path — no `L.Map` mounted
 * on either pane.
 *
 * Hand-built and cast rather than a real `L.Map`: `prepareRaster` only ever
 * reads `map` / `comparisonMap` through optional chaining, so `null` is a
 * faithful stand-in for "no map mounted".
 */
const createNullMapHandles = (): PrepareRasterMapHandles =>
	({
		map: null,
		comparisonMap: null,
		addMarker: vi.fn(),
		clearMarkers: vi.fn(),
	}) as unknown as PrepareRasterMapHandles;

/** A layer stub matching the shape `waitForMapsSettled`'s `isTiledLayer` guard checks for. */
type FakeTiledLayer = {
	isLoading?: () => boolean;
};

/**
 * Hand-built map stub whose one layer reports loading forever, so both of
 * `prepareRaster`'s internal `waitForMapsSettled` calls run all the way to
 * their shared deadline instead of resolving early.
 *
 * `getContainer` returns a real, detached element because `prepareRaster`
 * calls it unconditionally when placing popup markup — present here for
 * shape fidelity with the production handles, even though Group B supplies
 * no payload for it to receive.
 */
const createPermanentlyLoadingMap = (): L.Map => {
	const permanentlyLoadingLayer: FakeTiledLayer = { isLoading: () => true };
	return {
		eachLayer: (callback: (layer: L.Layer) => void): void => {
			callback(permanentlyLoadingLayer as L.Layer);
		},
		getContainer: (): HTMLElement => document.createElement('div'),
	} as unknown as L.Map;
};

afterEach(() => {
	// jsdom keeps DOM nodes and the mode-flag attribute alive across tests
	// in the same file otherwise.
	document.body.innerHTML = '';
	document.documentElement.removeAttribute('data-raster');
	vi.restoreAllMocks();
	vi.useRealTimers();
});

describe('prepareRaster — seam and side effects (null-maps path)', () => {
	test('fires the injected signalReady spy exactly once', async () => {
		const signalReady = vi.fn();

		await prepareRaster(undefined, createNullMapHandles(), signalReady);

		expect(signalReady).toHaveBeenCalledTimes(1);
	});

	test('removes every [data-raster="false"] node from the document', async () => {
		renderLocationModal('a', 'Removal Fixture');

		await prepareRaster(undefined, createNullMapHandles(), vi.fn());

		expect(document.querySelectorAll('[data-raster="false"]')).toHaveLength(0);
	});

	test('sets document.documentElement to data-raster="true"', async () => {
		await prepareRaster(undefined, createNullMapHandles(), vi.fn());

		expect(document.documentElement.getAttribute('data-raster')).toBe('true');
	});

	test('removes [data-raster="false"] nodes before setting the data-raster="true" mode flag', async () => {
		const host = renderLocationModal('a', 'Ordering Fixture');
		const closeButton = host.querySelector('[data-raster="false"]');
		if (closeButton === null) {
			throw new Error('Fixture is missing its data-raster="false" close button.');
		}

		// Per-instance spies, not vi.mock — both call through to the real
		// implementation by default, so this only observes order without
		// changing prepareRaster's behaviour.
		const removeSpy = vi.spyOn(closeButton, 'remove');
		const setAttributeSpy = vi.spyOn(document.documentElement, 'setAttribute');

		await prepareRaster(undefined, createNullMapHandles(), vi.fn());

		const modeFlagCallIndex = setAttributeSpy.mock.calls.findIndex(
			([name, value]) => name === 'data-raster' && value === 'true',
		);

		expect(removeSpy).toHaveBeenCalledTimes(1);
		expect(modeFlagCallIndex).toBeGreaterThanOrEqual(0);

		const removeOrder = removeSpy.mock.invocationCallOrder[0];
		const modeFlagOrder = setAttributeSpy.mock.invocationCallOrder[modeFlagCallIndex];

		// `data-raster="true"` is a persistent inclusion flag and
		// `data-raster="false"` is a one-shot removal marker consumed before
		// that flag is set. Two independent mechanisms rather than a matched
		// pair, so ordering is the only honest thing to assert here.
		expect(removeOrder).toBeLessThan(modeFlagOrder);
	});

	test('removes .tooltip nodes', async () => {
		const tooltip = document.createElement('div');
		tooltip.className = 'tooltip';
		document.body.appendChild(tooltip);

		await prepareRaster(undefined, createNullMapHandles(), vi.fn());

		expect(document.querySelectorAll('.tooltip')).toHaveLength(0);
	});

	test('dispatches a resize event on window', async () => {
		const resizeListener = vi.fn();
		window.addEventListener('resize', resizeListener);

		await prepareRaster(undefined, createNullMapHandles(), vi.fn());

		window.removeEventListener('resize', resizeListener);

		expect(resizeListener).toHaveBeenCalledTimes(1);
	});

	test('calls clearMarkers then addMarker, in that order, when markerLatLon is finite', async () => {
		const handles = createNullMapHandles();

		await prepareRaster(EXAMPLE_PREPARE_RASTER_POST_PAYLOAD, handles, vi.fn());

		const clearMarkers = vi.mocked(handles.clearMarkers);
		const addMarker = vi.mocked(handles.addMarker);

		expect(clearMarkers).toHaveBeenCalledTimes(1);
		expect(addMarker).toHaveBeenCalledTimes(1);
		expect(clearMarkers.mock.invocationCallOrder[0]).toBeLessThan(
			addMarker.mock.invocationCallOrder[0],
		);
	});

	test('does not call either marker handle when payload is absent (the [NaN, NaN] guard)', async () => {
		const handles = createNullMapHandles();

		await prepareRaster(undefined, handles, vi.fn());

		expect(handles.clearMarkers).not.toHaveBeenCalled();
		expect(handles.addMarker).not.toHaveBeenCalled();
	});
});

describe('prepareRaster — shared settle-deadline budget (CLIM-1454 regression)', () => {
	beforeEach(() => {
		vi.useFakeTimers({
			toFake: [
				'clearImmediate',
				'clearInterval',
				'clearTimeout',
				'Date',
				'cancelAnimationFrame',
				'performance',
				'requestAnimationFrame',
				'setImmediate',
				'setInterval',
				'setTimeout',
			],
		});
	});

	test('resolves within roughly one MAP_SETTLE_TOTAL_BUDGET_MS window, not two', async () => {
		const handles = {
			map: createPermanentlyLoadingMap(),
			comparisonMap: createPermanentlyLoadingMap(),
			addMarker: vi.fn(),
			clearMarkers: vi.fn(),
		} as unknown as PrepareRasterMapHandles;
		const signalReady = vi.fn();

		const donePromise = prepareRaster(undefined, handles, signalReady);

		// Both mounted maps report loading forever, so each internal
		// waitForMapsSettled call runs out its share of the clock rather than
		// resolving early. A single shared deadline needs roughly ONE budget
		// plus headroom for the intervening resize/font/icon work. If
		// prepareRaster silently computed `performance.now() + 9_000` at each
		// call site instead of sharing one deadline, the second call would
		// still be spending its own fresh budget here, and signalReady would
		// not have fired by this point — half of the double-budget window.
		await vi.advanceTimersByTimeAsync(MAP_SETTLE_TOTAL_BUDGET_MS + 500);

		expect(signalReady).toHaveBeenCalledTimes(1);

		await donePromise;
	});
});
