/**
 * Hook that returns event handlers for interactive map layers.
 */
import React, { useRef, useContext, useState, useEffect } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';

import LocationInfoPanel from '@/components/map-info/location-info-panel';
import { LocationModalContent } from '@/components/map-layers/location-modal-content';

import { useAppDispatch } from '@/app/hooks';
import { useAnimatedPanel } from '@/hooks/use-animated-panel';
import { addRecentLocation } from '@/features/map/map-slice';

import { remToPx } from '@/lib/utils';
import { fetchLocationByCoords, generateChartData, } from '@/services/services';
import { MAP_MARKER_CONFIG, SIDEBAR_WIDTH } from '@/lib/constants';
import { useClimateVariable } from "@/hooks/use-climate-variable";
import { InteractiveRegionOption } from "@/types/climate-variable-interface";

import { useLocale } from '@/hooks/use-locale';
import { getDefaultFrequency } from "@/lib/utils";
import SectionContext from "@/context/section-provider";

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

// Custom layer properties
type handleOnClickMapLayerProps = {
	properties: {
		gid?: number;
		id?: number;
		name?: string;
		title?: string;
		label_en?: string;
		label_fr?: string
	}
};

export const useInteractiveMapEvents = (
	// @ts-expect-error: suppress leaflet typescript error
	layerInstanceRef: React.MutableRefObject<L.VectorGrid | null>,
	getFeatureColor: (value: number) => string,
	onLocationModalOpen?: (content: React.ReactNode) => void,
	onLocationModalClose?: () => void
) => {
	const { togglePanel } = useAnimatedPanel();
	const { climateVariable } = useClimateVariable();
	const { locale } = useLocale();
	const section = useContext(SectionContext);

	const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const hoveredRef = useRef<number | null>(null);
	const markerRef = useRef<L.Marker | null>(null);

	// --- SIDEBAR WIDTH RESPONSIVE LOGIC ---
	const [sidebarWidth, setSidebarWidth] = useState(() => {
		if (typeof window !== 'undefined') {
			return window.innerWidth < 768 ? 0 : remToPx(SIDEBAR_WIDTH);
		}
		return remToPx(SIDEBAR_WIDTH);
	});

	useEffect(() => {
		// Handler to update sidebarWidth and left style of the info panel
		function handleResize() {
			// Set sidebarWidth state based on Tailwind's md breakpoint (768px)
			setSidebarWidth(window.innerWidth < 768 ? 0 : remToPx(SIDEBAR_WIDTH));
			// Also update left style directly on the info panel wrapper if it exists
			const panel = document.querySelector('.location-info-panel-wrapper') as HTMLElement | null;
			if (panel) {
				// Set the left position to match the sidebarWidth for correct alignment
				panel.style.left = `${window.innerWidth < 768 ? 0 : remToPx(SIDEBAR_WIDTH)}px`;
			}
		}
		window.addEventListener('resize', handleResize);
		// Run handler once on mount to set initial state and position
		handleResize();
		// Cleanup listener on unmount
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	const dispatch = useAppDispatch();
	const map = useMap();

	const handleLocationMarkerChange = (locationId: string, locationTitle: string, latlng: L.LatLng, layer: handleOnClickMapLayerProps) => {
		const previousLocationTitle = markerRef.current?.getTooltip()?.getContent();

		// when the marker is already in the same region, do nothing
		if (previousLocationTitle === locationTitle) {
			return;
		}

		// clear all existing markers from the map
		map.eachLayer(layer => {
			if (layer instanceof L.Marker) {
				map.removeLayer(layer);
			}
		});

		// a single marker is allowed at a time
		if (markerRef.current) {
			markerRef.current.removeFrom(map);
		}

		// marker click handler
		const markerOnClick = {
			latlng: latlng,
			layer: layer
		}

		// add new marker to the map
		markerRef.current = L.marker(latlng, MAP_MARKER_CONFIG)
		.bindTooltip(locationTitle, {
			direction: 'top',
			offset: [0, -30],
		})
		.on('click', async () => {
			try {
				await handleClick(markerOnClick);
			} catch (err) {
				console.error('Error in click handler:', err);
			}
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
		layer: handleOnClickMapLayerProps;
	}) => {
		const locationByCoords = await fetchLocationByCoords(e.latlng);

		// get location data for recent locations and markers
		const locationId = locationByCoords?.geo_id ?? `${locationByCoords?.lat}|${locationByCoords?.lng}`;
		const locationTitle = e.layer?.properties?.label_en ?? locationByCoords?.title;

		handleLocationMarkerChange(locationId, locationTitle, e.latlng, e.layer);

		// Get feature id
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
							left: sidebarWidth,
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
					featureId={featureId}
					onDetailsClick={handleDetailsClick}
				/>
			);
		}
	};

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

		layerInstanceRef.current.setFeatureStyle(featureId, {
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
