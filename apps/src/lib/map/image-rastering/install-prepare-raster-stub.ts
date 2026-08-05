import type { Prepare_Raster } from './types';

/**
 * How long {@link installPrepareRasterStub}'s polling stub waits for the real
 * `$.fn.prepare_raster` before giving up quietly.
 *
 * Sized against the same external ceiling {@link MAP_SETTLE_TOTAL_BUDGET_MS} is
 * sized against.
 * The screenshot service waits up to 10s total for `to-raster` to appear after
 * invoking `prepare_raster`, and `prepareRaster` itself can spend up to 9s of
 * that once it starts running.
 * 5s leaves roughly the other half of that 10s ceiling for the bundle to
 * parse, React to mount `DownloadMapModal`, and its registration effect to
 * run — a generous share, since production mounts land in low hundreds of
 * milliseconds.
 * A page that has not mounted `DownloadMapModal` within 5s of this call was
 * not going to finish `prepareRaster`'s own 9s budget before the service's
 * 10s wait expired either, so giving up here costs nothing the service was
 * going to grant anyway.
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
 * The screenshot service loads the map page, waits for `<body>` visibility,
 * sleeps one second, then evaluates `$.fn.prepare_raster(...)`.
 * `DownloadMapModal`'s registration effect (`download-map-modal.tsx`) is not
 * guaranteed to have run by then — that requires the bundle to finish
 * parsing and React to mount — so without a stub occupying the key first,
 * that call throws and the service's request fails outright.
 *
 * Call this as early as possible: at module scope in `main-map.tsx`, before
 * React renders anything, so the stub is the first thing to occupy
 * `window.$.fn.prepare_raster`.
 *
 * A call the stub receives is captured, then replayed once the real
 * implementation appears.
 * Readiness is judged by identity — comparing `window.$.fn.prepare_raster`
 * against the stub's own reference — not a boolean flag, so there is
 * nothing separate to keep in sync.
 * The captured call forwards via `current.call(fn, ...args)` rather than
 * `current(...args)`, so the receiver matches how the service invokes it —
 * `$.fn.prepare_raster(...)`, receiver `$.fn` — because a bare call would
 * silently hand the real implementation `this === undefined` under strict
 * mode.
 *
 * `download-map-modal.tsx` keeps registering the real implementation
 * exactly as written today: `window.$.fn.prepare_raster = prepare_raster`.
 * That file is unaware this stub exists.
 * Its unmount cleanup calls this function again in place of deleting the
 * key, so a call arriving after unmount is captured rather than crashing on
 * a missing function.
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
