import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.vectorgrid';

import { useDownload } from '@/hooks/use-download';
import { useAppSelector } from '@/app/hooks';
import { DEFAULT_MAX_ZOOM } from '@/lib/constants';

/**
 * Mouse over event handler logic:
 * map.js line 843
 *
 * Grid layer for gridded_data sector:
 * cdc.js line 623
 */
const SelectableCellsGridLayer: React.FC<{
	selectedCells: Set<number>;
	onSelectCell: (updatedCells: Set<number>) => void;
}> = ({ selectedCells, onSelectCell }) => {
	const map = useMap();

	const { setField } = useDownload();

	// @ts-expect-error: suppress leaflet typescript error
	const gridLayerRef = useRef<L.VectorGrid | null>(null);

	const {
		variable,
		dataset,
		decade,
		frequency,
		interactiveRegion,
		emissionScenario,
	} = useAppSelector((state) => state.map);

	useEffect(() => {
		// TODO: this should not be a static value, because it needs to work also in other environments other than prod
		const geoserverUrl = '//dataclimatedata.crim.ca';

		const gridName = 'canadagrid';

		const selectedCellStyles = {
			fill: true,
			fillColor: '#fff',
			fillOpacity: 0.2,
		};

		// keep track of the map's zoom and center in case we get back to this step
		const handleMoveEnd = () => {
			setField('zoom', map.getZoom());
			setField('center', [map.getCenter().lat, map.getCenter().lng]);
		};

		map.on('zoomend', handleMoveEnd);
		map.on('moveend', handleMoveEnd);

		const handleClick = async (e: {
			latlng: L.LatLng;
			layer: { properties: { gid: number } };
		}) => {
			const { gid } = e.layer.properties;

			// create a new Set from the current selected cells to avoid mutating the state
			const newSelectedCells = new Set(selectedCells);

			if (newSelectedCells.has(gid)) {
				newSelectedCells.delete(gid);
				gridLayerRef.current?.resetFeatureStyle(gid);
			} else {
				newSelectedCells.add(gid);
				gridLayerRef.current?.setFeatureStyle(gid, selectedCellStyles);
			}

			//cCall onSelectCell with the updated Set
			onSelectCell(newSelectedCells);
		};

		const tileLayerUrl = `${geoserverUrl}/geoserver/gwc/service/tms/1.0.0/CDC:${gridName}@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf`;

		// @ts-expect-error: suppress leaflet typescript error
		const gridLayer = L.vectorGrid.protobuf(tileLayerUrl, {
			interactive: true,
			maxNativeZoom: DEFAULT_MAX_ZOOM,
			getFeatureId: (feature: { properties: { gid: number } }) =>
				feature.properties.gid,
			vectorTileLayerStyles: {
				[gridName]: function () {
					return {
						weight: 0.1,
						color: '#fff',
						opacity: 1,
						fill: true,
						radius: 4,
						fillOpacity: 0,
					};
				},
			},
			bounds: L.latLngBounds(
				L.latLng(41, -141.1), // _southWest
				L.latLng(83.6, -49.9) // _northEast
			),
			maxZoom: DEFAULT_MAX_ZOOM,
			minZoom: 7, // not using DEFAULT_MIN_ZOOM because then the cells would appear before zooming in and it slows the map rendering
			pane: 'grid', // TODO: figure out how `pane` works in the map
		});

		gridLayerRef.current = gridLayer;

		gridLayer.on('click', handleClick);

		gridLayer.addTo(map);

		// apply styles to already selected cells when the grid loads
		selectedCells.forEach((gid) => {
			gridLayer.setFeatureStyle(gid, selectedCellStyles);
		});

		return () => {
			map.removeLayer(gridLayer);
		};
	}, [
		map,
		interactiveRegion,
		frequency,
		dataset,
		variable,
		decade,
		emissionScenario,
		selectedCells,
		setField,
		onSelectCell,
	]);

	return null;
};

export default SelectableCellsGridLayer;
