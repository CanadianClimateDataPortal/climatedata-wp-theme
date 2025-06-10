import React, { useContext, useMemo, useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { MAP_CONFIG } from '@/config/map.config';
import 'leaflet.vectorgrid';
import L from 'leaflet';

import MapLegend from '@/components/map-layers/map-legend';
import VariableLayer from '@/components/map-layers/variable-layer';
import CustomPanesLayer from '@/components/map-layers/custom-panes';
import ZoomControl from '@/components/map-layers/zoom-control';
import MapEvents from '@/components/map-layers/map-events';
import SearchControl from '@/components/map-layers/search-control';
import InteractiveRegionsLayer from '@/components/map-layers/interactive-regions-layer';
import InteractiveStationsLayer from '@/components/map-layers/interactive-stations-layer';
import LocationModal from '@/components/map-layers/location-modal';
import LocationInfoPanel from '@/components/map-info/location-info-panel';

import { useAppSelector } from '@/app/hooks';
import { useClimateVariable } from "@/hooks/use-climate-variable";
import { useAnimatedPanel } from '@/hooks/use-animated-panel';
import { useIsMobile } from '@/hooks/use-mobile';
import { generateChartData } from '@/services/services';
import { cn, getDefaultFrequency, remToPx } from "@/lib/utils";
import SectionContext from "@/context/section-provider";
import appConfig from "@/config/app.config";
import {
	DEFAULT_MIN_ZOOM,
	DEFAULT_MAX_ZOOM,
	GEOSERVER_BASE_URL,
	CANADA_BOUNDS,
	SIDEBAR_WIDTH,
} from '@/lib/constants';
import { LocationModalContent } from '@/components/map-layers/location-modal-content';
import { SelectedLocationInfo } from '@/types/types';

/**
 * Renders a Leaflet map, including custom panes and tile layers.
 */
export default function RasterMapContainer({
	scenario,
	onMapReady,
	onUnmount,
	isComparisonMap = false,
	onOver,
	onOut,
	onClick,
	selectedLocation,
	clearSelectedLocation,
	layerRef,
}: {
	scenario: string;
	onMapReady: (map: L.Map) => void;
	onUnmount?: () => void;
	isComparisonMap?: boolean;
	onOver: (e: { latlng: L.LatLng; layer: { properties: any } }, getFeatureColor: (featureId: number) => string) => void;
	onOut: () => void;
	onClick: (e: { latlng: L.LatLng; layer: { properties: any } }) => void;
	selectedLocation: SelectedLocationInfo | null;
	clearSelectedLocation: () => void;
	layerRef?: React.MutableRefObject<any>;
}): React.ReactElement {
	const [locationModalContent, setLocationModalContent] = useState<React.ReactNode>(null);

	const {
		opacity: { labels: labelsOpacity },
		mapCoordinates
	} = useAppSelector((state) => state.map);

	const { climateVariable } = useClimateVariable();
	const { togglePanel } = useAnimatedPanel();
	const isMobile = useIsMobile();

	const section = useContext(SectionContext);

	const scenarioLabel = appConfig.scenarios.find(item => item.value === scenario)?.label ?? scenario;

	const layerValue = useMemo(() => {
		return climateVariable?.getLayerValue(scenario, section) ?? '';
	}, [climateVariable, scenario, section]);

	const handleLocationModalOpen = (content: React.ReactNode) => {
		setLocationModalContent(content);
	};

	const handleLocationModalClose = () => {
		clearSelectedLocation();
		setLocationModalContent(null);
	};

	// Handle click on details button of a location (to open the chart panel)
	const handleDetailsClick = async () => {
		if (selectedLocation) {
			const { title, latlng, featureId } = selectedLocation;
			const frequencyConfig = climateVariable?.getFrequencyConfig();
			let frequency = climateVariable?.getFrequency() ?? ''
			if (!frequency && frequencyConfig) {
				frequency = getDefaultFrequency(frequencyConfig, section) ?? ''
			}

			const chartData = await generateChartData({
				latlng,
				variable: climateVariable?.getThreshold() ?? '',
				frequency: frequency,
				dataset: climateVariable?.getVersion() ?? '',
			});

			togglePanel(
				<LocationInfoPanel
					title={title}
					latlng={latlng}
					featureId={featureId}
					data={chartData}
				/>,
				{
					position: {
						left: isMobile ? 0 : remToPx(SIDEBAR_WIDTH),
						right: 0,
						bottom: 0,
					},
					direction: 'bottom',
					className: 'location-info-panel-wrapper',
				}
			);
		}
	}

	const mapRef = useRef<L.Map | null>(null);

	useEffect(() => {
		if (selectedLocation) {
			const { title, latlng, featureId } = selectedLocation;

			setLocationModalContent(
				<LocationModalContent
					title={title}
					latlng={latlng}
					scenario={scenario}
					featureId={featureId}
					onDetailsClick={handleDetailsClick}
				/>
			)
		}
		else {
			setLocationModalContent(null);
		}
	}, [selectedLocation, setLocationModalContent]);

	useEffect(() => {
		if (mapRef.current) {
			onMapReady(mapRef.current);
		}
		return () => {
			if (onUnmount) onUnmount();
		};
	}, [onMapReady, onUnmount]);

	return (
		<MapContainer
			ref={mapRef}
			attributionControl={false}
			center={[mapCoordinates.lat, mapCoordinates.lng]}
			zoomControl={false}
			zoom={mapCoordinates.zoom}
			minZoom={DEFAULT_MIN_ZOOM}
			maxZoom={DEFAULT_MAX_ZOOM}
			scrollWheelZoom={true}
			className="z-10 h-full w-full"
			bounds={CANADA_BOUNDS}
		>
			<MapEvents
				onMapReady={onMapReady}
				onUnmount={onUnmount}
			/>
			{climateVariable?.getInteractiveMode() === 'region' && (
				<MapLegend url={`${GEOSERVER_BASE_URL}/geoserver/wms?service=WMS&version=1.1.0&request=GetLegendGraphic&format=application/json&layer=${layerValue}`} />
			)}

			{/* Use the unified CustomPanesLayer with 'standard' mode */}
			<CustomPanesLayer mode="standard" />

			{/* Use the unified VariableLayer */}
			<VariableLayer layerValue={layerValue} scenario={scenario} />

			<ZoomControl />

			{/* Show search control if not a comparison map. */}
			{ !isComparisonMap && <SearchControl /> }

			<LocationModal
				isOpen={!!(selectedLocation)}
				onClose={handleLocationModalClose}
			>
				{locationModalContent}
			</LocationModal>

			{climateVariable?.getInteractiveMode() === 'region' && (
				<InteractiveRegionsLayer
					scenario={scenario}
					onOver={onOver}
					onOut={onOut}
					onClick={onClick}
					layerRef={layerRef}
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
