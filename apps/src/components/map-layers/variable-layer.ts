import { useCallback, useEffect, useRef } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import { useAppSelector } from '@/app/hooks';
import { CANADA_BOUNDS, DEFAULT_COLOUR_SCHEMES, GEOSERVER_BASE_URL, OWS_FORMAT } from '@/lib/constants';
import { useClimateVariable } from "@/hooks/use-climate-variable";
import {
	FrequencyType,
	InteractiveRegionOption,
} from "@/types/climate-variable-interface";

/**
 * Variable layer Component
 *
 * @description
 * This component will be used to display the variable main layer on the map.
 *
 * @returns {null}
 */

interface WMSParams {
	format: string;
	transparent: boolean;
	tiled: boolean;
	version: string;
	layers: string;
	styles: string | undefined;
	TIME: string;
	opacity: number;
	pane: string;
	bounds: L.LatLngBounds;
	sld_body?: string;
}

type ColourSchemeKey = keyof typeof DEFAULT_COLOUR_SCHEMES;

interface VariableLayerProps {
	layerValue: string;
}

export default function VariableLayer({ layerValue }: VariableLayerProps): null {
	const map = useMap();
	const {
		decade,
		pane,
		opacity: { mapData },
	} = useAppSelector((state) => state.map);

	const { climateVariable } = useClimateVariable();
	const dataValue = useAppSelector((state) => state.map.dataValue);

	const layerRef = useRef<L.TileLayer.WMS | null>(null);

	/**
	 * Generates an array of quantities used to configure color ramps, based on the provided climate variable's
	 * configuration and the specified data value.
	 */
	const generateRampQuantities = useCallback(() => {
		if (!climateVariable) {
			return;
		}

		const colourScheme = climateVariable.getColourScheme();
		if (!colourScheme) {
			return;
		}

		const { colours, type: schemeType } = DEFAULT_COLOUR_SCHEMES[colourScheme as ColourSchemeKey];
		if (!colours) {
			return;
		}

		const { thresholds, decimals } = climateVariable.getTemporalThresholdConfig() ?? {
			decimals: 1,
		};
		if (!thresholds) {
			return;
		}

		const threshold = climateVariable.getThreshold() ?? null;
		if (!threshold) {
			return;
		}

		const frequencies = thresholds[threshold];
		if (!frequencies) {
			return;
		}

		const frequency = climateVariable.getFrequency() === FrequencyType.ANNUAL ? 'ys' : (climateVariable.getFrequency() ?? 'ys');

		const frequencyConfig = frequencies[frequency];
		if (!frequencyConfig) {
			return;
		}

		const quantities = [];
		const useDelta = dataValue === 'delta';
		const { absolute, delta, unit } = frequencyConfig;
		const schemeLength = colours.length;

		let low = useDelta ? delta.low : absolute.low;
		let high = useDelta ? delta.high : absolute.high;

		if (schemeType === 'divergent') {
			high = Math.max(Math.abs(low), Math.abs(high));
			low = high * -1;

			if ((high - low) * 10**decimals < schemeLength) {
				// Workaround to avoid legend with repeated values for very low range variables
				low = -(schemeLength / 10**decimals / 2.0);
				high = schemeLength / 10**decimals / 2.0;
			}
		} else {
			if ((high - low) * 10**decimals < schemeLength) {
				// Workaround to avoid legend with repeated values for very low range variables
				high = low + schemeLength / 10**decimals;
			}
		}

		// Temperature raster data files are in Kelvin, but in °C in variable_data
		if (unit === 'K' && !useDelta) {
			low += 273.15;
			high += 273.15;
		}

		const step = (high - low) / schemeLength;
		let quantity;

		for (let i = 0; i < schemeLength - 1; i++) {
			quantity = low + i * step;
			quantities.push(quantity);
		}

		// We need a virtually high value for highest bucket
		quantities.push((high + 1) * (high + 1));

		return quantities;
	}, [climateVariable, dataValue])

	/**
	 * Generates an SLD (Styled Layer Descriptor) string based on the provided climate variable, color scheme,
	 * ramp quantities, and layer value.
	 */
	const generateSLD = useCallback(() => {
		if (!climateVariable) {
			return;
		}

		const colourMapType = climateVariable.getColourType();
		const colourScheme = climateVariable.getColourScheme();

		if (!colourScheme) {
			return;
		}

		if (!Object.prototype.hasOwnProperty.call(DEFAULT_COLOUR_SCHEMES, colourScheme as ColourSchemeKey)) {
			return;
		}
		const { colours } = DEFAULT_COLOUR_SCHEMES[colourScheme as ColourSchemeKey];

		const quantities = generateRampQuantities();
		if (!quantities) {
			return;
		}

		let sldBody = `<?xml version="1.0" encoding="UTF-8"?>
			<StyledLayerDescriptor version="1.0.0" xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc"
			xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
			xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd">
			<NamedLayer><Name>${layerValue}</Name><UserStyle><IsDefault>1</IsDefault><FeatureTypeStyle><Rule><RasterSymbolizer>
			<Opacity>1.0</Opacity><ColorMap type="${colourMapType}">`;

		for (let i = 0; i < colours.length; i++) {
			sldBody += `<ColorMapEntry color="${colours[i]}" quantity="${quantities[i]}"/>`;
		}

		sldBody +=
			'</ColorMap></RasterSymbolizer></Rule></FeatureTypeStyle></UserStyle></NamedLayer></StyledLayerDescriptor>';

		return sldBody;
	}, [climateVariable, generateRampQuantities, layerValue])

	useEffect(() => {
		if (layerRef.current) {
			map.removeLayer(layerRef.current);
		}

		const sld = generateSLD();

		const params: WMSParams = {
			format: OWS_FORMAT,
			transparent: true,
			tiled: true,
			version: climateVariable?.getVersion() === 'cmip6' ? '1.3.0' : '1.1.1',
			layers: layerValue,
			styles: climateVariable?.getLayerStyles(),
			TIME: parseInt(decade) + '-01-00T00:00:00Z',
			opacity: 1,
			pane: pane,
			bounds: CANADA_BOUNDS,
		};

		if (sld) {
			params.sld_body = sld;
		}

		// Create a new layer to override the previous one so changes on the layer can be seen on the map.
		if (climateVariable?.getInteractiveRegion() === InteractiveRegionOption.GRIDDED_DATA) {
			const newLayer = L.tileLayer.wms(
				GEOSERVER_BASE_URL + '/geoserver/ows?',
				params
			);
			newLayer.addTo(map);
			layerRef.current = newLayer;
		}
	}, [layerValue, map, climateVariable, decade, pane, generateSLD]);

	useEffect(() => {
		if (layerRef.current) {
			layerRef.current.setOpacity(mapData);
		}
	}, [mapData]);
	return null;
}
