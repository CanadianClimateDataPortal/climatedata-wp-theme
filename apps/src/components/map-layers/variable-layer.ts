import { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import { useAppSelector } from '@/app/hooks';
import { CANADA_BOUNDS, GEOSERVER_BASE_URL, OWS_FORMAT } from '@/lib/constants';
import { useClimateVariable } from "@/hooks/use-climate-variable";
import { InteractiveRegionOption } from "@/types/climate-variable-interface";

/**
 * Variable layer Component
 *
 * @description
 * This component will be used to display the variable main layer on the map.
 *
 * @returns {null}
 */

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
	const [ startYear ] = useMemo(() => climateVariable?.getDateRange() ?? [], [climateVariable]);

	const layerRef = useRef<L.TileLayer.WMS | null>(null);

	useEffect(() => {
		if (layerRef.current) {
			map.removeLayer(layerRef.current);
		}

		const params = {
			format: OWS_FORMAT,
			transparent: true,
			tiled: true,
			version: climateVariable?.getVersion() === 'cmip6' ? '1.3.0' : '1.1.1',
			layers: layerValue,
			styles: climateVariable?.getLayerStyles(),
			TIME: parseInt(startYear) + '-01-00T00:00:00Z',
			opacity: 1,
			pane: pane,
			bounds: CANADA_BOUNDS,
		};

		// Create a new layer to override the previous one so changes on the layer can be seen on the map.
		if (climateVariable?.getInteractiveRegion() === InteractiveRegionOption.GRIDDED_DATA) {
			const newLayer = L.tileLayer.wms(
				GEOSERVER_BASE_URL + '/geoserver/ows?',
				params
			);
			newLayer.addTo(map);
			layerRef.current = newLayer;
		}
	}, [layerValue, map, climateVariable, pane, startYear]);

	useEffect(() => {
		if (layerRef.current) {
			layerRef.current.setOpacity(mapData);
		}
	}, [mapData]);
	return null;
}
