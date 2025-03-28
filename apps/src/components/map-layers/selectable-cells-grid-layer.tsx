import {
	useImperativeHandle,
	forwardRef,
	useEffect,
	useRef,
	useMemo,
	useCallback,
} from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.vectorgrid';

import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
	setSelection,
	setSelectionCount,
	setZoom,
	setCenter,
} from '@/features/download/download-slice';
import { CANADA_BOUNDS, DEFAULT_MAX_ZOOM } from '@/lib/constants';
import { GridCellProps } from '@/types/types';

/**
 * Component that allows to select cells on the map and tally the number of cells selected
 */
const SelectableCellsGridLayer = forwardRef<{
	clearSelection: () => void;
}>((_, ref) => {
	const map = useMap();
	const selection = useAppSelector((state) => state.download.selection);
	const dispatch = useAppDispatch();

	// @ts-expect-error: suppress leaflet typescript error
	const gridLayerRef = useRef<L.VectorGrid | null>(null);

	// TODO: this should not be a static value, because it needs to work also in other environments other than prod
	const geoserverUrl = '//dataclimatedata.crim.ca';
	const gridName = 'canadagrid';
	const tileLayerUrl = `${geoserverUrl}/geoserver/gwc/service/tms/1.0.0/CDC:${gridName}@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf`;

	const tileLayerStyles = useMemo(
		() => ({
			[gridName]: () => ({
				weight: 0.2,
				color: '#777',
				opacity: 0.6,
				fill: true,
				radius: 4,
				fillOpacity: 0,
			}),
		}),
		[gridName]
	);

	const selectedCellStyles = useMemo(
		() => ({
			color: '#f00',
			opacity: 1,
			weight: 1,
		}),
		[]
	);

	const hoverCellStyles = useMemo(
		() => ({
			color: '#444',
			fill: true,
			fillColor: '#fff',
			fillOpacity: 0.2,
			opacity: 1,
			weight: 1,
		}),
		[]
	);

	/**********************************************
	 * update styles of selected cells
	 **********************************************/
	useEffect(() => {
		if (!gridLayerRef.current) {
			return;
		}

		// now apply the selected cell styles
		selection.forEach((gid) => {
			gridLayerRef.current.setFeatureStyle(gid, selectedCellStyles);
		});
		// disabling because setting previously selected cells need the gridLayerRef dependency to work
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [gridLayerRef.current, selection, selectedCellStyles]);

	/**********************************************
	 * keep track of the map's zoom and center
	 * change events in case we get back to this step
	 **********************************************/
	const handleMoveEnd = useCallback(() => {
		dispatch(setZoom(map.getZoom()));
		dispatch(setCenter([map.getCenter().lat, map.getCenter().lng]));
	}, [map, dispatch]);

	/**********************************************
	 * grid cell event handlers
	 **********************************************/
	const handleOver = useCallback(
		(e: GridCellProps) => {
			const { gid } = e.layer.properties;
			gridLayerRef.current.setFeatureStyle(gid, hoverCellStyles);
		},
		[hoverCellStyles]
	);

	const handleOut = useCallback(
		(e: GridCellProps) => {
			const { gid } = e.layer.properties;
			if (!selection.includes(gid)) {
				gridLayerRef.current?.resetFeatureStyle(gid);
			}
		},
		[selection]
	);

	const handleClick = useCallback(
		(e: GridCellProps) => {
			const { gid } = e.layer.properties;

			// using a set to avoid duplicates and to make it easier to remove
			const selected = new Set(selection);

			if (selected.has(gid)) {
				selected.delete(gid);
				gridLayerRef.current.resetFeatureStyle(gid);
			} else {
				selected.add(gid);
				gridLayerRef.current.setFeatureStyle(gid, selectedCellStyles);
			}

			dispatch(setSelection(Array.from(selected)));
			dispatch(setSelectionCount(selected.size));
		},
		[selection, selectedCellStyles, dispatch]
	);

	// ensure refs always have the latest function versions
	const handleClickRef = useRef(handleClick);
	const handleOverRef = useRef(handleOver);
	const handleOutRef = useRef(handleOut);
	const handleMoveEndRef = useRef(handleMoveEnd);

	useEffect(() => {
		handleClickRef.current = handleClick;
		handleOverRef.current = handleOver;
		handleOutRef.current = handleOut;
		handleMoveEndRef.current = handleMoveEnd;
	}, [handleClick, handleOver, handleOut, handleMoveEnd]);

	/**********************************************
	 * initialize the grid layer
	 **********************************************/
	useEffect(() => {
		if (!map) {
			return;
		}

		const handleClick = (event: GridCellProps) =>
			handleClickRef.current(event);
		const handleOver = (event: GridCellProps) =>
			handleOverRef.current(event);
		const handleOut = (event: GridCellProps) => handleOutRef.current(event);
		const handleMoveEnd = () => handleMoveEndRef.current();

		// @ts-expect-error: suppress leaflet typescript error
		const gridLayer = L.vectorGrid.protobuf(tileLayerUrl, {
			interactive: true,
			maxNativeZoom: DEFAULT_MAX_ZOOM,
			getFeatureId: (feature: { properties: { gid: number } }) =>
				feature.properties.gid,
			vectorTileLayerStyles: tileLayerStyles,
			bounds: CANADA_BOUNDS,
			maxZoom: DEFAULT_MAX_ZOOM,
			minZoom: 7, // not using DEFAULT_MIN_ZOOM because then the cells would appear before zooming in and it slows the map rendering
			pane: 'grid',
		});

		map.on('zoomend', handleMoveEnd);
		map.on('moveend', handleMoveEnd);

		gridLayer.on('click', handleClick);

		// touch events for mobile devices
		if ('ontouchstart' in window) {
			gridLayer.on('touchstart', handleOver).on('touchend', handleOut);
		}
		// mouse events for desktop
		else {
			gridLayer.on('mouseover', handleOver).on('mouseout', handleOut);
		}

		gridLayer.addTo(map);

		// setting as a ref to avoid re-rendering and to have it available in other hooks
		gridLayerRef.current = gridLayer;

		return () => {
			if (gridLayerRef.current) {
				map.off('zoomend', handleMoveEnd);
				map.off('moveend', handleMoveEnd);
				map.removeLayer(gridLayerRef.current);
				gridLayerRef.current = null;
			}
		};
	}, [map, tileLayerStyles, tileLayerUrl]);

	// expose the clear selection method to the parent component
	useImperativeHandle(
		ref,
		() => ({
			clearSelection() {
				selection.forEach((gid) => {
					gridLayerRef.current?.resetFeatureStyle(gid);
				});

				dispatch(setSelection([]));
				dispatch(setSelectionCount(0));
			},
		}),
		[selection, dispatch]
	);

	return null;
});

export default SelectableCellsGridLayer;
