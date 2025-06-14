/**
 * Component that adds interaction to the map depending on the selected region (gridded data, watershed, health, census).
 */
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.vectorgrid';

import { useAppSelector } from '@/app/hooks';
import { fetchChoroValues } from '@/services/services';
import {
	CANADA_BOUNDS,
	DEFAULT_MAX_ZOOM,
	DEFAULT_MIN_ZOOM,
	GEOSERVER_BASE_URL,
} from '@/lib/constants';
import { useClimateVariable } from "@/hooks/use-climate-variable";
import { InteractiveRegionOption } from "@/types/climate-variable-interface";
import { getDefaultFrequency } from "@/lib/utils";
import SectionContext from "@/context/section-provider";
import { useColorMap } from '@/hooks/use-color-map';

interface InteractiveRegionsLayerProps {
	scenario: string;
	onOver?: (e: { latlng: L.LatLng; layer: { properties: any } }, getFeatureColor: (featureId: number) => string) => void;
	onOut?: () => void;
	onClick?: (e: { latlng: L.LatLng; layer: { properties: any } }) => void;
	layerRef?: React.MutableRefObject<any>;
}

const InteractiveRegionsLayer: React.FC<InteractiveRegionsLayerProps> = ({ scenario, onOver, onOut, onClick, layerRef }) => {
	const [layerData, setLayerData] = useState<Record<number, number> | null>(null);
	const map = useMap();
	const section = useContext(SectionContext);

	const {
		opacity: { mapData },
	} = useAppSelector((state) => state.map);

	const { climateVariable } = useClimateVariable();
	const { colorMap, getColor } = useColorMap();

	const {
		threshold,
		datasetVersion,
		gridType,
		interactiveRegion,
		startYear
	} = useMemo(() => ({
		threshold: climateVariable?.getThreshold() ?? '',
		datasetVersion: climateVariable?.getVersion() ?? '',
		gridType: climateVariable?.getGridType() ?? 'canadagrid',
		interactiveRegion: climateVariable?.getInteractiveRegion() ?? InteractiveRegionOption.GRIDDED_DATA,
		startYear: climateVariable?.getDateRange()?.[0] ?? '2040',
	}), [climateVariable]);

	const getFeatureColor = useCallback(
		(featureId: number) => {
			if (!colorMap || !colorMap.quantities || !colorMap.colours) {
				return '#fff';
			}

			// Extract value based on interactive region type
			const value =
				interactiveRegion === InteractiveRegionOption.GRIDDED_DATA
					? featureId
					: (layerData?.[featureId] ?? 0);

			return getColor(value);
		},
		[interactiveRegion, layerData, colorMap, getColor]
	);

	const frequency = useMemo(() => {
		const frequencyConfig = climateVariable?.getFrequencyConfig();

		let frequency = climateVariable?.getFrequency() ?? '';

		if (!frequency && frequencyConfig) {
			frequency = getDefaultFrequency(frequencyConfig, section) ?? ''
		}

		return frequency;
	}, [climateVariable, section]);

	const tileLayerUrl = useMemo(() => {
		const regionPbfValues: Record<string, string> = {
			gridded_data: `CDC:${gridType}@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf`,
			watershed: 'CDC:watershed/{z}/{x}/{-y}.pbf',
			health: 'CDC:health/{z}/{x}/{-y}.pbf',
			census: 'CDC:census/{z}/{x}/{-y}.pbf',
		};
		const regionPbf =
			regionPbfValues[interactiveRegion] || regionPbfValues[InteractiveRegionOption.GRIDDED_DATA];

		return `${GEOSERVER_BASE_URL}/geoserver/gwc/service/tms/1.0.0/${regionPbf}`;
	}, [interactiveRegion, gridType]);

	const vectorTileLayerStyles = useMemo(() => {
		if (interactiveRegion === InteractiveRegionOption.GRIDDED_DATA) {
			return {
				[gridType]: (properties: { gid: number }) => ({
					weight: 0.5,
					color: '#fff',
					fillColor: properties.gid
						? getFeatureColor(properties.gid)
						: 'transparent',
					opacity: 0.6,
					fill: true,
					radius: 4,
					fillOpacity: 0,
				}),
			};
		}

		return {
			[interactiveRegion]: (properties: { id: number }) => ({
				weight: 1,
				color: layerData ? '#fff' : '#999',
				fillColor:
					properties.id && layerData?.[properties.id]
						? getFeatureColor(properties.id)
						: 'transparent',
				opacity: 0.5,
				fill: true,
				radius: 4,
				fillOpacity: 1,
			}),
		};
	}, [interactiveRegion, layerData, getFeatureColor, gridType]);

	// fetch layer data if needed
	useEffect(() => {
		(async () => {
			// no need to fetch anything for gridded data
			if (interactiveRegion === InteractiveRegionOption.GRIDDED_DATA) {
				return;
			}

			try {
				const data = await fetchChoroValues({
					variable: threshold,
					dataset: datasetVersion,
					decade: startYear,
					frequency,
					interactiveRegion,
					emissionScenario: scenario ?? '',
					decimals: 1,
				});

				setLayerData(data);
			} catch (error) {
				console.error('Error fetching layer data:', error);
			}
		})();
	}, [
		datasetVersion,
		frequency,
		interactiveRegion,
		scenario ?? '',
		startYear,
		threshold
	]);

	// Helper for click event
	useEffect(() => {
		// make sure all needed data is available
		if (
			!tileLayerUrl ||
			(interactiveRegion !== InteractiveRegionOption.GRIDDED_DATA && !layerData)
		) {
			return;
		}

		const layerOptions = {
			// @ts-expect-error: suppress leaflet typescript error
			rendererFactory: L.canvas.tile,
			interactive: true,
			getFeatureId: (f: { properties: { id?: number; gid?: number } }) =>
				f.properties.id ?? f.properties.gid,
			pane: 'grid',
			name: 'geojson',
			maxNativeZoom: DEFAULT_MAX_ZOOM,
			bounds: CANADA_BOUNDS,
			maxZoom: DEFAULT_MAX_ZOOM,
			minZoom: interactiveRegion === InteractiveRegionOption.GRIDDED_DATA ? 7 : DEFAULT_MIN_ZOOM,
			vectorTileLayerStyles,
		};

		// @ts-expect-error: suppress leaflet typescript error
		const layer = L.vectorGrid.protobuf(tileLayerUrl, layerOptions);
		layer.setOpacity(mapData);
		if (layerRef) {
			layerRef.current = layer;
		}

		if (onClick && onOver && onOut) {
			layer.on('click', onClick);

			// We need this to get the correct fill color on hover
			const onOverWithCallback = (e: any) => onOver(e, getFeatureColor);

			if ('ontouchstart' in window) {
				layer.on('touchstart', onOverWithCallback).on('touchend', onOut);
			} else {
				layer.on('mouseover', onOverWithCallback).on('mouseout', onOut);
			}
		}

		layer.addTo(map);

		// TODO: this was moved to the RasterMap component, but not sure if we should also clearLocations?
		// // clear all existing markers from the map
		// map.eachLayer(layer => {
		// 	if (layer instanceof L.Marker) {
		// 		map.removeLayer(layer);
		// 	}
		// });
		//
		// // clear recent locations
		// dispatch(clearRecentLocations());

		return () => {
			map.removeLayer(layer);

			if (layerRef) {
				layerRef.current = null;
			}
		};
	}, [
		map,
		interactiveRegion,
		layerData,
		tileLayerUrl,
		vectorTileLayerStyles,
		onClick,
		onOver,
		onOut,
		layerRef,
		colorMap,
		getColor
	]);

	useEffect(() => {
		if (layerRef?.current) {
			layerRef.current.setOpacity(mapData);
		}
	}, [mapData]);

	return null;
};

export default InteractiveRegionsLayer;