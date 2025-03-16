import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.vectorgrid';

import { useAppSelector } from '@/app/hooks';
import { fetchChoroValues } from '@/services/services';
import {
	DEFAULT_MAX_ZOOM,
	DEFAULT_MIN_ZOOM,
	GEOSERVER_BASE_URL,
	CANADA_BOUNDS,
	SCENARIO_NAMES,
} from '@/lib/constants';

const InteractiveRegionCensusLayer: React.FC = () => {
	const [layerData, setLayerData] = useState<Record<number, number> | null>(
		null
	);

	const map = useMap();

	// @ts-expect-error: suppress leaflet typescript error
	const layerInstanceRef = useRef<L.VectorGrid | null>(null);

	const {
		variable,
		dataset,
		decade,
		frequency,
		interactiveRegion,
		emissionScenario,
	} = useAppSelector((state) => state.map);

	// TODO: this seems to be generated from the legend data, but we will revisit after all regions are implemented
	const colorMap = useMemo(
		() => ({
			colours: [
				'#FFFFCC',
				'#FFF8BA',
				'#FFF4B2',
				'#FFEDA0',
				'#FFE58F',
				'#FEE187',
				'#FED976',
				'#FEC965',
				'#FEC25D',
				'#FEB24C',
				'#FEA346',
				'#FD9C42',
				'#FD8D3C',
				'#FD7435',
				'#FC6731',
				'#FC4E2A',
				'#F23924',
				'#ED2F22',
				'#E31A1C',
				'#D41020',
				'#CC0A22',
				'#BD0026',
				'#A50026',
				'#990026',
				'#800026',
			],
			quantities: [
				273, 275, 276, 278, 280, 281, 283, 285, 286, 288, 290, 291, 293,
				295, 296, 298, 300, 301, 303, 305, 306, 308, 310, 311, 313,
			],
			scheme_type: 'continuous',
		}),
		[]
	);

	// Function to interpolate between colors
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

	const getColor = useCallback(
		(value: number) => {
			if (!colorMap || !colorMap.quantities || !colorMap.colours) {
				return '#000';
			}

			const { colours, quantities, scheme_type } = colorMap;

			// Find where this value fits into the quantity array
			const index = quantities.findIndex((q) => value < q);

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
		[colorMap, interpolate]
	);

	const handleClick = async (e: { latlng: L.LatLng }) => {
		console.log('Area clicked!', e.latlng);
	};

	// TODO: implement this
	// const handleOver = (e: any) => {
	// 	let styleObj = {
	// 		weight: 1.5,
	// 		fill: true,
	// 		fillOpacity: 1
	// 	};
	// };

	// TODO: implement this
	// const handleOut = (e: any) => {
	// 	let styleObj = {
	// 		weight: 1.5,
	// 		color: '#fff',
	// 		fill: true,
	// 		opacity: 1,
	// 	};
	// };

	useEffect(() => {
		(async () => {
			const datasetKey = dataset as keyof typeof SCENARIO_NAMES;
			const emissionKey =
				emissionScenario as keyof (typeof SCENARIO_NAMES)[keyof typeof SCENARIO_NAMES];

			// TODO: replace with data from the API
			const rcp = SCENARIO_NAMES[datasetKey][emissionKey]
				.replace(/[\W_]+/g, '')
				.toLowerCase();

			try {
				setLayerData(
					await fetchChoroValues({
						variable,
						dataset,
						decade,
						frequency,
						interactiveRegion,
						emissionScenario: rcp,
						decimals: 1,
					})
				);
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
		if (!layerData) {
			return;
		}

		const tileLayerUrl = `${GEOSERVER_BASE_URL}/geoserver/gwc/service/tms/1.0.0/CDC:census/{z}/{x}/{-y}.pbf`;

		const gridOptions = {
			// @ts-expect-error: suppress leaflet typescript error
			rendererFactory: L.canvas.tile,
			interactive: true,
			getFeatureId: (f: { properties: { id: number } }) =>
				f.properties.id,
			pane: 'grid',
			maxNativeZoom: DEFAULT_MAX_ZOOM,
			bounds: CANADA_BOUNDS,
			maxZoom: DEFAULT_MAX_ZOOM,
			minZoom: DEFAULT_MIN_ZOOM,
			vectorTileLayerStyles: {
				census: (properties: { id: number }) => ({
					weight: 1,
					color: '#fff',
					fillColor: layerData[properties.id]
						? getColor(layerData[properties.id])
						: 'transparent',
					opacity: 0.5,
					fill: true,
					radius: 4,
					fillOpacity: 1,
				}),
			},
		};

		// @ts-expect-error: suppress leaflet typescript error
		const gridLayer = L.vectorGrid.protobuf(tileLayerUrl, gridOptions);

		gridLayer.on('click', handleClick);
		// gridLayer.on('mouseover', handleOver);
		// gridLayer.on('mouseout', handleOut);

		layerInstanceRef.current = gridLayer;
		gridLayer.addTo(map);

		return () => {
			if (layerInstanceRef.current) {
				map.removeLayer(layerInstanceRef.current);
				layerInstanceRef.current = null;
			}
		};
	}, [map, layerData, getColor]);

	return null;
};

export default InteractiveRegionCensusLayer;
