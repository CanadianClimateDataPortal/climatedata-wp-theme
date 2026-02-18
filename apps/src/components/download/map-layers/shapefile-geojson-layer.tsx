import { useEffect, useMemo } from 'react';
import { default as L, type PathOptions } from 'leaflet';
import { GeoJSON, useMap } from 'react-leaflet';

import { useShapefile } from '@/hooks/use-shapefile';

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

	if (!isDisplaying || !featureCollection) return null;

	return (
		<GeoJSON
			key={file?.name ?? 'empty'}
			data={featureCollection}
			pane={pane}
			style={style}
		/>
	);
}
