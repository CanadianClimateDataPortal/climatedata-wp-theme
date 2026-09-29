import type {
	Window_Fn_Prepare_Raster,
} from './types';

// Extend the global Window interface to allow simulation of jQuery-style API.
// This is used to expose a `prepare_raster` function on `$.fn`
declare global {
	interface Window {
		$?: {
			fn?: {
				prepare_raster?: Window_Fn_Prepare_Raster;
			};
		};
		URL_ENCODER_SALT: string;
		DATA_URL: string;
	}
}
