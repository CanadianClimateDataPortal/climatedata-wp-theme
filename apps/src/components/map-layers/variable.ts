import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import { useAppSelector } from '@/app/hooks';
import { CANADA_BOUNDS, GEOSERVER_BASE_URL, OWS_FORMAT } from '@/lib/constants';
/**
 * Variable layer Component
 *
 * @description
 * This component will be used to display the variable main layer on the map.
 *
 * @returns {null}
 */

export default function VariableLayer(): null {
	const map = useMap();
	const {
		frequency,
		dataset,
		decade,
		pane,
		opacity: { mapData },
	} = useAppSelector((state) => state.map);
	const layerRef = useRef<L.TileLayer.WMS | null>(null);

	useEffect(() => {
		if (layerRef.current) {
			map.removeLayer(layerRef.current);
		}
		const isAnnual = frequency === 'ann';
		// TODO: this needs to be generated using information from the map/config slice.
		// TODO: we need to figure it out how to do this, I think the
		// function plugin.maps.get_layer_name is the key for this.
		// TODO: important note: this is just a temporary solution.
		const layerName = `CDC:cmip6-tx_max-${isAnnual ? 'ys' : 'ms'}-ssp585-p50-${frequency}-30year`;

		const params = {
			format: OWS_FORMAT,
			transparent: true,
			tiled: true,
			version: dataset == 'cmip6' ? '1.3.0' : '1.1.1',
			layers: layerName,
			TIME: parseInt(decade) + '-01-00T00:00:00Z',
			opacity: 1,
			pane: pane,
			bounds: CANADA_BOUNDS,
		};

		// Create a new layer to override the previous one so changes on the layer can be seen on the map.
		const newLayer = L.tileLayer.wms(
			GEOSERVER_BASE_URL + '/geoserver/ows?',
			params
		);
		newLayer.addTo(map);
		layerRef.current = newLayer;
	}, [map, frequency, dataset, decade, pane]);

	useEffect(() => {
		if (layerRef.current) {
			layerRef.current.setOpacity(mapData);
		}
	}, [mapData]);
	return null;
}
