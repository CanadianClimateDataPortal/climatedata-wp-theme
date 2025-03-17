/**
 * Component that adds interaction to the map depending on the selected region (gridded data, watershed, health, census).
 */
import React, {
	useEffect,
	useRef,
	useState,
	useMemo,
	useCallback,
} from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.vectorgrid';

import { useAppSelector } from '@/app/hooks';
import { useInteractiveMapEvents } from '@/hooks/use-interactive-map-events';
import { fetchChoroValues } from '@/services/services';
import {
	DEFAULT_MAX_ZOOM,
	DEFAULT_MIN_ZOOM,
	GEOSERVER_BASE_URL,
	CANADA_BOUNDS,
	SCENARIO_NAMES,
} from '@/lib/constants';

const InteractiveRegionsLayer: React.FC = () => {
	const [layerData, setLayerData] = useState<Record<number, number> | null>(
		null
	);

	// @ts-expect-error: suppress leaflet typescript error
	const layerRef = useRef<L.VectorGrid | null>(null);

	const map = useMap();

	const {
		variable,
		dataset,
		decade,
		frequency,
		interactiveRegion,
		emissionScenario,
		legendData,
	} = useAppSelector((state) => state.map);

	// Convert legend data to a color map usable by the getColor method to generate colors for each feature
	const colorMap = useMemo(() => {
		if (!legendData || !legendData.Legend) {
			return null;
		}

		const colormapEntries =
			legendData.Legend[0]?.rules?.[0]?.symbolizers?.[0]?.Raster?.colormap
				?.entries ?? [];

		return {
			colours: colormapEntries.map((entry) => entry.color),
			quantities: colormapEntries.map((entry) => Number(entry.quantity)),
			scheme_type: 'continuous',
		};
	}, [legendData]);

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
				interactiveRegion === 'gridded_data'
					? featureId
					: (layerData?.[featureId] ?? 0);

			const { colours, quantities, scheme_type } = colorMap;

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
			if (scheme_type === 'discrete') {
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
			gridded_data: 'CDC:canadagrid@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf',
			watershed: 'CDC:watershed/{z}/{x}/{-y}.pbf',
			health: 'CDC:health/{z}/{x}/{-y}.pbf',
			census: 'CDC:census/{z}/{x}/{-y}.pbf',
		};
		const regionPbf =
			regionPbfValues[interactiveRegion] || regionPbfValues.gridded_data;

		return `${GEOSERVER_BASE_URL}/geoserver/gwc/service/tms/1.0.0/${regionPbf}`;
	}, [interactiveRegion]);

	const vectorTileLayerStyles = useMemo(() => {
		if (interactiveRegion === 'gridded_data') {
			return {
				canadagrid: (properties: { gid: number }) => ({
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
	}, [interactiveRegion, layerData, getColor]);

	const { handleClick, handleOver, handleOut } = useInteractiveMapEvents(
		layerRef,
		getColor
	);

	// fetch layer data if needed
	useEffect(() => {
		(async () => {
			// no need to fetch anything for gridded data
			if (interactiveRegion === 'gridded_data') {
				return;
			}

			try {
				const datasetKey = dataset as keyof typeof SCENARIO_NAMES;
				const emissionKey =
					emissionScenario as keyof (typeof SCENARIO_NAMES)[keyof typeof SCENARIO_NAMES];

				const rcp = SCENARIO_NAMES[datasetKey][emissionKey]
					.replace(/[\W_]+/g, '')
					.toLowerCase();

				const data = await fetchChoroValues({
					variable,
					dataset,
					decade,
					frequency,
					interactiveRegion,
					emissionScenario: rcp,
					decimals: 1,
				});
				setLayerData(data);
			} catch (error) {
				console.error('Error fetching layer data:', error);
			}
		})();
	}, [
		variable,
		dataset,
		decade,
		frequency,
		interactiveRegion,
		emissionScenario,
	]);

	useEffect(() => {
		// make sure all needed data is available
		if (
			!tileLayerUrl ||
			(interactiveRegion !== 'gridded_data' && !layerData)
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
			minZoom:
				interactiveRegion === 'gridded_data' ? 7 : DEFAULT_MIN_ZOOM,
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
