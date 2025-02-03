import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { GeoJSON } from 'geojson';

import L from 'leaflet';
import 'leaflet.pm';
import 'leaflet/dist/leaflet.css';
import 'leaflet.pm/dist/leaflet.pm.css';

/**
 * Component that adds geometry drawing controls to the map.
 */
export default function GeometryControls({
	onAreaSelected,
}: {
	/**
	 * Callback triggered when an area is selected.
	 * @param geoJson The GeoJSON representation of the drawn area.
	 */
	onAreaSelected?: (geoJson: GeoJSON) => void;
}): null {
	const map = useMap();

	const ref = useRef<L.LayerGroup>(new L.LayerGroup());

	useEffect(() => {
		if (!map) {
			return;
		}

		// Add Leaflet.pm controls
		// @ts-expect-error: suppress typescript error
		map.pm.addControls({
			position: 'topright',
			drawMarker: false,
			drawPolyline: false,
			drawCircleMarker: false,
		});

		// Add a layer group to store drawn shapes
		map.addLayer(ref.current);

		// Listen for shape creation
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
			// @ts-expect-error: suppress typescript error
			map.pm.removeControls();
		};
	}, [map, onAreaSelected]);

	return null;
}
