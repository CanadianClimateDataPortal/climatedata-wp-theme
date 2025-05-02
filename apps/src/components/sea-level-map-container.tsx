import { useContext, useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, WMSTileLayer, useMap } from 'react-leaflet';

import MapLegend from '@/components/map-layers/map-legend';
import SeaLevelVariableLayer from '@/components/map-layers/sea-level-variable-layer';
import ZoomControl from '@/components/map-layers/zoom-control';
import MapEvents from '@/components/map-layers/map-events';
import SearchControl from '@/components/map-layers/search-control';
import InteractiveRegionsLayer from '@/components/map-layers/interactive-regions-layer';
import LocationModal from '@/components/map-layers/location-modal';
import SeaLevelCustomPanes from '@/components/map-layers/sea-level-custom-panes';

import { useAppSelector } from '@/app/hooks';
import { useClimateVariable } from '@/hooks/use-climate-variable';
import {
	CANADA_CENTER,
	DEFAULT_ZOOM,
	DEFAULT_MIN_ZOOM,
	DEFAULT_MAX_ZOOM,
	GEOSERVER_BASE_URL,
	// CANADA_BOUNDS,
} from '@/lib/constants';
import { cn, getDefaultFrequency, getFrequencyCode } from '@/lib/utils';
import SectionContext from '@/context/section-provider';
import { FrequencyType } from '@/types/climate-variable-interface';
import appConfig from '@/config/app.config';

/**
 * Applies CSS filters to make green landmass appear white
 */
function LandmassStyler(): null {
	const map = useMap();

	useEffect(() => {
		const pane = map.getPane('basemap');
		if (pane) {
			pane.style.filter = 'brightness(0) saturate(100%) invert(100%) sepia(100%) saturate(0%) hue-rotate(298deg) brightness(102%) contrast(102%)';
		}
	}, [map]);

	return null;
}

/**
 * Renders a Leaflet map for sea-level variables with custom layer ordering:
 * 1. Raster (ocean data) at the bottom
 * 2. Grid layer for interactive regions
 * 3. Landmass layer (with CSS filter to make it white)
 * 4. Labels layer on top
 */
export default function SeaLevelMapContainer({
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

		const frequencyConfig = climateVariable?.getFrequencyConfig() ?? null;
		if (!frequency && climateVariable && frequencyConfig) {
			frequency = getDefaultFrequency(frequencyConfig, section) ?? null;
		}

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
		if (climateVariable?.getId() !== 'sea_level') {
			valuesArr.push('p50');
		}
		valuesArr.push(
			frequency,
			'30year',
			climateVariable?.getDataValue() === 'delta' ? 'delta7100' : ''
		);

		const value = valuesArr.filter(Boolean).join('-');

		return `CDC:${value}`;
	}, [climateVariable]);

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
			className="z-10"
		>
			<MapEvents
				onMapReady={onMapReady}
				onUnmount={onUnmount}
				onLocationModalClose={handleLocationModalClose}
			/>
			{climateVariable?.getInteractiveMode() === 'region' && (
				<MapLegend url={`${GEOSERVER_BASE_URL}/geoserver/wms?service=WMS&version=1.1.0&request=GetLegendGraphic&format=application/json&layer=${layerValue}`} />
			)}
			<SeaLevelCustomPanes />
			<LandmassStyler />
			<SeaLevelVariableLayer layerValue={layerValue} />
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

			<WMSTileLayer 
				url={`${GEOSERVER_BASE_URL}/geoserver/wms`}
				layers="CDC:landmass"
				format="image/png"
				transparent={true}
				version="1.1.1"
				pane="basemap"
				opacity={1.0}
				// bounds={CANADA_BOUNDS}
			/>

			{/* Labels TileLayer */}
			<TileLayer
				url="//{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png"
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
