import { describe, expect, test } from 'vitest';

import type L from 'leaflet';

import { waitForMapsSettled } from './wait-for-maps-settled';

/**
 * Regression tests for {@link waitForMapsSettled}'s deadline contract.
 *
 * `waitForMapsSettled` keeps no clock of its own — the deadline is
 * caller-supplied on the `performance.now()` scale, and `prepareRaster`
 * relies on that to share one budget across two sequential calls. These
 * tests pin that contract: an already-expired deadline resolves fast
 * rather than falling back to any internal clock, and a shared deadline
 * value spent by one call is honoured by the next.
 */

/** A layer stub matching the shape {@link waitForMapsSettled}'s `isTiledLayer` guard checks for. */
type FakeTiledLayer = {
	isLoading?: () => boolean;
};

/**
 * Hand-built map stub — no `vi.mock`, no real `L.Map`. `waitForMapsSettled`
 * only calls `eachLayer`, so that is all this fake needs to implement.
 *
 * @param layers - Layer stubs `eachLayer` reports, in order.
 */
const createFakeMap = (
	layers: FakeTiledLayer[],
): L.Map =>
	({
		eachLayer: (callback: (layer: L.Layer) => void): void => {
			layers.forEach((layer) => callback(layer as L.Layer));
		},
	}) as unknown as L.Map;

describe('waitForMapsSettled', () => {
	test('resolves false promptly when the deadline has already expired', async () => {
		const permanentlyLoadingLayer: FakeTiledLayer = { isLoading: () => true };
		const fakeMap = createFakeMap([permanentlyLoadingLayer]);
		const alreadyExpiredDeadline = performance.now() - 1;

		const start = performance.now();
		const settled = await waitForMapsSettled([fakeMap], alreadyExpiredDeadline);
		const elapsed = performance.now() - start;

		// Two orders of magnitude under the 9000ms internal-clock reversion this
		// discriminates against — headroom against jsdom timing noise, not tightness.
		expect(settled).toBe(false);
		expect(elapsed).toBeLessThan(50);
	});

	test('a shared deadline spent by the first call is honoured by the second', async () => {
		const permanentlyLoadingLayer: FakeTiledLayer = { isLoading: () => true };
		const fakeMap = createFakeMap([permanentlyLoadingLayer]);
		const sharedDeadline = performance.now() + 120;

		const firstStart = performance.now();
		const firstResult = await waitForMapsSettled([fakeMap], sharedDeadline);
		const firstElapsed = performance.now() - firstStart;

		// Pins the fake's fidelity AND the clock domain at once: a fake that settles
		// on first poll, or an implementation comparing this deadline against
		// Date.now() instead of performance.now(), would both return instantly here.
		expect(firstResult).toBe(false);
		expect(firstElapsed).toBeGreaterThanOrEqual(100);

		const secondStart = performance.now();
		const secondResult = await waitForMapsSettled([fakeMap], sharedDeadline);
		const secondElapsed = performance.now() - secondStart;

		expect(secondResult).toBe(false);
		expect(secondElapsed).toBeLessThan(50);
	});

	test('resolves true once no layer reports loading', async () => {
		const idleLayer: FakeTiledLayer = { isLoading: () => false };
		const fakeMap = createFakeMap([idleLayer]);
		const farDeadline = performance.now() + 5_000;

		const settled = await waitForMapsSettled([fakeMap], farDeadline);

		expect(settled).toBe(true);
	});

	test('ignores null entries in the maps array', async () => {
		const farDeadline = performance.now() + 5_000;

		const settled = await waitForMapsSettled([null, null], farDeadline);

		expect(settled).toBe(true);
	});

	test('a layer without an isLoading method does not block resolving true', async () => {
		const nonTiledLayer: FakeTiledLayer = {};
		const idleTiledLayer: FakeTiledLayer = { isLoading: () => false };
		const fakeMap = createFakeMap([nonTiledLayer, idleTiledLayer]);
		const farDeadline = performance.now() + 5_000;

		const settled = await waitForMapsSettled([fakeMap], farDeadline);

		expect(settled).toBe(true);
	});

	test('a layer without an isLoading method does not mask a loading tiled layer', async () => {
		const nonTiledLayer: FakeTiledLayer = {};
		const permanentlyLoadingLayer: FakeTiledLayer = { isLoading: () => true };
		const fakeMap = createFakeMap([nonTiledLayer, permanentlyLoadingLayer]);
		const alreadyExpiredDeadline = performance.now() - 1;

		const settled = await waitForMapsSettled([fakeMap], alreadyExpiredDeadline);

		expect(settled).toBe(false);
	});
});
