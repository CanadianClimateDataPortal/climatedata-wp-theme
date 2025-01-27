import React, { ReactElement, useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import { GeoJSON } from "geojson";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.pm/dist/leaflet.pm.css";
import "leaflet.pm";

/**
 * Component that adds geometry drawing controls to the map.
 */
export default function GeometryControls({ onAreaSelected }: {
  /**
   * Callback triggered when an area is selected.
   * @param geoJson The GeoJSON representation of the drawn area.
   */
  onAreaSelected?: (geoJson: GeoJSON) => void;
}): null {
  const map = useMap();

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const ref = useRef<L.LayerGroup>(new L.LayerGroup());

  useEffect(() => {
    if (! map) {
      return;
    }

    // Add Leaflet.pm controls
    map.pm.addControls({
      position: 'topright',
      drawMarker: false,
      drawPolyline: false,
      drawCircleMarker: false,
    });

    // Add a layer group to store drawn shapes
    map.addLayer(ref.current);

    // Listen for shape creation
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    map.on('pm:create', (e: L.LeafletEvent & { layer: L.Layer }) => {
      const shape = e.layer.toGeoJSON() as GeoJSON;

      // Clear previous shapes and add the new one
      ref.current.clearLayers();
      ref.current.addLayer(e.layer);

      if (onAreaSelected) {
        onAreaSelected(shape);
      }
    });

    return () => {
      map.pm.removeControls();
    };
  }, [map, onAreaSelected]);

  return null;
}