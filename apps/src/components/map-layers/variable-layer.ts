import { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import { useAppSelector } from '@/app/hooks';
import SectionContext from '@/context/section-provider';
import { CANADA_BOUNDS, DEFAULT_COLOUR_SCHEMES, GEOSERVER_BASE_URL, OWS_FORMAT } from '@/lib/constants';
import { useClimateVariable } from "@/hooks/use-climate-variable";
import {
	ColourType,
	InteractiveRegionOption,
} from "@/types/climate-variable-interface";
import { VariableLayerProps, WMSParams } from '@/types/types';
import { useColorMap } from '@/hooks/use-color-map.ts';

/**
 * Variable layer Component
 *
 * This component displays the variable main layer on the map.
 * It works with both standard and sea level visualization approaches.
 *
 * @param {Object} props
 * @returns {null}
 */

export default function VariableLayer({
	isComparisonMap = false,
}: VariableLayerProps): null {
	const map = useMap();
	const {
		opacity: { mapData },
	} = useAppSelector((state) => state.map);

	const { climateVariable } = useClimateVariable();
	const { colorMap } = useColorMap();
	const scenario = isComparisonMap ?
		(climateVariable?.getScenarioCompareTo() ?? '') :
		(climateVariable?.getScenario() ?? '');

	const section = useContext(SectionContext);

	// Always use 'raster' pane - this works for both standard and sea level modes
	// as each mode creates a 'raster' pane with the appropriate z-index
	const pane = 'raster';

	const layerValue = useMemo(() => {
		return climateVariable?.getLayerValue(scenario, section) ?? '';
	}, [climateVariable, scenario, section]);

	const {
		startYear,
		hasCustomColorScheme,
		colourMapType,
		datasetVersion,
		layerStyles,
		interactiveRegion,
	} = useMemo(() => {
		const colourScheme = climateVariable?.getColourScheme();

		return {
			startYear: climateVariable?.getDateRange()?.[0] ?? '2040',
			hasCustomColorScheme: colourScheme && colourScheme in DEFAULT_COLOUR_SCHEMES,
			colourMapType: climateVariable?.getColourType() ?? ColourType.CONTINUOUS,
			datasetVersion: climateVariable?.getVersion(),
			layerStyles: climateVariable?.getLayerStyles(),
			interactiveRegion: climateVariable?.getInteractiveRegion(),
		};
	}, [climateVariable]);

	const layerRef = useRef<L.TileLayer.WMS | null>(null);

	/**
	 * Generates an SLD (Styled Layer Descriptor) string based on the provided climate variable, color scheme,
	 * ramp quantities, and layer value.
	 */
	const generateSLD = useCallback(() => {
		if (!colorMap || !hasCustomColorScheme) {
			return;
		}

		const colors = colorMap.colours;
		const quantities = colorMap.quantities;

		let sldBody = `<?xml version="1.0" encoding="UTF-8"?>
			<StyledLayerDescriptor version="1.0.0" xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc"
			xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
			xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd">
			<NamedLayer><Name>${layerValue}</Name><UserStyle><IsDefault>1</IsDefault><FeatureTypeStyle><Rule><RasterSymbolizer>
			<Opacity>1.0</Opacity><ColorMap type="${colourMapType}">`;

		for (let i = 0; i < colors.length; i++) {
			sldBody += `<ColorMapEntry color="${colors[i]}" quantity="${quantities[i]}"/>`;
		}
		sldBody +=
			'</ColorMap></RasterSymbolizer></Rule></FeatureTypeStyle></UserStyle></NamedLayer></StyledLayerDescriptor>';

		return sldBody;
	}, [
		colorMap,
		colourMapType,
		hasCustomColorScheme,
		layerValue,
	]);

	useEffect(() => {
		// Until we have loaded legend data, we don't show the layer
		if (hasCustomColorScheme && !colorMap) {
			return;
		}

		if (layerRef.current) {
			map.removeLayer(layerRef.current);
		}

		const sld = generateSLD();

		let params: WMSParams = {
			format: OWS_FORMAT,
			transparent: true,
			tiled: true,
			version: datasetVersion === 'cmip6' ? '1.3.0' : '1.1.1',
			layers: layerValue,
			styles: layerStyles,
			opacity: 1,
			pane: pane,
			bounds: CANADA_BOUNDS,
			TIME: parseInt(startYear) + '-01-00T00:00:00Z',
		};

		if (sld) {
			params.sld_body = sld;
		}

		if (climateVariable?.updateMapWMSParams) {
			params = climateVariable.updateMapWMSParams(params, !!isComparisonMap);
		}

		// Create a new layer to override the previous one so changes on the layer can be seen on the map.
		if (interactiveRegion === InteractiveRegionOption.GRIDDED_DATA) {
			const newLayer = L.tileLayer.wms(
				GEOSERVER_BASE_URL + '/geoserver/ows?',
				params
			);
			newLayer.addTo(map);
			newLayer.setOpacity(mapData);
			layerRef.current = newLayer;
		}
	}, [
		hasCustomColorScheme,
		colorMap,
		datasetVersion,
		generateSLD,
		interactiveRegion,
		layerStyles,
		layerValue,
		map,
		pane,
		startYear,
		climateVariable,
		isComparisonMap,
		mapData,
	]);

	useEffect(() => {
		if (layerRef.current) {
			layerRef.current.setOpacity(mapData);
		}
	}, [mapData]);

	return null;
}
