import { useEffect } from 'react';

import { useAppDispatch } from '@/app/hooks';
import { setRasterMode } from '@/features/map/map-slice';
import { readRasterPreviewRequest } from '@/lib/raster-mode';

/**
 * Enter raster mode at boot when the URL asks for the developer preview.
 *
 * Raster mode is normally entered by the server-side screenshot service, which
 * calls the `window.$.fn.prepare_raster()` hook installed by
 * `components/map-info/download-map-modal.tsx`. That path cannot be exercised
 * locally: the service loads the page itself, over the network, from an
 * allow-listed host. This hook is the other way in — load the page with
 * `?raster=1` in an ordinary browser and see what the downloadable image will
 * look like. It is refused on the production hosts, so a `?raster=1` that leaks
 * into a shared link there does nothing at all.
 *
 * **Why a mount-time one-shot rather than URL sync.** `raster` is deliberately
 * not a registered URL parameter, so whether it survives in the address bar is
 * decided by which of `useUrlSync`'s two debounced writers lands last — one
 * rebuilds the query string from scratch and drops it, the other preserves it.
 * Reading once on mount consumes the parameter before either can run, which is
 * correct whichever way that race falls. See `readRasterPreviewRequest`
 * (`lib/raster-mode`) for the full reasoning. This is the same boot-read shape
 * `DownloadProvider` (`context/download-provider.tsx`) uses to seed its starting
 * step from `?var`.
 *
 * Call it from the app root, ahead of `useUrlSync`, so this effect is queued
 * first.
 *
 * @example
 * ```tsx
 * function App() {
 *     useRasterMode();
 *     useUrlSync();
 *     // …
 * }
 * ```
 */
export const useRasterMode = (): void => {
	const dispatch = useAppDispatch();

	useEffect(() => {
		const { hostname, search } = window.location;
		const isPreviewRequested = readRasterPreviewRequest(search, hostname);
		if (!isPreviewRequested) {
			return;
		}
		// The only log this feature emits, and it sits inside the dispatching
		// branch on purpose: an ordinary page load stays silent, and so does a
		// refused production request. Seeing this line is the confirmation that
		// the page is deliberately rendering as the exported image.
		console.info('Raster mode: preview requested via ?raster=1');
		dispatch(setRasterMode(true));
	}, [dispatch]);
};
