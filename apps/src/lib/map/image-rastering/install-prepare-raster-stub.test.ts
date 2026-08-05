import { afterEach, describe, expect, test, vi } from 'vitest';

import {
	installPrepareRasterStub,
	PREPARE_RASTER_STUB_POLL_DEADLINE_MS,
} from './install-prepare-raster-stub';

import type { Prepare_Raster } from './types';

/**
 * Tests for {@link installPrepareRasterStub}'s polling contract (CLIM-1454).
 *
 * The stub is defence in depth against a registration race that is real in
 * principle: the screenshot service could call `window.$.fn.prepare_raster`
 * before `DownloadMapModal`'s effect has registered the real implementation.
 * Measured on a warm load, that registration lands around 34ms after
 * navigation, well inside the service's one-second wait, so this gap has
 * not been the observed cause of a service failure — it remains unmeasured
 * on a cold load.
 * These tests pin the stub's contract regardless: a call arriving early is
 * captured and forwarded once the real implementation appears, a call
 * arriving late reaches it directly, and an abandoned poll neither loops
 * forever nor forwards to itself.
 *
 * No `vi.mock` — `vi.useFakeTimers` is a different tool, established for
 * this namespace by the settle tests, and `performance` is genuinely faked
 * here the same way.
 */

/**
 * Reads the currently installed `$.fn.prepare_raster`, asserting the chain
 * {@link installPrepareRasterStub} itself guarantees is populated.
 *
 * Keeps the tests below free of repeated non-null assertions on `window.$.fn`.
 */
const getInstalled = (): Prepare_Raster => {
	const current = window.$?.fn?.prepare_raster;
	if (!current) {
		throw new Error('Expected window.$.fn.prepare_raster to be installed.');
	}
	return current;
};

afterEach(() => {
	// installPrepareRasterStub mutates the shared global window.$ — reset it
	// so one test's registration cannot leak into the next.
	delete window.$;
	vi.restoreAllMocks();
	vi.useRealTimers();
});

describe('installPrepareRasterStub', () => {
	test('a call arriving before registration is forwarded once the real function appears', async () => {
		vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] });
		installPrepareRasterStub();
		const real = vi.fn() as unknown as Prepare_Raster;

		// The service's call, arriving before anything real is registered.
		getInstalled()(['left'], [45.5, -73.6]);
		// DownloadMapModal's effect, registering moments later.
		window.$!.fn!.prepare_raster = real;

		await vi.advanceTimersByTimeAsync(100);

		expect(real).toHaveBeenCalledTimes(1);
	});

	test('the forwarded call receives the original arguments unchanged', async () => {
		vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] });
		installPrepareRasterStub();
		const real = vi.fn() as unknown as Prepare_Raster;

		getInstalled()(['left', 'right'], [45.5, -73.6]);
		window.$!.fn!.prepare_raster = real;

		await vi.advanceTimersByTimeAsync(100);

		expect(real).toHaveBeenCalledWith(['left', 'right'], [45.5, -73.6]);
	});

	test('the argument-less legacy GET call is forwarded too', async () => {
		vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] });
		installPrepareRasterStub();
		const real = vi.fn() as unknown as Prepare_Raster;

		getInstalled()();
		window.$!.fn!.prepare_raster = real;

		await vi.advanceTimersByTimeAsync(100);

		expect(real).toHaveBeenCalledTimes(1);
		expect(real).toHaveBeenCalledWith();
	});

	test('a call arriving after registration reaches the real function directly', () => {
		installPrepareRasterStub();
		const real = vi.fn() as unknown as Prepare_Raster;

		// Registration happens first, exactly as DownloadMapModal's effect
		// would if it had already run — the stub is never consulted here.
		window.$!.fn!.prepare_raster = real;
		getInstalled()(['left'], [45.5, -73.6]);

		expect(real).toHaveBeenCalledTimes(1);
	});

	test('polling stops at the deadline without invoking anything', async () => {
		vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] });
		installPrepareRasterStub();

		getInstalled()(['left'], [45.5, -73.6]);
		await vi.advanceTimersByTimeAsync(PREPARE_RASTER_STUB_POLL_DEADLINE_MS + 200);

		// A registration arriving after the poll gave up must never be reached.
		const real = vi.fn() as unknown as Prepare_Raster;
		window.$!.fn!.prepare_raster = real;
		await vi.advanceTimersByTimeAsync(200);

		expect(real).not.toHaveBeenCalled();
	});

	test('the stub does not invoke itself, so an abandoned poll cannot self-extend past its deadline', async () => {
		vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] });
		installPrepareRasterStub();

		getInstalled()(['left'], [45.5, -73.6]);

		// Well past the original deadline. If the identity check ever treated
		// the stub's own reference as "the real implementation", forwarding
		// to itself would restart poll() with a fresh deadline each time, and
		// a registration this late would still be reachable.
		await vi.advanceTimersByTimeAsync(PREPARE_RASTER_STUB_POLL_DEADLINE_MS * 3);

		const real = vi.fn() as unknown as Prepare_Raster;
		window.$!.fn!.prepare_raster = real;
		await vi.advanceTimersByTimeAsync(200);

		expect(real).not.toHaveBeenCalled();
	});
});
