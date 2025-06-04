/**
 * Component that adds interaction to the map depending on the selected region (gridded data, watershed, health, census).
 */
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState, } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.vectorgrid';

import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { addRecentLocation, clearRecentLocations } from '@/features/map/map-slice';
import { fetchChoroValues, fetchLocationByCoords, generateChartData } from '@/services/services';
import { useClimateVariable } from "@/hooks/use-climate-variable";
import { InteractiveRegionOption } from "@/types/climate-variable-interface";
import { getDefaultFrequency, remToPx } from "@/lib/utils";
import SectionContext from "@/context/section-provider";
import { useColorMap } from '@/hooks/use-color-map';
import { LocationModalContent } from '@/components/map-layers/location-modal-content';
import { useAnimatedPanel } from '@/hooks/use-animated-panel';
import { useLocale } from '@/hooks/use-locale';
import { useIsMobile } from '@/hooks/use-mobile';
import LocationInfoPanel from '@/components/map-info/location-info-panel';
import {
	CANADA_BOUNDS,
	DEFAULT_MAX_ZOOM,
	DEFAULT_MIN_ZOOM,
	GEOSERVER_BASE_URL,
	SIDEBAR_WIDTH
} from '@/lib/constants';

interface handleOnClickMapLayerProps {
	properties: {
		gid?: number;
		id?: number;
		name?: string;
		title?: string;
		label_en?: string;
		label_fr?: string
	}
}

interface InteractiveRegionsLayerProps {
	scenario: string;
	isComparisonMap?: boolean;
	onLocationModalOpen: (content: React.ReactNode) => void;
	onLocationModalClose: () => void;
	onAddMarker: (latlng: L.LatLng, title: string, locationId: string) => void;
}

export const getFeatureId = (properties: {
	gid?: number;
	id?: number;
	name?: string;
	title?: string;
	label_en?: string;
	label_fr?: string;
}): number | null => {
	return properties.gid ?? properties.id ?? null;
};

