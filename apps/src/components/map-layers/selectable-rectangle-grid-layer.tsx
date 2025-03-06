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

import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
	setCenter,
	setSelection,
	setSelectionCount,
	setZoom,
} from '@/features/download/download-slice';

/**
 * Component that allows to select a rectangle on the map and calculate the number of cells selected
 */
const SelectableRectangleGridLayer = forwardRef<{
	clearSelection: () => void;
}>((_, ref) => {
	const map = useMap();
	const layerGroupRef = useRef<L.LayerGroup>(new L.LayerGroup());

	const selection = useAppSelector((state) => state.download.selection);
	const dispatch = useAppDispatch();

	const gridResolutions = useMemo(
		() => ({
			canadagrid: 0.08333333333333333,
			canadagrid1deg: 1,
			slrgrid: 0.1,
			era5landgrid: 0.1,
		}),
		[]
	);

	const handleMoveEnd = useCallback(() => {
		dispatch(setZoom(map.getZoom()));
		dispatch(setCenter([map.getCenter().lat, map.getCenter().lng]));
	}, [map, dispatch]);

	const updateCellCount = useCallback(
		(layer: L.Layer) => {
			const varGrid = 'canadagrid';
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
			const totalCells = Math.round(area / gridResolutions[varGrid] ** 2);

			dispatch(setSelection([minLat, minLng, maxLat, maxLng]));
			dispatch(setSelectionCount(totalCells));
		},
		[gridResolutions, dispatch]
	);

	const onCreate = useCallback(
		(e: L.LeafletEvent & { layer: L.Layer }) => {
			// clear previous shapes
			layerGroupRef.current.clearLayers();
			layerGroupRef.current.addLayer(e.layer);

			// calculate initial cell count
			updateCellCount(e.layer);

			// enable resizing
			e.layer.pm.enable();

			// disable drawing mode
			map.pm.disableDraw('Rectangle');

			// listen for rectangle edits to recalculate
			e.layer.on(
				'pm:edit',
				(editEvent: L.LeafletEvent & { layer: L.Layer }) => {
					updateCellCount(editEvent.target as L.Layer);
				}
			);
		},
		[map, updateCellCount]
	);

	// draw a rectangle if there are selected cells when the component mounts
	useEffect(() => {
		if (selection.length > 0) {
			const bounds: L.LatLngBoundsExpression = [
				[selection[0], selection[1]], // southwest corner [minLat, minLng]
				[selection[2], selection[3]], // northeast corner [maxLat, maxLng]
			];

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
				dispatch(setSelection([]));
				dispatch(setSelectionCount(0));
			},
		}),
		[map, dispatch]
	);

	return null;
});

export default SelectableRectangleGridLayer;
