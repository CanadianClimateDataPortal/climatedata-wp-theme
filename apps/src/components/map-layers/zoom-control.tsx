import { useCallback } from 'react';
import { useMap } from 'react-leaflet';

import ZoomButtons from '@/components/ui/zoom-buttons';
import { DEFAULT_MAX_ZOOM, DEFAULT_MIN_ZOOM } from '@/lib/constants';

/**
 * `ZoomControlLayer` — binds the `ZoomButtons` pair to the Leaflet map it is
 * rendered inside.
 *
 * It reads the current zoom from `useMap()` and steps it one level at a time,
 * clamped between `DEFAULT_MIN_ZOOM` and `DEFAULT_MAX_ZOOM`.
 * `ZoomButtons` in `components/ui/zoom-buttons.tsx` owns the markup.
 */
const ZoomControlLayer = (): React.ReactElement => {
	const map = useMap();

	const handleZoomIn = useCallback(() => {
		const currentZoom = map.getZoom();
		const newZoom = Math.min(currentZoom + 1, DEFAULT_MAX_ZOOM);

		map.setZoom(newZoom);
	}, [map]);

	const handleZoomOut = useCallback(() => {
		const currentZoom = map.getZoom();
		const newZoom = Math.max(currentZoom - 1, DEFAULT_MIN_ZOOM);

		map.setZoom(newZoom);
	}, [map]);

	return <ZoomButtons onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />;
}

ZoomControlLayer.displayName = 'ZoomControlLayer'; // Explicit string literal, or this name would be lost in production.

export default ZoomControlLayer;
