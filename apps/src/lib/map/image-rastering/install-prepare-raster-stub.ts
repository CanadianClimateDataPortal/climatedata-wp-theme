import type { Prepare_Raster } from './types';

/**
 * How long {@link installPrepareRasterStub}'s polling stub waits for the real
 * `$.fn.prepare_raster` before giving up quietly.
 *
 * Sized against the same external ceiling `MAP_SETTLE_TOTAL_BUDGET_MS` is
 * sized against — the service's 10s wait for `to-raster`, timeline in ./README.md.
 * This 5s and that 9s are separate give-up points rather than two shares of the
 * same 10s; a page that spends all of both has already lost the service.
 * What 5s buys is time for the bundle to parse, React to mount
 * `DownloadMapModal`, and its registration effect to run.
 * Measured directly on a warm load, that registration takes roughly 34ms — far
 * under this budget — so 5s is headroom against an untested cold load rather
 * than a figure tuned against an observed failure.
 * A page still unmounted 5s after this call was going to miss the service's
 * wait regardless, so giving up here costs nothing that was still available.
 */
export const PREPARE_RASTER_STUB_POLL_DEADLINE_MS = 5_000;

/**
 * How often {@link installPrepareRasterStub}'s polling stub checks for the
 * real `$.fn.prepare_raster`.
 *
 * `setTimeout` measures wall-clock passage, which is what this check needs:
 * `DownloadMapModal`'s registration effect runs once React commits it, a
 * moment defined by script execution, not by a paint.
 * 50ms bounds the check count against the deadline above to 100 at most,
 * while staying prompt once the real implementation lands.
 */
const PREPARE_RASTER_STUB_POLL_INTERVAL_MS = 50;

/**
 * Installs a polling stub at `window.$.fn.prepare_raster`.
 *
 * Intended never to throw.
 * The screenshot service reaches this stub through `driver.execute_script`, so an
 * exception escaping it arrives as a `JavascriptException` and kills the export
 * outright — a failure indistinguishable, from the service's side, from no
 * application being on the page at all.
 * A call this stub cannot forward is dropped silently instead: the deadline branch
 * returns without logging, rejecting, or invoking anything.
 *
 * Forwarding does not yet enforce that contract, and the gap is worth knowing
 * about.
 * A synchronous throw from the real implementation propagates straight out through
 * `current.call(fn, ...args)`, and because `prepare_raster` is async, a rejection
 * reached along this path is discarded rather than caught the way
 * `download-map-modal.tsx` catches it at its own call site.
 *
 * Called at module scope in `main-map.tsx`, before React renders anything, so
 * the stub is the first thing to occupy `window.$.fn.prepare_raster`.
 *
 * A call the stub receives is captured, then replayed once the real
 * implementation appears, within {@link PREPARE_RASTER_STUB_POLL_DEADLINE_MS}.
 * Readiness is judged by identity — comparing `window.$.fn.prepare_raster`
 * against the stub's own reference — so no separate boolean needs keeping in
 * sync.
 * The captured call forwards via `current.call(fn, ...args)` rather than
 * `current(...args)`, so the receiver matches how the service invokes it —
 * `$.fn.prepare_raster(...)`, receiver `$.fn` — because a bare call would
 * silently hand the real implementation `this === undefined` under strict
 * mode.
 *
 * The stub serves two situations, and the evidence behind them differs.
 * A call arriving BEFORE registration is defence in depth against a race that
 * is real in principle and unmeasured on a cold load: the real implementation
 * is registered inside `DownloadMapModal`'s registration effect
 * (`download-map-modal.tsx`), which cannot run before the bundle finishes
 * parsing and React mounts.
 * A call arriving AFTER that component unmounts still finds a working function,
 * and that is why its cleanup reinstalls this stub rather than clearing the key:
 * an absent key sends the service's call into `undefined`, warm load or cold.
 * That file registers the real implementation as
 * `window.$.fn.prepare_raster = prepare_raster` on mount, and calls this function
 * on unmount.
 *
 * `driver.execute_script` does not await anything.
 * The service's call returns as soon as this function returns, which can be
 * well before the forwarded call resolves — true whether that call reaches
 * the real implementation directly or through this stub's poll.
 * `signalRasterReady` adding the `to-raster` class remains the only
 * synchronisation the service has; a returned call means script execution
 * reached the end of this function, nothing about the work it started.
 *
 * @remark Where does this run?: In the user's browser, eagerly at module scope.
 */
export const installPrepareRasterStub = (): void => {
	window.$ = window.$ || {};
	window.$.fn = window.$.fn || {};
	const fn = window.$.fn;

	const stub: Prepare_Raster = (...args): void => {
		const expiresAt = performance.now() + PREPARE_RASTER_STUB_POLL_DEADLINE_MS;

		const poll = (): void => {
			const current = fn.prepare_raster;
			if (current && current !== stub) {
				current.call(fn, ...args);
				return;
			}
			if (performance.now() >= expiresAt) {
				return;
			}
			setTimeout(poll, PREPARE_RASTER_STUB_POLL_INTERVAL_MS);
		};

		poll();
	};

	fn.prepare_raster = stub;
};
