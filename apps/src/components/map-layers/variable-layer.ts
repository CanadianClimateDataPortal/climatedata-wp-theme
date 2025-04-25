import { useCallback, useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import { useAppSelector } from '@/app/hooks';
import { CANADA_BOUNDS, GEOSERVER_BASE_URL, OWS_FORMAT } from '@/lib/constants';
import { useClimateVariable } from "@/hooks/use-climate-variable";
import {
	ColourType,
	InteractiveRegionOption,
} from "@/types/climate-variable-interface";
import { generateColourScheme } from "@/lib/colour-scheme";

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

interface VariableLayerProps {
	layerValue: string;
}

export default function VariableLayer({ layerValue }: VariableLayerProps): null {
	const map = useMap();
	const {
		pane,
		opacity: { mapData },
	} = useAppSelector((state) => state.map);

	const { climateVariable } = useClimateVariable();

	const {
		startYear,
		colourScheme,
		colourMapType,
		datasetVersion,
		layerStyles,
		interactiveRegion
	} = useMemo(() => {
		return {
			startYear: climateVariable?.getDateRange()?.[0] ?? '2040',
			colourScheme: climateVariable ? generateColourScheme(climateVariable) : undefined,
			colourMapType: climateVariable?.getColourType() ?? ColourType.CONTINUOUS,
			datasetVersion: climateVariable?.getVersion(),
			layerStyles: climateVariable?.getLayerStyles(),
			interactiveRegion: climateVariable?.getInteractiveRegion()
		};
	}, [climateVariable]);

	const layerRef = useRef<L.TileLayer.WMS | null>(null);

	/**
	 * Generates an SLD (Styled Layer Descriptor) string based on the provided climate variable, color scheme,
	 * ramp quantities, and layer value.
	 */
	const generateSLD = useCallback(() => {
		if (!colourScheme) {
			return;
		}

		const { colours, quantities } = colourScheme;
		if (!quantities || !quantities.length) {
			return
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
	}, [
		colourMapType,
		colourScheme,
		layerValue
	])

	useEffect(() => {
		if (layerRef.current) {
			map.removeLayer(layerRef.current);
		}

		const sld = generateSLD();

		const params: WMSParams = {
			format: OWS_FORMAT,
			transparent: true,
			tiled: true,
			version: datasetVersion === 'cmip6' ? '1.3.0' : '1.1.1',
			layers: layerValue,
			styles: layerStyles,
			TIME: parseInt(startYear) + '-01-00T00:00:00Z',
			opacity: 1,
			pane: pane,
			bounds: CANADA_BOUNDS,
		};

		if (sld) {
			params.sld_body = sld;
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
		datasetVersion,
		generateSLD,
		interactiveRegion,
		layerStyles,
		layerValue,
		map,
		mapData,
		pane,
		startYear
	]);

	useEffect(() => {
		if (layerRef.current) {
			layerRef.current.setOpacity(mapData);
		}
	}, [mapData]);
	return null;
}
