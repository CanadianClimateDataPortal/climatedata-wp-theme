/**
 * Component that adds interaction to the map depending on the selected region (gridded data, watershed, health, census).
 */
import React, { useCallback, useEffect, useMemo, useRef, useState, } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.vectorgrid';

import { useAppSelector } from '@/app/hooks';
import { useInteractiveMapEvents } from '@/hooks/use-interactive-map-events';
import { fetchChoroValues } from '@/services/services';
import {
	CANADA_BOUNDS,
	DEFAULT_MAX_ZOOM,
	DEFAULT_MIN_ZOOM,
	GEOSERVER_BASE_URL,
} from '@/lib/constants';
import { useClimateVariable } from "@/hooks/use-climate-variable";
import { ColourType, InteractiveRegionOption } from "@/types/climate-variable-interface";
import { generateColourScheme } from "@/lib/colour-scheme";

const InteractiveRegionsLayer: React.FC = () => {
	const [layerData, setLayerData] = useState<Record<number, number> | null>(
		null
	);

	// @ts-expect-error: suppress leaflet typescript error
	const layerRef = useRef<L.VectorGrid | null>(null);

	const map = useMap();

	const {
		decade,
		legendData,
		dataValue,
	} = useAppSelector((state) => state.map);

	const { climateVariable } = useClimateVariable();
	const gridType = climateVariable?.getGridType() ?? 'canadagrid';
	const interactiveRegion = climateVariable?.getInteractiveRegion() ?? InteractiveRegionOption.GRIDDED_DATA;

	// Convert legend data to a color map usable by the getColor method to generate colors for each feature
	const colorMap = useMemo(() => {
		if (!legendData || !legendData.Legend) {
			return null;
		}

		const legendColourMapEntries =
			legendData.Legend[0]?.rules?.[0]?.symbolizers?.[0]?.Raster?.colormap
				?.entries ?? [];

		if (climateVariable) {
			const customColourScheme = generateColourScheme(climateVariable, dataValue);
			if (customColourScheme) {
				return {
					colours: customColourScheme.colours,
					quantities: customColourScheme.quantities,
					schemeType: climateVariable.getColourType(),
				};
			}
		}

		// Fallback to default map colours.
		return {
			colours: legendColourMapEntries.map((entry) => entry.color),
			quantities: legendColourMapEntries.map((entry) => Number(entry.quantity)),
			schemeType: ColourType.CONTINUOUS,
		};
	}, [climateVariable, dataValue, legendData]);

	// Function to interpolate between colors
	// Taken from fw-child/resources/js/utilities.js interpolate function, but optimized for React
	const interpolate = useCallback(
		(color1: string, color2: string, ratio: number) => {
			ratio = Math.max(0, Math.min(1, ratio));

			const hexToRgb = (hex: string) =>
				hex
					.replace(/^#/, '')
					.match(/.{1,2}/g)!
					.map((x) => parseInt(x, 16));

			const rgbToHex = ([r, g, b]: number[]) =>
				`#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase()}`;

			const rgb1 = hexToRgb(color1);
			const rgb2 = hexToRgb(color2);

			const interpolatedRgb = rgb1.map((c, i) =>
				Math.round(c + (rgb2[i] - c) * ratio)
			);

			return rgbToHex(interpolatedRgb);
		},
		[]
	);

	// Function to get color based on feature ID
	// Taken from fw-child/resources/js/cdc.js get_color function, but optimized for React
	const getColor = useCallback(
		(featureId: number) => {
			if (!colorMap || !colorMap.quantities || !colorMap.colours) {
				return '#fff';
			}

			// Extract value based on interactive region type
			const value =
				interactiveRegion === InteractiveRegionOption.GRIDDED_DATA
					? featureId
					: (layerData?.[featureId] ?? 0);

			const { colours, quantities, schemeType } = colorMap;

			// More efficient binary search
			// Taken from fw-child/resources/js/utilities.js indexOfGT function
			const indexOfGT = (arr: number[], target: number): number => {
				let start = 0,
					end = arr.length - 1;
				let ans = -1;

				while (start <= end) {
					const mid = Math.floor((start + end) / 2);

					if (arr[mid] <= target) {
						start = mid + 1;
					} else {
						ans = mid;
						end = mid - 1;
					}
				}
				return ans;
			};

			const index = indexOfGT(quantities, value);

			// Use last color if `value` is greater than all
			if (index === -1) {
				return colours[colours.length - 1];
			}

			// Use first color if `value` is lowest
			if (index === 0) {
				return colours[0];
			}

			// For discrete type, return exact match
			if (schemeType === ColourType.DISCRETE) {
				return colours[index];
			}

			// For continuous type, interpolate between two colors
			const ratio =
				(value - quantities[index - 1]) /
				(quantities[index] - quantities[index - 1]);

			return interpolate(colours[index - 1], colours[index], ratio);
		},
		[interactiveRegion, layerData, colorMap, interpolate]
	);

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
						? getColor(properties.gid)
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
						? getColor(properties.id)
						: 'transparent',
				opacity: 0.5,
				fill: true,
				radius: 4,
				fillOpacity: 1,
			}),
		};
	}, [interactiveRegion, layerData, getColor, gridType]);

	const { handleClick, handleOver, handleOut } = useInteractiveMapEvents(
		layerRef,
		getColor
	);

	// fetch layer data if needed
	useEffect(() => {
		(async () => {
			const interactiveRegion = climateVariable?.getInteractiveRegion() ?? '';

			// no need to fetch anything for gridded data
			if (interactiveRegion === InteractiveRegionOption.GRIDDED_DATA) {
				return;
			}

			const frequency = climateVariable?.getFrequency() ?? '';

			try {
				const data = await fetchChoroValues({
					variable: climateVariable?.getThreshold() ?? '',
					dataset: climateVariable?.getVersion() ?? '',
					decade,
					frequency,
					interactiveRegion,
					emissionScenario: climateVariable?.getScenario() ?? '',
					decimals: 1,
				});

				setLayerData(data);
			} catch (error) {
				console.error('Error fetching layer data:', error);
			}
		})();
	}, [
		decade,
		climateVariable,
	]);

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
		layerRef.current = layer;

		layer.on('click', handleClick);

		if ('ontouchstart' in window) {
			layer.on('touchstart', handleOver).on('touchend', handleOut);
		} else {
			layer.on('mouseover', handleOver).on('mouseout', handleOut);
		}

		layer.addTo(map);

		return () => {
			map.removeLayer(layer);
			layerRef.current = null;
		};
	}, [
		map,
		interactiveRegion,
		layerData,
		tileLayerUrl,
		vectorTileLayerStyles,
		handleClick,
		handleOver,
		handleOut,
	]);

	return null;
};

export default InteractiveRegionsLayer;
