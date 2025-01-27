import { useCallback } from "react";
import { useMap } from "react-leaflet";

import ZoomButtons from "@/components/ui/zoom-buttons";
import { DEFAULT_MAX_ZOOM, DEFAULT_MIN_ZOOM } from "@/lib/constants";

/**
 * ZoomControl Component
 *
 * This component adds buttons to zoom in and out of the map.
 *
 */
export default function ZoomControlLayer() {
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

  return (
    <ZoomButtons
      onZoomIn={handleZoomIn}
      onZoomOut={handleZoomOut}
    />
  );

}