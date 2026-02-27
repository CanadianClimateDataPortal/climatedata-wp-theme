import {
	useEffect,
	useRef,
} from 'react';
import { default as L } from 'leaflet';
import { GeoJSON, useMap } from 'react-leaflet';

import type { Feature } from 'geojson';

import { useShapefile } from '@/hooks/use-shapefile';
import type { SelectedRegion } from '@/lib/shapefile';
import { isLayerWithFeature } from '@/types/validations';

import {
	SHAPE_PATH_STYLE_DEFAULT,
	SHAPE_PATH_STYLE_HOVER,
	SHAPE_PATH_STYLE_SELECTED,
	type ShapePathStyleResolverFn,
	type ShapePathStyleResolverInnerStateMap,
} from '@/components/map-layers/interactive-layer-styles';

const getStatePathOptions: ShapePathStyleResolverFn = (state) => {
	const map: ShapePathStyleResolverInnerStateMap = {
		default: SHAPE_PATH_STYLE_DEFAULT,
		hover: SHAPE_PATH_STYLE_HOVER,
		selected: SHAPE_PATH_STYLE_SELECTED,
	}
	return map[state] ?? SHAPE_PATH_STYLE_DEFAULT;
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

	const style = getStatePathOptions('default');

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
