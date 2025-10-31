import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {
	MapContainer as LMapContainer,
	TileLayer,
	WMSTileLayer,
} from 'react-leaflet';
import { LAYER_KEYS, MAP_CONFIG, WMS_PARAMS } from '@/config/map.config';
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
import { useClimateVariable } from '@/hooks/use-climate-variable';
import { useAnimatedPanel } from '@/hooks/use-animated-panel';
import { useIsMobile } from '@/hooks/use-mobile';
import { generateChartData } from '@/services/services';
import { cn, getDefaultFrequency, remToPx } from '@/lib/utils';
import SectionContext from '@/context/section-provider';
import appConfig from '@/config/app.config';
import {
	CANADA_BOUNDS,
	DEFAULT_MAX_ZOOM,
	DEFAULT_MIN_ZOOM,
	GEOSERVER_BASE_URL,
	SIDEBAR_WIDTH,
} from '@/lib/constants';
import { LocationModalContent } from '@/components/map-layers/location-modal-content';
import { SelectedLocationInfo, Station } from '@/types/types';
import {
	InteractiveRegionOption,
	VariableTypes,
} from '@/types/climate-variable-interface';
import LowSkillLayer from '@/components/map-layers/low-skill-layer';

interface MapContainerProps {
	onMapReady: (map: L.Map) => void;
	onUnmount?: () => void;
	isComparisonMap?: boolean;
	onOver: (
		e: { latlng: L.LatLng; layer: { properties: unknown } },
		getFeatureColor: (featureId: number) => string
	) => void;
	onOut: () => void;
	onClick: (e: { latlng: L.LatLng; layer: { properties: unknown } }) => void;
	selectedLocation: SelectedLocationInfo | null;
	clearSelectedLocation: () => void;
	// @ts-expect-error: L.VectorGrid is a valid type
	layerRef?: React.MutableRefObject<L.VectorGrid | null>;
}

/**
 * Renders a Leaflet map, including custom panes and tile layers.
 */
export default function MapContainer({
	onMapReady,
	onUnmount,
	isComparisonMap = false,
	onOver,
	onOut,
	onClick,
	selectedLocation,
	clearSelectedLocation,
	layerRef,
}: MapContainerProps): React.ReactElement {
	const [locationModalContent, setLocationModalContent] = useState<React.ReactNode>(null);
	const [selectedStation, setSelectedStation] = useState<Station | null>(null);

	const {
		opacity: { labels: labelsOpacity },
		mapCoordinates
	} = useAppSelector((state) => state.map);

	const { climateVariable } = useClimateVariable();
	const { togglePanel } = useAnimatedPanel();
	const isMobile = useIsMobile();

	const section = useContext(SectionContext);
	const scenario = isComparisonMap ?
		(climateVariable?.getScenarioCompareTo() ?? '') :
		(climateVariable?.getScenario() ?? '');

	const showLandmassMask = climateVariable?.isOfType(VariableTypes.Marine) ?? false;
	const showLowSkillLayer = climateVariable?.isOfType(VariableTypes.S2D) ?? false;

	const scenarioLabel = appConfig.scenarios.find(item => item.value === scenario)?.label ?? scenario;

	const handleLocationModalOpen = (content: React.ReactNode) => {
		setLocationModalContent(content);
	};

	const handleLocationModalClose = () => {
		clearSelectedLocation();
		setSelectedStation(null);
		setLocationModalContent(null);
	};

	// Handle click on details button of a location (to open the chart panel)
	const handleDetailsClick = useCallback(async () => {
		if (selectedLocation) {
			const interactiveRegion = climateVariable?.getInteractiveRegion() ?? InteractiveRegionOption.GRIDDED_DATA;
			const { title, latlng, featureId } = selectedLocation;
			const frequencyConfig = climateVariable?.getFrequencyConfig();
			let frequency = climateVariable?.getFrequency() ?? ''
			if (!frequency && frequencyConfig) {
				frequency = getDefaultFrequency(frequencyConfig, section) ?? ''
			}

			const chartData = await generateChartData({
				interactiveRegion: interactiveRegion,
				latlng: latlng,
				featureId: featureId,
				variable: climateVariable?.getThreshold() ?? '',
				frequency: frequency,
				dataset: climateVariable?.getVersion() ?? '',
				unitDecimals: climateVariable?.getUnitDecimalPlaces() ?? 0,
			});

			togglePanel(
				<LocationInfoPanel
					title={title}
					latlng={latlng}
					featureId={featureId}
					data={chartData}
					scenario={scenario}
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
	}, [climateVariable, selectedLocation, togglePanel, isMobile, section, scenario]);

	const mapRef = useRef<L.Map | null>(null);

	const interactiveRegion = climateVariable?.getInteractiveRegion() ?? InteractiveRegionOption.GRIDDED_DATA;

	const canShowModal = useMemo(() => {
		// If we have a location
		if (selectedLocation) {
			const { featureId } = selectedLocation;

			// To properly show the modal for non-grid interactive region, the feature ID must be present.
			return !(interactiveRegion !== InteractiveRegionOption.GRIDDED_DATA && featureId == null);
		}

		// If we have a station
		if (selectedStation !== null) {
			return locationModalContent !== null;
		}

		return false;
	}, [selectedLocation, interactiveRegion, selectedStation, locationModalContent])

	useEffect(() => {
		if (selectedLocation && canShowModal) {
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
		else if(!selectedStation) {
			setLocationModalContent(null);
		}
	}, [selectedLocation, setLocationModalContent, scenario, canShowModal, selectedStation, handleDetailsClick]);

	useEffect(() => {
		if (mapRef.current) {
			onMapReady(mapRef.current);
		}
		return () => {
			if (onUnmount) onUnmount();
		};
	}, [onMapReady, onUnmount]);

	return (
		<LMapContainer
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
				<MapLegend />
			)}

			{/* Use the unified CustomPanesLayer with 'standard' mode */}
			<CustomPanesLayer />

			{/* Use the unified VariableLayer */}
			<VariableLayer isComparisonMap={isComparisonMap} />

			<ZoomControl />

			{/* Show search control if not a comparison map. */}
			{ !isComparisonMap && <SearchControl layerRef={layerRef} /> }

			<LocationModal
				isOpen={canShowModal}
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
					onStationSelect={setSelectedStation}
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

			{/* Low skill layer for S2D variables */}
			{showLowSkillLayer && (
				<LowSkillLayer pane="aboveRaster"/>
			)}

			{/* Landmass layer for marine data, with transparent oceans */}
			{showLandmassMask && (
				<WMSTileLayer
					url={`${GEOSERVER_BASE_URL}/geoserver/wms`}
					layers={LAYER_KEYS.landmass}
					params={WMS_PARAMS.landmass}
					format="image/png"
					transparent={true}
					version="1.1.1"
					pane="aboveGrid"
					opacity={1.0}
					bounds={CANADA_BOUNDS}
				/>
			)}

			{/* Labels TileLayer */}
			<TileLayer
				url={MAP_CONFIG.labelsTileUrl}
				pane="labels"
				opacity={labelsOpacity}
			/>

			{/* show current scenario label */}
			{ scenarioLabel && (
				<div className={cn(
					'absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20',
					'text-sm text-zinc-900 font-normal leading-5',
					'bg-neutral-grey-light border border-cold-grey-4 shadow-md rounded-xl px-3.5 py-1.5',
				)}>
					{scenarioLabel}
				</div>
			)}
		</LMapContainer>
	);
}
