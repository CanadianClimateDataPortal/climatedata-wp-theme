import {
	useEffect,
	useMemo,
	useRef,
} from 'react';
import { default as L, type PathOptions } from 'leaflet';
import { GeoJSON, useMap } from 'react-leaflet';

import { useShapefile } from '@/hooks/use-shapefile';
import type { SelectedRegion } from '@/lib/shapefile';
import{ isLayerWithFeature } from '@/types/validations';

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
 * Finds the map layer that corresponds to the given region. Returns null if
 * not found.
 *
 * @param region - Region to search for.
 * @param map - Map containing the layers to search.
 */
const findRegionLayer = (region: SelectedRegion, map: L.Map): L.Path | null => {
	let foundLayer: L.Path | null = null;

	map.eachLayer((layer: L.Layer) => {
		// Skip this iteration if the layer is already found
		if (foundLayer) {
			return;
		}

		if (!isLayerWithFeature<SelectedRegion['feature']>(layer)) {
			return;
		}

		if (region.feature === layer.feature) {
			foundLayer = layer;
		}
	});

	return foundLayer;
}

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

	useEffect(() => {
		if (!featureCollection) return;

		const layer = L.geoJSON(featureCollection);
		const bounds = layer.getBounds();
		if (bounds.isValid()) {
			map.fitBounds(bounds, { padding: [20, 20] });
		}
	}, [featureCollection, map]);

	/**
	 * When the selected region changes, update the style of the selected region
	 * and of the previously selected region.
	 */
	useEffect(() => {
		if (!pane || !selectedRegion) return;

		const regionLayer = findRegionLayer(selectedRegion, map);

		if (!regionLayer || regionLayer === selectedLayerRef.current) {
			return;
		}

		selectedLayerRef.current?.setStyle(getStatePathOptions('default'));

		// Apply selected style
		regionLayer.setStyle(getStatePathOptions('selected'));

		// Track selected layer
		selectedLayerRef.current = regionLayer;

	}, [selectedRegion, pane, map, featureCollection]);

	const stateName = 'default';
	const style = useMemo(
		() => getStatePathOptions(stateName),
		[stateName],
	)

	const selectedLayerRef = useRef<L.Path | null>(null);

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
			eventHandlers={{ click, mouseover, mouseout }}
		/>
	);
}
