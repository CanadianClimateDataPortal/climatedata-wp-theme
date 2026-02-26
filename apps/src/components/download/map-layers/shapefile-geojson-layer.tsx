import {
	useEffect,
	useMemo,
	useRef,
} from 'react';
import { default as L, type PathOptions } from 'leaflet';
import { GeoJSON, useMap } from 'react-leaflet';

import type { Feature } from 'geojson';

import { useShapefile } from '@/hooks/use-shapefile';
import type { SelectedRegion } from '@/lib/shapefile';
import { isLayerWithFeature } from '@/types/validations';

/**
 * Possible states a shape on a map can be
 */
type SelectableRegionState = 'default' | 'hover' | 'selected';

const getStatePathOptions = (
	state: SelectableRegionState,
): PathOptions => {
	/**
	 * Normal.
	 *
	 * Refer to {@link ../../map-layers/selectable-region-layer.tsx} at `tileLayerStyles`
	 */
	const normalState: PathOptions = {
		weight: 1,
		color: '#999',
		fillColor: 'transparent',
		opacity: 0.5,
		fill: true,
		fillOpacity: 1
	};

	/**
	 * When mouse hover.
	 *
	 * Refer to {@link ../../map-layers/selectable-cells-grid-layer.tsx} at `hoverCellStyles`
	 */
	const hover: PathOptions = {
		color: '#444',
		fill: true,
		fillColor: '#fff',
		fillOpacity: 0.2,
		opacity: 1,
		weight: 1,
	};

	/**
	 * When Selected.
	 *
	 * Refer to {@link ../../map-layers/selectable-cells-grid-layer.tsx} at `selectedCellStyles`
	 */
	const selected: PathOptions = {
		color: '#f00', // in other words; red
		fill: false,
		opacity: 1,
		weight: 1,
	};

	const states = {
		default: normalState,
		hover,
		selected,
	};

	return typeof state === 'string' && state in states
		? states[state]
		: normalState;
};


/**
 * Renders simplified GeoJSON polygons on the Leaflet map when the
 * shapefile state machine reaches the `displaying` state.
 *
 * Fits the map bounds to the data on mount / data change.
 * Uses the `custom_shapefile` pane (z-800) for z-ordering.
 *
 * Must be rendered inside both a `<MapContainer>` and a `<ShapefileProvider>`.
 */
export default function ShapefileGeoJsonLayer(): React.ReactElement | null {
	const {
		file,
		isDisplaying,
		simplifiedGeometry,
		selectShape,
		displayableShapes,
		selectedRegion,
	} = useShapefile();
	const map = useMap();

	const featureCollection = simplifiedGeometry?.featureCollection ?? null;
	const pane = map.getPane('custom_shapefile') ? 'custom_shapefile' : undefined;

	const selectedLayerRef = useRef<L.Path | null>(null);
	const layerMapRef = useRef<Map<string, L.Path>>(new Map());

	useEffect(() => {
		if (!featureCollection) return;

		const layer = L.geoJSON(featureCollection);
		const bounds = layer.getBounds();
		if (bounds.isValid()) {
			map.fitBounds(bounds, { padding: [20, 20] });
		}
	}, [featureCollection, map]);

	/**
	 * Populates the reverse index (shape ID → Leaflet layer) when GeoJSON
	 * layers are created. Called once per feature at mount time by <GeoJSON>.
	 * On new file upload, the key prop changes, <GeoJSON> remounts, and
	 * this ref is recreated fresh with the new component instance.
	 */
	const onEachFeature = (
		_feature: Feature,
		layer: L.Layer,
	) => {
		if (!isLayerWithFeature<SelectedRegion['feature']>(layer)) return;

		const shape = displayableShapes?.shapes.find(s => s.feature === layer.feature);
		if (!shape) return;

		layerMapRef.current.set(shape.id, layer);
	};

	/**
	 * When the selected region changes, update the style of the selected region
	 * and of the previously selected region.
	 * Uses layerMapRef for O(1) lookup by shape ID instead of iterating all map layers.
	 */
	useEffect(() => {
		let regionLayer: L.Path | null = null;

		if (selectedRegion) {
			regionLayer = layerMapRef.current.get(selectedRegion.id) ?? null;

			if (!regionLayer || regionLayer === selectedLayerRef.current) {
				return;
			}

			// Apply "selected" style
			regionLayer.setStyle(getStatePathOptions('selected'));
		}

		// Reset the style of the previously selected region
		selectedLayerRef.current?.setStyle(getStatePathOptions('default'));

		// Track the selected layer (can be null: when the file changes, no region is selected yet)
		selectedLayerRef.current = regionLayer;
	}, [selectedRegion, featureCollection]);

	const stateName = 'default';
	const style = useMemo(
		() => getStatePathOptions(stateName),
		[stateName],
	)

	const click = (e: L.LeafletMouseEvent) => {
		const layer = e.propagatedFrom as L.Path;

		if (!layer || !isLayerWithFeature<SelectedRegion['feature']>(layer)) return;

		const feature = layer.feature;
		const shape = displayableShapes?.shapes.find(s => s.feature === feature);
		if (!shape) return;

		// Signal intent to hook (hook owns selection policy)
		selectShape(shape);
	};

	const mouseover = (e: L.LeafletMouseEvent) => {
		const layer = e.propagatedFrom as L.Path;
		if (layer === selectedLayerRef.current) return;
		layer.setStyle(getStatePathOptions('hover'));
	};

	const mouseout = (e: L.LeafletMouseEvent) => {
		const layer = e.propagatedFrom as L.Path;
		if (layer === selectedLayerRef.current) return;
		layer.setStyle(getStatePathOptions('default'));
	};

	if (!isDisplaying || !featureCollection) return null;

	return (
		<GeoJSON
			key={file?.name ?? 'empty'}
			data={featureCollection}
			pane={pane}
			style={style}
			onEachFeature={onEachFeature}
			eventHandlers={{ click, mouseover, mouseout }}
		/>
	);
}
