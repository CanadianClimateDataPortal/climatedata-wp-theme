import {
	useEffect,
	useRef,
} from 'react';
import { default as L } from 'leaflet';
import { GeoJSON, useMap } from 'react-leaflet';

import { useShapefile } from '@/hooks/use-shapefile';

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
	} = useShapefile();
	const map = useMap();

	const featureCollection = simplifiedGeometry?.featureCollection ?? null;
	const pane = map.getPane('custom_shapefile') ? 'custom_shapefile' : undefined;

	useEffect(() => {
		if (!featureCollection) return;

		const layer = L.geoJSON(featureCollection);
		const bounds = layer.getBounds();
		if (bounds.isValid()) {
			map.fitBounds(bounds, { padding: [20, 20] });
		}
	}, [featureCollection, map]);

	const stateName = 'default';
	const style = useMemo(
		() => getStatePathOptions(stateName),
		[stateName],
	)

	const selectedLayerRef = useRef<L.Path | null>(null);

	const click = (e: L.LeafletMouseEvent) => {
		const layer = e.propagatedFrom as L.Path;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const feature = (layer as any).feature;

		const shape = displayableShapes?.shapes.find(s => s.feature === feature);
		if (!shape) return;

		// Guard: already selected?
		if (layer === selectedLayerRef.current) return;

		// Reset previous selection style
		selectedLayerRef.current?.setStyle(getStatePathOptions('default'));

		// Apply selected style
		layer.setStyle(getStatePathOptions('selected'));

		// Track selected layer
		selectedLayerRef.current = layer;

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
			eventHandlers={{ click, mouseover, mouseout }}
		/>
	);
}
