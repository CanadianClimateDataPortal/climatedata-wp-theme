import type {
	Prepare_Raster,
	PrepareRasterPostHttpPayload,
} from './types';
import type { PrepareRasterPostHttpPayloadDebugger } from './create-raster-debugger';

// Extend the global Window interface to allow simulation of jQuery-style API.
// This is used to expose a `prepare_raster` function on `$.fn`
declare global {
	interface Window {
		$?: {
			fn?: {
				prepare_raster?: Prepare_Raster;
			};
		};
		// This property is for flagging testing when we want to see what happens between
		// current person's web browser and passing data to the `/raster?url=` endpoint via cURL
		// It isn't intended to be used for storing state, but rather a temporary manual testing handle
		mapPrepareRasterPostHttpPayload?: PrepareRasterPostHttpPayload | null;
		// This is to keep track of places clicked IF we're in debugging mode above
		mapPrepareRasterPostHttpPayloadDebugger?: PrepareRasterPostHttpPayloadDebugger;
		URL_ENCODER_SALT: string;
		DATA_URL: string;
	}
}
