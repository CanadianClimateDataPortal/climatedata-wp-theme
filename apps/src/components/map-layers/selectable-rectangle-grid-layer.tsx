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
	setSelectedCells,
	setSelectedCellsCount,
	setZoom,
} from '@/features/download/download-slice';

/**
 * Component that allows to select a rectangle on the map.
 */
const SelectableRectangleGridLayer = forwardRef<{
	clearSelection: () => void;
}>((_, ref) => {
	const map = useMap();
	const layerGroupRef = useRef<L.LayerGroup>(new L.LayerGroup());

	const selectedCells = useAppSelector(
		(state) => state.download.selectedCells
	);
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

			dispatch(setSelectedCells([minLat, minLng, maxLat, maxLng]));
			dispatch(setSelectedCellsCount(totalCells));
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
			e.layer.pm.enable({
				allowSelfIntersection: false,
				draggable: true,
			});

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

	useEffect(() => {
		if (!map) {
			return;
		}

		map.on('zoomend', handleMoveEnd);
		map.on('moveend', handleMoveEnd);

		map.addLayer(layerGroupRef.current);

		// enable drawing a rectangle
		map.pm.enableDraw('Rectangle');

		map.on('pm:create', onCreate);

		if (selectedCells.length > 0) {
			const bounds: L.LatLngBoundsExpression = [
				[selectedCells[0], selectedCells[1]], // southwest corner [minLat, minLng]
				[selectedCells[2], selectedCells[3]], // northeast corner [maxLat, maxLng]
			];

			L.rectangle(bounds).addTo(layerGroupRef.current);
		}

		const layerGroup = layerGroupRef.current;

		return () => {
			if (layerGroup) {
				map.removeLayer(layerGroup);
			}

			map.pm.disableDraw('Rectangle');
			map.off('pm:create', onCreate);
		};
	}, [map, onCreate, selectedCells, handleMoveEnd]);

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

				dispatch(setSelectedCells([]));
				dispatch(setSelectedCellsCount(0));
			},
		}),
		[map, dispatch]
	);

	return null;
});

export default SelectableRectangleGridLayer;
