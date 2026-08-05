import type {
	Prepare_Raster,
	PrepareRasterPostHttpPayload,
} from './types';
import type { PrepareRasterPostHttpPayloadDebugger } from './create-raster-debugger';

// Declares the globals this namespace reads and writes on `window`.
//
// `$` here is a plain object this app creates itself, shaped to satisfy the
// `$.fn.prepare_raster(…)` expression the screenshot service evaluates. jQuery is
// absent from the map page, so nothing else defines or consumes it: the stub in
// `install-prepare-raster-stub.ts` creates it at module scope, and
// `download-map-modal.tsx` assigns the real implementation onto it.
declare global {
	interface Window {
		$?: {
			fn?: {
				prepare_raster?: Prepare_Raster;
			};
		};
		// A temporary manual-testing handle, assigned from the browser console. Holding any
		// defined value here — `null` included — turns debug mode on and lazy-loads the
		// debugger below. It carries the payload for the next request, so the same bytes
		// the Download button sends can be replayed by hand against the screenshot service.
		mapPrepareRasterPostHttpPayload?: PrepareRasterPostHttpPayload | null;
		// The lazy-loaded debugger, present once debug mode has been turned on above. Records
		// each place clicked so any of them can be replayed later by index.
		mapPrepareRasterPostHttpPayloadDebugger?: PrepareRasterPostHttpPayloadDebugger;
		URL_ENCODER_SALT: string;
		DATA_URL: string;
		// The `DATA_URL` to use when rastering through the same-origin raster proxy,
		// carrying no trailing slash. Often the same address as `DATA_URL` above, so its
		// presence rather than its value is what says the proxy is configured here.
		// Absent is a real, supported state — it means this deployment still relies on
		// the encoded-URL fallback.
		MAP_RASTER_PROXYPHP_DATA_URL?: string;
	}
}
