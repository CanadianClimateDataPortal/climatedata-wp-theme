import type {
	Prepare_Raster,
} from './types';

// Extend the global Window interface to allow simulation of jQuery-style API.
// This is used to expose a `prepare_raster` function on `$.fn`
declare global {
	interface Window {
		$?: {
			fn?: {
				prepare_raster?: Prepare_Raster;
			};
		};
		URL_ENCODER_SALT: string;
		DATA_URL: string;
	}
}
