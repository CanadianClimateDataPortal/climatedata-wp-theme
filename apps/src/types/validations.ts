/**
 * Functions that validate types of elements. Contrary to assertions, these
 * functions return booleans.
 */

import { LayerWithFeature } from '@/types/types';
import L from 'leaflet';

/**
 * Validates if a layer is a LayerWithFeature.
 */
export const isLayerWithFeature = <F>(layer: L.Layer): layer is LayerWithFeature<F> => {
	return (
		layer instanceof L.Path &&
		typeof (layer as L.Path).setStyle === 'function' &&
		'feature' in (layer as object) &&
		(layer as { feature?: unknown }).feature != null
	);
}
