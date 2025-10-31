import { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import { useAppSelector } from '@/app/hooks';
import SectionContext from '@/context/section-provider';
import { CANADA_BOUNDS, DEFAULT_COLOUR_SCHEMES, GEOSERVER_BASE_URL, OWS_FORMAT } from '@/lib/constants';
import { useClimateVariable } from '@/hooks/use-climate-variable';
import { ColourType, InteractiveRegionOption } from '@/types/climate-variable-interface';
import { WMSParams } from '@/types/types';
import { useColorMap } from '@/hooks/use-color-map';

type VariableLayerProps = {
	isComparisonMap?: boolean;
}

/**
 * Make sure that the highest quantity is a big enough number.
 *
 * The highest quantity must be big enough to cover values that could exceed
 * the normally highest value in the legend. If not, holes could appear on the
 * map.
 *
 * This function ensures that the last quantity is a "really large" value
 * compared to the previous one. If not, the last quantity is made much higher.
 *
 * @param quantities An ordered list of quantities.
 */
function ensureHighQuantitiesCovered(quantities: number[]) {
	const lastIndex = quantities.length - 1;
	const lastDiff = quantities[lastIndex] - quantities[lastIndex - 1];
	const secondLastDiff = quantities[lastIndex - 1] - quantities[lastIndex - 2];
	const minDiffRatio = 100;

	if (lastDiff / secondLastDiff < minDiffRatio) {
		quantities[lastIndex] += lastDiff * minDiffRatio;
	}
}

/**
 * Variable layer Component
 *
 * This component displays the variable main layer on the map.
 * It works with both standard and sea level visualization approaches.
 */
export default function VariableLayer(
	{ isComparisonMap = false }: VariableLayerProps
) {
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
		hasCustomColorScheme,
		colourMapType,
		layerStyles,
		interactiveRegion,
	} = useMemo(() => {
		const colourScheme = climateVariable?.getColourScheme();

		return {
			hasCustomColorScheme: colourScheme && colourScheme in DEFAULT_COLOUR_SCHEMES,
			colourMapType: climateVariable?.getColourType() ?? ColourType.CONTINUOUS,
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

		ensureHighQuantitiesCovered(quantities);

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
			version: '1.1.1',
			layers: layerValue,
			styles: layerStyles,
			opacity: 1,
			pane: pane,
			bounds: CANADA_BOUNDS,
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
		generateSLD,
		interactiveRegion,
		layerStyles,
		layerValue,
		map,
		pane,
		climateVariable,
		isComparisonMap,
		// Even though `mapData` (data opacity) is used in this useEffect, we don't want
		// to put it as a dependency here since any change to the data opacity by the user
		// would regenerate the layer. The useEffect below takes care of managing the opacity.
	]);

	useEffect(() => {
		if (layerRef.current) {
			layerRef.current.setOpacity(mapData);
		}
	}, [mapData]);

	return null;
}
