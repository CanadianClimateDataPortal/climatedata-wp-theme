import { useMemo } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';

import MapLegend from '@/components/map-layers/map-legend';
import VariableLayer from '@/components/map-layers/variable';
import CustomPanesLayer from '@/components/map-layers/custom-panes';
import InteractiveRegionsLayer from '@/components/map-layers/interactive-regions';
import ZoomControl from '@/components/map-layers/zoom-control';
import MapEvents from '@/components/map-layers/map-events';
import SearchControl from '@/components/map-layers/search-control';
import CellsGridLayer from '@/components/map-layers/cells-grid-layer';

import { useAppSelector } from '@/app/hooks';
import { DatasetKey, EmissionScenarioKey } from '@/types/types';
import {
	CANADA_CENTER,
	DEFAULT_ZOOM,
	DEFAULT_MIN_ZOOM,
	DEFAULT_MAX_ZOOM,
	DATASETS,
	SCENARIO_NAMES,
	GEOSERVER_BASE_URL,
} from '@/lib/constants';

/**
 * Renders a Leaflet map, including custom panes and tile layers.
 */
export default function Map({
	onMapReady,
	onUnmount,
}: {
	onMapReady: (map: L.Map) => void;
	onUnmount?: () => void;
}) {
	const {
		dataset,
		variable,
		frequency,
		emissionScenario,
		opacity: { labels: labelsOpacity },
		interactiveRegion,
	} = useAppSelector((state) => state.map);

	// construct the URL for the map legend to get its data
	const mapLegendUrl = useMemo(() => {
		const datasetKey = dataset as DatasetKey;
		const emissionScenarioKey = emissionScenario as EmissionScenarioKey;

		const datasetPrefix = DATASETS[datasetKey].layer_prefix ?? '';
		const scenarioName = SCENARIO_NAMES[datasetKey][emissionScenarioKey]
			.replace(/[\W_]+/g, '')
			.toLowerCase();

		if (!datasetPrefix || !scenarioName) {
			return '';
		}

		const layerName = [
			`CDC:${datasetPrefix}${variable}`,
			frequency === 'ann' ? 'ys' : 'ms',
			scenarioName.replace(/[\W_]+/g, '').toLowerCase(),
			'p50',
			frequency,
			'30year',
		]
			.filter(Boolean)
			.join('-'); // Removes empty values before joining

		return `${GEOSERVER_BASE_URL}/geoserver/wms?service=WMS&version=1.1.0&request=GetLegendGraphic&format=application/json&layer=${layerName}`;
	}, [dataset, variable, frequency, emissionScenario]);

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
			<MapLegend url={mapLegendUrl} />
			<CustomPanesLayer />
			<InteractiveRegionsLayer />
			<VariableLayer />
			<ZoomControl />
			<SearchControl />

			{interactiveRegion === 'gridded_data' && <CellsGridLayer />}

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
