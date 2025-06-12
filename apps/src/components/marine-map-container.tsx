import { useContext, useMemo, useState } from 'react';
import { MapContainer, TileLayer, WMSTileLayer } from 'react-leaflet';
import { MAP_CONFIG, LAYER_KEYS, WMS_PARAMS } from '@/config/map.config';

import MapLegend from '@/components/map-layers/map-legend';
import VariableLayer from '@/components/map-layers/variable-layer';
import CustomPanesLayer from '@/components/map-layers/custom-panes';
import ZoomControl from '@/components/map-layers/zoom-control';
import MapEvents from '@/components/map-layers/map-events';
import SearchControl from '@/components/map-layers/search-control';
import InteractiveRegionsLayer from '@/components/map-layers/interactive-regions-layer';
import LocationModal from '@/components/map-layers/location-modal';

import { useAppSelector } from '@/app/hooks';
import { useClimateVariable } from '@/hooks/use-climate-variable';
import {
	DEFAULT_MIN_ZOOM,
	DEFAULT_MAX_ZOOM,
	GEOSERVER_BASE_URL,
	CANADA_BOUNDS,
} from '@/lib/constants';
import { cn } from '@/lib/utils';
import SectionContext from '@/context/section-provider';
import appConfig from '@/config/app.config';

/**
 * Renders a Leaflet map for marine variables with a specialized approach:
 * 1. Standard basemap (complete world map) at the bottom
 * 2. Marine raster data layer (ocean data)
 * 3. Grid layer for interactive regions
 * 4. Landmass layer with transparent ocean areas
 * 5. Labels layer on top
 */
export default function MarineMapContainer({
	scenario,
	onMapReady,
	onUnmount,
	isComparisonMap,
}: {
	scenario: string;
	onMapReady: (map: L.Map) => void;
	onUnmount?: () => void;
	isComparisonMap?: boolean;
}) {
	const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
	const [locationModalContent, setLocationModalContent] = useState<React.ReactNode>(null);


	const {
		opacity: { labels: labelsOpacity },
		mapCoordinates
	} = useAppSelector((state) => state.map);

	const { climateVariable } = useClimateVariable();

	const section = useContext(SectionContext);

	const scenarioLabel = appConfig.scenarios.find(item => item.value === scenario)?.label ?? scenario;

	const layerValue = useMemo(() => {
		return climateVariable?.getLayerValue(scenario, section) ?? '';
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
			attributionControl={false}
			center={[mapCoordinates.lat, mapCoordinates.lng]}
			zoomControl={false}
			zoom={mapCoordinates.zoom}
			minZoom={DEFAULT_MIN_ZOOM}
			maxZoom={DEFAULT_MAX_ZOOM}
			scrollWheelZoom={true}
			className="z-10"
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

			{/* Use the unified custom panes with 'marine' mode */}
			<CustomPanesLayer mode="marine" />

			{/* Use the unified variable layer */}
			<VariableLayer layerValue={layerValue} scenario={scenario} />

			<ZoomControl />

			{/* Show search control if not a comparison map. */}
			{ !isComparisonMap && <SearchControl /> }

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

			{/* Standard world basemap (bottom layer) */}
			<TileLayer
				url={MAP_CONFIG.baseTileUrl}
				attribution=""
				subdomains="abcd"
				pane="standardBasemap"
				maxZoom={DEFAULT_MAX_ZOOM}
			/>

			{/* Landmass layer for marine data, with transparent oceans */}
			<WMSTileLayer
				url={`${GEOSERVER_BASE_URL}/geoserver/wms`}
				layers={LAYER_KEYS.landmass}
				params={WMS_PARAMS.landmass}
				format="image/png"
				transparent={true}
				version="1.1.1"
				pane="marineBasemap"
				opacity={1.0}
				bounds={CANADA_BOUNDS}
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
