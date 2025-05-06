import { useContext, useMemo, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { MAP_CONFIG } from '@/config/map.config';

import MapLegend from '@/components/map-layers/map-legend';
import VariableLayer from '@/components/map-layers/variable-layer';
import CustomPanesLayer from '@/components/map-layers/custom-panes';
import ZoomControl from '@/components/map-layers/zoom-control';
import MapEvents from '@/components/map-layers/map-events';
import SearchControl from '@/components/map-layers/search-control';
import InteractiveRegionsLayer from '@/components/map-layers/interactive-regions-layer';
import InteractiveStationsLayer from '@/components/map-layers/interactive-stations-layer';
import LocationModal from '@/components/map-layers/location-modal';

import { useAppSelector } from '@/app/hooks';
import { useClimateVariable } from "@/hooks/use-climate-variable";
import {
	CANADA_CENTER,
	DEFAULT_ZOOM,
	DEFAULT_MIN_ZOOM,
	DEFAULT_MAX_ZOOM,
	GEOSERVER_BASE_URL,
	CANADA_BOUNDS
} from '@/lib/constants';
import { cn, getDefaultFrequency, getFrequencyCode } from "@/lib/utils";
import SectionContext from "@/context/section-provider";
import { FrequencyType } from "@/types/climate-variable-interface";
import appConfig from "@/config/app.config";

/**
 * Renders a Leaflet map, including custom panes and tile layers.
 */
export default function RasterMapContainer({
	scenario,
	onMapReady,
	onUnmount,
}: {
	scenario: string | null | undefined;
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

	const scenarioLabel = appConfig.scenarios.find(item => item.value === scenario)?.label ?? scenario;

	const layerValue: string = useMemo(() => {
		let version;
		if (climateVariable) {
			version = climateVariable.getVersion() === 'cmip5' ? '' : climateVariable.getVersion();
		}

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

		const valuesArr = [
			version,
			threshold,
			frequencyCode,
			scenario,
		];
		if(climateVariable?.getId() !== "sea_level") {
			valuesArr.push('p50');
		}
		valuesArr.push(
			frequency,
			'30year',
			climateVariable?.getDataValue() === 'delta' ? 'delta7100' : ''
		);

		const value = valuesArr.filter(Boolean).join('-');

		return `CDC:${value}`;
	}, [climateVariable, scenario, section]);

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
			bounds={CANADA_BOUNDS}
		>
			<MapEvents
				onMapReady={onMapReady}
				onUnmount={onUnmount}
				onLocationModalClose={handleLocationModalClose}
			/>
			{climateVariable?.getInteractiveMode() === 'region' && (
				<MapLegend url={`${GEOSERVER_BASE_URL}/geoserver/wms?service=WMS&version=1.1.0&request=GetLegendGraphic&format=application/json&layer=${layerValue}`} />
			)}
			
			{/* Use the unified CustomPanesLayer with 'standard' mode */}
			<CustomPanesLayer mode="standard" />
			
			{/* Use the unified VariableLayer */}
			<VariableLayer layerValue={layerValue} />
			
			<ZoomControl />
			<SearchControl />

			<LocationModal
				isOpen={isLocationModalOpen}
				onClose={handleLocationModalClose}
			>
				{locationModalContent}
			</LocationModal>

			{climateVariable?.getInteractiveMode() === 'region' && (
				<InteractiveRegionsLayer
					scenario={scenario}
					onLocationModalOpen={handleLocationModalOpen}
					onLocationModalClose={handleLocationModalClose}
				/>
			)}
			{climateVariable?.getInteractiveMode() === 'station' && (
				<InteractiveStationsLayer
					onLocationModalOpen={handleLocationModalOpen}
					onLocationModalClose={handleLocationModalClose}
				/>
			)}

			{/* Basemap TileLayer */}
			<TileLayer
				url={MAP_CONFIG.baseTileUrl}
				attribution=""
				subdomains="abcd"
				pane="basemap"
				maxZoom={DEFAULT_MAX_ZOOM}
			/>

			{/* Labels TileLayer */}
			<TileLayer
				url={MAP_CONFIG.labelsTileUrl}
				pane="labels"
				opacity={labelsOpacity}
			/>

			{/* show current scenario label */}
			<div className={cn(
				'absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20',
				'text-sm text-zinc-900 font-normal leading-5',
				'bg-neutral-grey-light border border-cold-grey-4 shadow-md rounded-xl px-3.5 py-1.5',
			)}>
				{scenarioLabel}
			</div>
		</MapContainer>
	);
}