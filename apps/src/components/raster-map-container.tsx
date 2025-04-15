import { useContext, useMemo, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';

import MapLegend from '@/components/map-layers/map-legend';
import VariableLayer from '@/components/map-layers/variable-layer';
import CustomPanesLayer from '@/components/map-layers/custom-panes';
import ZoomControl from '@/components/map-layers/zoom-control';
import MapEvents from '@/components/map-layers/map-events';
import SearchControl from '@/components/map-layers/search-control';
import InteractiveRegionsLayer from '@/components/map-layers/interactive-regions-layer';
import LocationModal from '@/components/map-layers/location-modal';

import { useAppSelector } from '@/app/hooks';
import { useClimateVariable } from "@/hooks/use-climate-variable";
import {
	CANADA_CENTER,
	DEFAULT_ZOOM,
	DEFAULT_MIN_ZOOM,
	DEFAULT_MAX_ZOOM,
	GEOSERVER_BASE_URL,
} from '@/lib/constants';
import { getDefaultFrequency, getFrequencyCode } from "@/lib/utils";
import SectionContext from "@/context/section-provider";
import { FrequencyType } from "@/types/climate-variable-interface";

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
	const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
	const [locationModalContent, setLocationModalContent] = useState<React.ReactNode>(null);

	const {
		opacity: { labels: labelsOpacity },
	} = useAppSelector((state) => state.map);

	const { climateVariable } = useClimateVariable();

	const section = useContext(SectionContext);

	const layerValue: string = useMemo(() => {
		let version;
		if (climateVariable) {
			version = climateVariable.getVersion() === 'cmip5' ? '' : climateVariable.getVersion();
		}

		const scenario = climateVariable?.getScenario();
		const threshold = climateVariable?.getThreshold();

		let frequency = climateVariable?.getFrequency() ?? null;

		// If there's no frequency set, try to get the default value from the config.
		const frequencyConfig = climateVariable?.getFrequencyConfig() ?? null;
		if (!frequency && climateVariable && frequencyConfig) {
			frequency = getDefaultFrequency(frequencyConfig, section) ?? null;
		}

		// Fallback to annual.
		if (!frequency) {
			frequency = FrequencyType.ANNUAL;
		}

		const frequencyCode = getFrequencyCode(frequency);

		const value = [
				version,
				threshold,
				frequencyCode,
				scenario,
				'p50',
				frequency,
				'30year',
				climateVariable?.getDataValue() === 'delta' ? 'delta7100' : '',
			]
			.filter(Boolean)
			.join('-');

		return `CDC:${value}`;
	}, [climateVariable])

	const handleLocationModalOpen = (content: React.ReactNode) => {
		setLocationModalContent(content);
		setIsLocationModalOpen(true);
	};

	const handleLocationModalClose = () => {
		setIsLocationModalOpen(false);
		setLocationModalContent(null);
	};

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
			<MapEvents
				onMapReady={onMapReady}
				onUnmount={onUnmount}
				onLocationModalClose={handleLocationModalClose}
			/>
			<MapLegend url={`${GEOSERVER_BASE_URL}/geoserver/wms?service=WMS&version=1.1.0&request=GetLegendGraphic&format=application/json&layer=${layerValue}`} />
			<CustomPanesLayer />
			<VariableLayer layerValue={layerValue} />
			<ZoomControl />
			<SearchControl />

			<LocationModal
				isOpen={isLocationModalOpen}
				onClose={handleLocationModalClose}
			>
				{locationModalContent}
			</LocationModal>

			<InteractiveRegionsLayer onLocationModalOpen={handleLocationModalOpen} onLocationModalClose={handleLocationModalClose} />

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
