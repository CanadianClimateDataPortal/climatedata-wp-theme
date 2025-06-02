import {
	useEffect,
	useRef,
	useMemo,
	useCallback,
	useImperativeHandle,
	forwardRef,
} from 'react';
import { useMap } from 'react-leaflet';

import L from 'leaflet';
import 'leaflet.pm';
import 'leaflet/dist/leaflet.css';
import 'leaflet.pm/dist/leaflet.pm.css';

import { useAppDispatch } from '@/app/hooks';
import {
	setCenter,
	setZoom,
} from '@/features/download/download-slice';
import { useClimateVariable } from '@/hooks/use-climate-variable';

/**
 * Component that allows to select a rectangle on the map and calculate the number of cells selected
 */
const SelectableRectangleGridLayer = forwardRef<{
	clearSelection: () => void;
}, {
	maxCellsAllowed?: number;
}>(({ maxCellsAllowed = 1000 }, ref) => {
	const map = useMap();
	const layerGroupRef = useRef<L.LayerGroup>(new L.LayerGroup());

	const { climateVariable, setSelectedRegion, resetSelectedRegion } = useClimateVariable();
	const dispatch = useAppDispatch();

	const gridResolutions = useMemo<Record<string, number>>(
			() => ({
			canadagrid: 0.08333333333333333,
			'canadagrid-m6': 0.08333333333333333,
			canadagrid1deg: 1,
			slrgrid: 0.1,
			'slrgrid-cmip6': 0.1,
			era5landgrid: 0.1,
		}),
		[]
	);

	const handleMoveEnd = useCallback(() => {
		dispatch(setZoom(map.getZoom()));
		dispatch(setCenter([map.getCenter().lat, map.getCenter().lng]));
	}, [map, dispatch]);

	const getSelectedShapeData = useCallback(
		(layer: L.Layer) => {
			const varGrid = climateVariable?.getGridType() ?? 'canadagrid';
			const geojson = (layer as L.Polygon).toGeoJSON() as GeoJSON.Feature;

			// these coordinates are an array of linear rings.. the first element at
			// index 0 represents the outer boundary (exterior ring) of the rectangle
			const coords = (geojson.geometry as GeoJSON.Polygon).coordinates[0];

			// coords are [lng, lat]
			const lats = coords.map((c: number[]) => c[1]);
			const lngs = coords.map((c: number[]) => c[0]);
			const minLat = Math.min(...lats);
			const maxLat = Math.max(...lats);
			const minLng = Math.min(...lngs);
			const maxLng = Math.max(...lngs);

			const latDiff = maxLat - minLat;
			const lngDiff = maxLng - minLng;
			const area = latDiff * lngDiff;
			const resolution = gridResolutions[varGrid] ?? 0.08333333333333333;

			return {
				cellCount: Math.round(area / resolution ** 2),
				bounds: [[minLat, minLng], [maxLat, maxLng]] as L.LatLngBoundsLiteral,
			};
		},
		[gridResolutions, climateVariable]
	);

	const onCreate = useCallback(
		(e: L.LeafletEvent & { layer: L.Layer }) => {
			const layer = e.layer;
			const { bounds, cellCount } = getSelectedShapeData(layer);

			if (cellCount > maxCellsAllowed) {
				map.removeLayer(layer);
				map.pm.enableDraw('Rectangle');
				return;
			}

			// clear previous shapes
			layerGroupRef.current.clearLayers();
			layerGroupRef.current.addLayer(layer);

			setSelectedRegion({ bounds, cellCount });

			// enable resizing
			layer.pm.enable();

			// disable drawing mode
			map.pm.disableDraw('Rectangle');

			// store last valid bounds
			let lastValidBounds = L.latLngBounds(bounds as L.LatLngTuple[]);

			const handleEdit = (editEvent: L.LeafletEvent & { layer: L.Layer }) => {
				const editedLayer = editEvent.target as L.Rectangle;
				const { bounds: newBounds, cellCount } = getSelectedShapeData(editedLayer);

				if (cellCount < maxCellsAllowed) {
					setSelectedRegion({ bounds: newBounds, cellCount });
					lastValidBounds = L.latLngBounds(newBounds as L.LatLngTuple[]);
				} else {
					editedLayer.setBounds(lastValidBounds);
					editedLayer.pm.disable();
					editedLayer.pm.enable();
				}
			};

			layer.on('pm:edit', handleEdit);
		},
		[map, getSelectedShapeData, setSelectedRegion]
	);

	// draw a rectangle if there are selected cells when the component mounts
	useEffect(() => {
		const bounds = climateVariable?.getSelectedRegion()?.bounds;
		if (bounds) {
			L.rectangle(bounds).addTo(layerGroupRef.current);
		}
		// disabling because we want this logic to run only once when the component mounts, and
		// including selection in the dependency array breaks the shape resizing feature
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!map) {
			return;
		}

		// enable drawing a rectangle
		map.pm.enableDraw('Rectangle');

		// adding events
		map.on('pm:create', onCreate);
		map.on('zoomend', handleMoveEnd);
		map.on('moveend', handleMoveEnd);

		map.addLayer(layerGroupRef.current);

		// making the layer group available to other hooks
		const layerGroup = layerGroupRef.current;

		return () => {
			map.pm.disableDraw('Rectangle');
			map.off('pm:create', onCreate);

			if (layerGroup) {
				map.removeLayer(layerGroup);
			}
		};
	}, [map, onCreate, handleMoveEnd]);

	// expose the clear selection method to the parent component
	useImperativeHandle(
		ref,
		() => ({
			clearSelection() {
				if (layerGroupRef.current) {
					layerGroupRef.current.clearLayers();
				}

				// re enable drawing a rectangle
				map.pm.enableDraw('Rectangle');

				// clear selection in redux
				resetSelectedRegion();
			},
		}),
		[map, dispatch]
	);

	return null;
});

export default SelectableRectangleGridLayer;