const InteractiveRegionsLayer: React.FC<InteractiveRegionsLayerProps> = ({
	scenario,
	onLocationModalOpen,
	onLocationModalClose,
	onAddMarker
}) => {
	const [layerData, setLayerData] = useState<Record<number, number> | null>(
		null
	);

	const { togglePanel } = useAnimatedPanel();
	const { locale } = useLocale();
	const isMobile = useIsMobile();

	// @ts-expect-error: suppress leaflet typescript error
	const layerRef = useRef<L.VectorGrid | null>(null);

	const map = useMap();
	const dispatch = useAppDispatch();
	const section = useContext(SectionContext);

	const {
		opacity: { mapData },
	} = useAppSelector((state) => state.map);

	const { climateVariable } = useClimateVariable();
	const { colorMap, getColor } = useColorMap();

	const {
		threshold,
		datasetVersion,
		gridType,
		interactiveRegion,
		startYear
	} = useMemo(() => ({
		threshold: climateVariable?.getThreshold() ?? '',
		datasetVersion: climateVariable?.getVersion() ?? '',
		gridType: climateVariable?.getGridType() ?? 'canadagrid',
		interactiveRegion: climateVariable?.getInteractiveRegion() ?? InteractiveRegionOption.GRIDDED_DATA,
		startYear: climateVariable?.getDateRange()?.[0] ?? '2040',
	}), [climateVariable]);

	const getFeatureColor = useCallback(
		(featureId: number) => {
			if (!colorMap || !colorMap.quantities || !colorMap.colours) {
				return '#fff';
			}

			// Extract value based on interactive region type
			const value =
				interactiveRegion === InteractiveRegionOption.GRIDDED_DATA
					? featureId
					: (layerData?.[featureId] ?? 0);

			return getColor(value);
		},
		[interactiveRegion, layerData, colorMap, getColor]
	);

	const frequency = useMemo(() => {
		const frequencyConfig = climateVariable?.getFrequencyConfig();

		let frequency = climateVariable?.getFrequency() ?? '';

		if (!frequency && frequencyConfig) {
			frequency = getDefaultFrequency(frequencyConfig, section) ?? ''
		}

		return frequency;
	}, [climateVariable, section]);

	const tileLayerUrl = useMemo(() => {
		const regionPbfValues: Record<string, string> = {
			gridded_data: `CDC:${gridType}@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf`,
			watershed: 'CDC:watershed/{z}/{x}/{-y}.pbf',
			health: 'CDC:health/{z}/{x}/{-y}.pbf',
			census: 'CDC:census/{z}/{x}/{-y}.pbf',
		};
		const regionPbf =
			regionPbfValues[interactiveRegion] || regionPbfValues[InteractiveRegionOption.GRIDDED_DATA];

		return `${GEOSERVER_BASE_URL}/geoserver/gwc/service/tms/1.0.0/${regionPbf}`;
	}, [interactiveRegion, gridType]);

	const vectorTileLayerStyles = useMemo(() => {
		if (interactiveRegion === InteractiveRegionOption.GRIDDED_DATA) {
			return {
				[gridType]: (properties: { gid: number }) => ({
					weight: 0.5,
					color: '#fff',
					fillColor: properties.gid
						? getFeatureColor(properties.gid)
						: 'transparent',
					opacity: 0.6,
					fill: true,
					radius: 4,
					fillOpacity: 0,
				}),
			};
		}

		return {
			[interactiveRegion]: (properties: { id: number }) => ({
				weight: 1,
				color: layerData ? '#fff' : '#999',
				fillColor:
					properties.id && layerData?.[properties.id]
						? getFeatureColor(properties.id)
						: 'transparent',
				opacity: 0.5,
				fill: true,
				radius: 4,
				fillOpacity: 1,
			}),
		};
	}, [interactiveRegion, layerData, getFeatureColor, gridType]);

	const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const hoveredRef = useRef<number | null>(null);

	const handleOver = (e: {
		latlng: L.LatLng;
		layer: { properties: { gid?: number; id?: number; name?: string; title?: string; label_en?: string } };
	}) => {
		handleOut();

		const featureId = getFeatureId(e.layer.properties);
		if (!featureId) {
			return;
		}

		hoveredRef.current = featureId;
		const interactiveRegion =
			climateVariable?.getInteractiveRegion() ??
			InteractiveRegionOption.GRIDDED_DATA;

		layerRef.current?.setFeatureStyle(featureId, {
			fill: true,
			fillColor:
				interactiveRegion === InteractiveRegionOption.GRIDDED_DATA
					? '#fff'
					: getFeatureColor(featureId),
			fillOpacity:
				interactiveRegion === InteractiveRegionOption.GRIDDED_DATA
					? 0.2
					: 1,
			weight: 1.5,
			color: '#fff',
		});
	};

	const handleOut = () => {
		if (!layerRef.current) {
			return;
		}

		if (hoverTimeoutRef.current) {
			clearTimeout(hoverTimeoutRef.current);
		}

		if (hoveredRef.current !== null) {
			layerRef.current.resetFeatureStyle(hoveredRef.current);
			hoveredRef.current = null;
		}
	};

	const handleClick = async (e: {
		latlng: L.LatLng;
		layer: handleOnClickMapLayerProps;
	}) => {
		const locationByCoords = await fetchLocationByCoords(e.latlng);
		const locationId = locationByCoords?.geo_id ?? `${locationByCoords?.lat}|${locationByCoords?.lng}`;
		const locationTitle = e.layer?.properties?.label_en ?? locationByCoords?.title;

		onAddMarker(e.latlng, locationTitle, locationId);

		// add to recent locations
		dispatch(
			addRecentLocation({
				id: locationId,
				title: locationTitle,
				...e.latlng,
			})
		);

		const featureId = getFeatureId(e.layer.properties);

		if (!featureId) {
			return;
		}

		if (onLocationModalOpen) {

			const { latlng } = e;
			const interactiveRegion = climateVariable?.getInteractiveRegion() ?? InteractiveRegionOption.GRIDDED_DATA;

			let title = '';
			if(interactiveRegion === InteractiveRegionOption.GRIDDED_DATA) {
				const locationByCoords = await fetchLocationByCoords(latlng);
				title = locationByCoords.title;
			} else {
				if (locale === 'en') {
					title = e.layer.properties.label_en ?? '';
				} else if(locale === 'fr') {
					title = e.layer.properties.label_fr ?? '';
				}
			}

			// Handle click on details button of a location (to open the chart panel)
			const handleDetailsClick = async () => {
				if(onLocationModalClose) {
					onLocationModalClose();
				}

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

			// Open location modal
			onLocationModalOpen(
				<LocationModalContent
					title={title}
					latlng={latlng}
					scenario={scenario}
					featureId={featureId}
					onDetailsClick={handleDetailsClick}
				/>
			);
		}
	};

	// fetch layer data if needed
	useEffect(() => {
		(async () => {
			// no need to fetch anything for gridded data
			if (interactiveRegion === InteractiveRegionOption.GRIDDED_DATA) {
				return;
			}

			try {
				const data = await fetchChoroValues({
					variable: threshold,
					dataset: datasetVersion,
					decade: startYear,
					frequency,
					interactiveRegion,
					emissionScenario: scenario ?? '',
					decimals: 1,
				});

				setLayerData(data);
			} catch (error) {
				console.error('Error fetching layer data:', error);
			}
		})();
	}, [
		datasetVersion,
		frequency,
		interactiveRegion,
		scenario ?? '',
		startYear,
		threshold
	]);

	useEffect(() => {
		// make sure all needed data is available
		if (
			!tileLayerUrl ||
			(interactiveRegion !== InteractiveRegionOption.GRIDDED_DATA && !layerData)
		) {
			return;
		}

		const layerOptions = {
			// @ts-expect-error: suppress leaflet typescript error
			rendererFactory: L.canvas.tile,
			interactive: true,
			getFeatureId: (f: { properties: { id?: number; gid?: number } }) =>
				f.properties.id ?? f.properties.gid,
			pane: 'grid',
			name: 'geojson',
			maxNativeZoom: DEFAULT_MAX_ZOOM,
			bounds: CANADA_BOUNDS,
			maxZoom: DEFAULT_MAX_ZOOM,
			minZoom: interactiveRegion === InteractiveRegionOption.GRIDDED_DATA ? 7 : DEFAULT_MIN_ZOOM,
			vectorTileLayerStyles,
		};

		// @ts-expect-error: suppress leaflet typescript error
		const layer = L.vectorGrid.protobuf(tileLayerUrl, layerOptions);
		layer.setOpacity(mapData);
		layerRef.current = layer;

		layer.on('click', handleClick);

		if ('ontouchstart' in window) {
			layer.on('touchstart', handleOver).on('touchend', handleOut);
		} else {
			layer.on('mouseover', handleOver).on('mouseout', handleOut);
		}

		layer.addTo(map);

		// clear all existing markers from the map
		map.eachLayer(layer => {
			if (layer instanceof L.Marker) {
				map.removeLayer(layer);
			}
		});

		// clear recent locations
		dispatch(clearRecentLocations());

		return () => {
			map.removeLayer(layer);
			layerRef.current = null;
		};
	},
	// Intentionally not including the event handlers (e.g. handleClick)
	// as dependencies since they are already being handled by the
	// userInteractiveMapEvents hook.
	[
		map,
		interactiveRegion,
		layerData,
		tileLayerUrl,
		vectorTileLayerStyles,
	]);

	useEffect(() => {
		if (layerRef.current) {
			layerRef.current.setOpacity(mapData);
		}
	}, [mapData]);

	return null;
};

export default InteractiveRegionsLayer;