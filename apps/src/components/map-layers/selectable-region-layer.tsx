import {
	useEffect,
	useRef,
	useMemo,
	useCallback,
	forwardRef,
	useImperativeHandle,
} from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.vectorgrid';

import { useAppDispatch } from '@/app/hooks';
import {
	setZoom,
	setCenter,
} from '@/features/download/download-slice';
import {CANADA_BOUNDS, DEFAULT_MAX_ZOOM, DEFAULT_MIN_ZOOM, GEOSERVER_BASE_URL} from '@/lib/constants';
import { MapFeatureProps } from '@/types/types';
import { getFeatureId } from '@/lib/utils';
import { useClimateVariable } from '@/hooks/use-climate-variable';
import { useLocale } from '@/hooks/use-locale';

/**
 * Component that allows to select a region on the map from the census layer
 */
const SelectableRegionLayer = forwardRef<{ clearSelection: () => void }, {}>((_, ref) => {
	const map = useMap();
	const { climateVariable, setSelectedPoints, removeSelectedPoint } = useClimateVariable();
	const dispatch = useAppDispatch();
	const { getLocalized } = useLocale();

	// @ts-expect-error: suppress leaflet typescript error
	const layerRef = useRef<L.VectorGrid | null>(null);

	const geoserverUrl = GEOSERVER_BASE_URL;
	const interactiveRegionName = climateVariable?.getInteractiveRegion() ?? '';
	const tileLayerUrl = `${geoserverUrl}/geoserver/gwc/service/tms/1.0.0/CDC:${interactiveRegionName}/{z}/{x}/{-y}.pbf`;

	const tileLayerStyles = useMemo(
		() => ({
			[interactiveRegionName]: () => ({
				weight: 1,
				color: '#999',
				fillColor: 'transparent',
				opacity: 0.5,
				fill: true,
				radius: 4,
				fillOpacity: 1
			}),
		}),
		[interactiveRegionName]
	);

	const selectedStyles = useMemo(
		() => ({
			color: "#f00",
			weight: 1.5,
			opacity: 1,
			fill: false
		}),
		[]
	);

	const hoverStyles = useMemo(
		() => ({
			weight: 1,
			fill: false,
			color: '#444',
			opacity: 1
		}),
		[]
	);

	const selectedIds = useMemo(() => {
		return Object.keys(climateVariable?.getSelectedPoints() ?? {}).map(Number);
	}, [climateVariable])

	/**********************************************
	 * update styles of selected region
	 **********************************************/
	useEffect(() => {
		if (!layerRef.current) {
			return;
		}

		// now apply the selected region styles
		selectedIds.forEach((featureId) => {
			layerRef.current.setFeatureStyle(featureId, selectedStyles);
		});

		// disabling because setting previously selected needs the layerRef dependency to work
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [layerRef.current, selectedIds, selectedStyles]);

	/**********************************************
	 * keep track of the map's zoom and center
	 * change events in case we get back to this step
	 **********************************************/
	const handleMoveEnd = useCallback(() => {
		dispatch(setZoom(map.getZoom()));
		dispatch(setCenter([map.getCenter().lat, map.getCenter().lng]));
	}, [map, dispatch]);

	/**********************************************
	 * region event handlers
	 **********************************************/
	const handleOver = useCallback(
		(e: MapFeatureProps) => {
			const featureId = getFeatureId(e.layer?.properties);
			if (featureId != null && !selectedIds.includes(featureId)) {
				layerRef.current.setFeatureStyle(featureId, hoverStyles);
			}
		},
		[hoverStyles, selectedIds]
	);

	const handleOut = useCallback(
		(e: MapFeatureProps) => {
			const featureId = getFeatureId(e.layer?.properties);
			if (featureId != null && !selectedIds.includes(featureId)) {
				layerRef.current?.resetFeatureStyle(featureId);
			}
		},
		[selectedIds]
	);

	const handleClick = useCallback(
		(e: MapFeatureProps) => {
			const featureId = getFeatureId(e.layer?.properties);

			if (featureId == null) {
				return;
			}

			// unselect the feature if it is already selected
			if (selectedIds.includes(featureId)) {
				layerRef.current?.resetFeatureStyle(featureId);
				removeSelectedPoint(String(featureId));
				return;
			}

			// reset all selected points
			selectedIds.forEach((gid) => {
				layerRef.current?.resetFeatureStyle(gid);
			});

			// add the feature to the selected points, including name from getLocalized
			const name = getLocalized(e.layer?.properties || {});
			layerRef.current.setFeatureStyle(featureId, selectedStyles);
			setSelectedPoints({
				[String(featureId)]: { ...e.latlng, name },
			});
		},
		[selectedStyles, selectedIds, setSelectedPoints, removeSelectedPoint, getLocalized]
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

		const handleClick = (event: MapFeatureProps) =>
			handleClickRef.current(event);
		const handleOver = (event: MapFeatureProps) =>
			handleOverRef.current(event);
		const handleOut = (event: MapFeatureProps) => handleOutRef.current(event);
		const handleMoveEnd = () => handleMoveEndRef.current();

		// @ts-expect-error: suppress leaflet typescript error
		const sectorLayer = L.vectorGrid.protobuf(tileLayerUrl, {
			// @ts-expect-error: suppress leaflet typescript error
			rendererFactory: L.canvas.tile,
			interactive: true,
			maxNativeZoom: DEFAULT_MAX_ZOOM,
			getFeatureId: (feature: { properties: { id: number } }) =>
				feature.properties.id,
			vectorTileLayerStyles: tileLayerStyles,
			bounds: CANADA_BOUNDS,
			maxZoom: DEFAULT_MAX_ZOOM,
			minZoom: DEFAULT_MIN_ZOOM,
			name: 'geojson',
			pane: 'grid',
		});


		map.on('zoomend', handleMoveEnd);
		map.on('moveend', handleMoveEnd);

		sectorLayer.on('click', handleClick);

		// touch events for mobile devices
		if ('ontouchstart' in window) {
			sectorLayer.on('touchstart', handleOver).on('touchend', handleOut);
		}
		// mouse events for desktop
		else {
			sectorLayer.on('mouseover', handleOver).on('mouseout', handleOut);
		}

		sectorLayer.addTo(map);

		// setting as a ref to avoid re-rendering and to have it available in other hooks
		layerRef.current = sectorLayer;

		return () => {
			if (layerRef.current) {
				map.off('zoomend', handleMoveEnd);
				map.off('moveend', handleMoveEnd);
				map.removeLayer(layerRef.current);
				layerRef.current = null;
			}
		};
	}, [map, tileLayerStyles, tileLayerUrl]);

	// expose the clear selection method to the parent component
	useImperativeHandle(
		ref,
		() => ({
			clearSelection() {
				selectedIds.forEach((featureId) => {
					layerRef.current?.resetFeatureStyle(featureId);
				});
				setSelectedPoints({});
			},
		}),
		[selectedIds, setSelectedPoints]
	);

	return null;
});

export default SelectableRegionLayer;
