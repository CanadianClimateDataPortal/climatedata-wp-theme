/**
 * Hook that returns event handlers for interactive map layers.
 */
import React, { useRef } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';

import LocationInfoPanel from '@/components/map-info/location-info-panel';
import { LocationModalContent } from '@/components/map-layers/location-modal-content';

import { useAppDispatch } from '@/app/hooks';
import { useAnimatedPanel } from '@/hooks/use-animated-panel';
import { addRecentLocation, deleteLocation } from '@/features/map/map-slice';

import { remToPx } from '@/lib/utils';
import { fetchLocationByCoords, generateChartData, } from '@/services/services';
import { MAP_MARKER_CONFIG, SIDEBAR_WIDTH } from '@/lib/constants';
import { useClimateVariable } from "@/hooks/use-climate-variable";
import { InteractiveRegionOption } from "@/types/climate-variable-interface";

export const useInteractiveMapEvents = (
	// @ts-expect-error: suppress leaflet typescript error
	layerInstanceRef: React.MutableRefObject<L.VectorGrid | null>,
	getColor: (value: number) => string,
	onLocationModalOpen?: (content: React.ReactNode) => void,
	onLocationModalClose?: () => void
) => {
	const { togglePanel } = useAnimatedPanel();
	const { climateVariable } = useClimateVariable();

	const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const hoveredRef = useRef<number | null>(null);
	const markerRef = useRef<L.Marker | null>(null);

	const dispatch = useAppDispatch();
	const map = useMap();

	const getFeatureId = (properties: {
		gid?: number;
		id?: number;
	}): number | null => {
		return properties.gid ?? properties.id ?? null;
	};

	const handleLocationMarkerChange = (locationId: string, locationTitle: string, latlng: L.LatLng) => {
		const previousLocationTitle = markerRef.current?.getTooltip()?.getContent();

		// when the marker is already in the same region, do nothing
		if (previousLocationTitle === locationTitle) {
			return;
		}

		// a single marker is allowed at a time
		if (markerRef.current) {
			// first, delete the marker's location from recent locations
			const previousLocationId = markerRef.current?.getElement()?.dataset?.locationId;
			if (previousLocationId) {
				dispatch(deleteLocation(previousLocationId));
			}

			// and then, remove the marker from the map
			markerRef.current.removeFrom(map);
		}

		// add new marker to the map
		markerRef.current = L.marker(latlng, MAP_MARKER_CONFIG)
		.bindTooltip(locationTitle, {
			direction: 'top',
			offset: [0, -30],
		})
		.addTo(map);

		// add to recent locations
		dispatch(
			addRecentLocation({
				id: locationId,
				title: locationTitle,
				...latlng,
			})
		);

		// add a bounce animation to the marker
		setTimeout(() => {
			const markerElement = markerRef.current?.getElement();
			if (markerElement) {
				// adding the location id to the marker element for future use
				markerElement.dataset.locationId = locationId;
				markerElement.classList.add('bounce');
				// remove animation after it ends
				markerElement.addEventListener(
					'animationend',
					() => {
						markerElement.classList.remove('bounce');
					},
					{ once: true }
				);
			}
		}, 0);
	};

	// Handle click on a location
	const handleClick = async (e: {
		latlng: L.LatLng;
		layer?: { properties: { gid?: number; id?: number, label_en?: string, label_fr?: string } };
	}) => {
		if (onLocationModalOpen) {
			const { latlng, layer } = e;
			const locationByCoords = await fetchLocationByCoords(latlng);

			// get location data for recent locations and markers
			const locationId = locationByCoords?.geo_id ?? `${locationByCoords?.lat}|${locationByCoords?.lng}`;
			const locationTitle = layer?.properties?.label_en ?? locationByCoords?.title;

			handleLocationMarkerChange(locationId, locationTitle, latlng);

			// Get feature id
			const { gid, id } = e?.layer?.properties ?? {};
			const featureId = getFeatureId({ gid, id });
			if (!featureId) {
				return;
			}

			// Handle click on details button of a location (to open the chart panel)
			const handleDetailsClick = async () => {
				if(onLocationModalClose) {
					onLocationModalClose();
				}

				const chartData = await generateChartData({
					latlng,
					variable: climateVariable?.getThreshold() ?? '',
					frequency: climateVariable?.getFrequency() ?? '',
					dataset: climateVariable?.getVersion() ?? '',
				});

				togglePanel(
					<LocationInfoPanel
						title={locationTitle}
						data={chartData}
					/>,
					{
						position: {
							left: remToPx(SIDEBAR_WIDTH),
							right: 0,
							bottom: 0,
						},
						direction: 'bottom',
					}
				);
			}

			// Open location modal
			onLocationModalOpen(
				<LocationModalContent
					title={locationTitle}
					latlng={latlng}
					featureId={featureId}
					onDetailsClick={handleDetailsClick}
				/>
			);
		}
	};

	const handleOver = (e: {
		latlng: L.LatLng;
		layer: { properties: { gid?: number; id?: number } };
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

		layerInstanceRef.current.setFeatureStyle(featureId, {
			fill: true,
			fillColor:
				interactiveRegion === InteractiveRegionOption.GRIDDED_DATA
					? '#fff'
					: getColor(featureId),
			fillOpacity:
				interactiveRegion === InteractiveRegionOption.GRIDDED_DATA
					? 0.2
					: 1,
			weight: 1.5,
			color: '#fff',
		});
	};

	const handleOut = () => {
		if (!layerInstanceRef.current) {
			return;
		}

		if (hoverTimeoutRef.current) {
			clearTimeout(hoverTimeoutRef.current);
		}

		if (hoveredRef.current !== null) {
			layerInstanceRef.current.resetFeatureStyle(hoveredRef.current);
			hoveredRef.current = null;
		}
	};

	return {
		handleClick,
		handleOver,
		handleOut,
	};
};
