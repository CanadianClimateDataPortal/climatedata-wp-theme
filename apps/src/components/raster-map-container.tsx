import { useMemo } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';

import MapLegend from '@/components/map-layers/map-legend';
import VariableLayer from '@/components/map-layers/variable-layer';
import CustomPanesLayer from '@/components/map-layers/custom-panes';
import ZoomControl from '@/components/map-layers/zoom-control';
import MapEvents from '@/components/map-layers/map-events';
import SearchControl from '@/components/map-layers/search-control';
import InteractiveRegionsLayer from '@/components/map-layers/interactive-regions-layer';

import { useAppSelector } from '@/app/hooks';
import { useClimateVariable } from "@/hooks/use-climate-variable";
import {
	CANADA_CENTER,
	DEFAULT_ZOOM,
	DEFAULT_MIN_ZOOM,
	DEFAULT_MAX_ZOOM,
	GEOSERVER_BASE_URL,
} from '@/lib/constants';

/**
 * Renders a Leaflet map, including custom panes and tile layers.
 */
export default function RasterMapContainer({
	onMapReady,
	onUnmount,
}: {
	onMapReady: (map: L.Map) => void;
	onUnmount?: () => void;
}) {
	const {
		opacity: { labels: labelsOpacity },
	} = useAppSelector((state) => state.map);

	const { climateVariable } = useClimateVariable();

	const layerValue: string = useMemo(() => {
		let version;
		if (climateVariable) {
			version = climateVariable.getVersion() === 'cmip5' ? '' : climateVariable.getVersion();
		}

		const scenario = climateVariable?.getScenario();
		const threshold = climateVariable?.getThreshold();
		const frequency = climateVariable?.getFrequency() ?? '';

		let frequencyCode = '';

		if (frequency === 'ann') {
			frequencyCode = 'ys';
		} else if (['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].includes(frequency)) {
			frequencyCode = 'ms';
		} else if (['spring', 'summer', 'fall', 'winter'].includes(frequency)) {
			frequencyCode = 'qsdec';
		}

		const value = [
				version,
				threshold,
				frequencyCode,
				scenario,
				'p50',
				climateVariable?.getFrequency(),
				'30year',
			]
			.filter(Boolean)
			.join('-');

		return `CDC:${value}`;
	}, [climateVariable])

	return (
		<MapContainer
			center={CANADA_CENTER}
			zoomControl={false}
			zoom={DEFAULT_ZOOM}
			minZoom={DEFAULT_MIN_ZOOM}
			maxZoom={DEFAULT_MAX_ZOOM}
			scrollWheelZoom={true}
			className="z-10" // important to keep the map below other interactive elements
		>
			<MapEvents onMapReady={onMapReady} onUnmount={onUnmount} />
			<MapLegend url={`${GEOSERVER_BASE_URL}/geoserver/wms?service=WMS&version=1.1.0&request=GetLegendGraphic&format=application/json&layer=${layerValue}`} />
			<CustomPanesLayer />
			<VariableLayer layerValue={layerValue} />
			<ZoomControl />
			<SearchControl />

			<InteractiveRegionsLayer />

			<TileLayer
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			/>

			{/* Basemap TileLayer */}
			<TileLayer
				url="//cartodb-basemaps-{s}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}{r}.png"
				attribution=""
				subdomains="abcd"
				pane="basemap"
				maxZoom={DEFAULT_MAX_ZOOM}
			/>

			{/* Labels TileLayer */}
			<TileLayer
				url="//{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png"
				pane="labels"
				opacity={labelsOpacity}
			/>
		</MapContainer>
	);
}
