/**
 * Hook that returns event handlers for interactive map layers.
 */
import React, { useRef } from 'react';
import L from 'leaflet';

import LocationInfoPanel from '@/components/map-info/location-info-panel';
import { LocationModalContent } from '@/components/map-layers/location-modal-content';

import { useAnimatedPanel } from '@/hooks/use-animated-panel';

import { remToPx } from '@/lib/utils';
import { fetchLocationByCoords, generateChartData, } from '@/services/services';
import { SIDEBAR_WIDTH } from '@/lib/constants';
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

	const getFeatureId = (properties: {
		gid?: number;
		id?: number;
	}): number | null => {
		return properties.gid ?? properties.id ?? null;
	};

	// Handle click on a location
	const handleClick = async (e: {
		latlng: L.LatLng;
		layer: { properties: { gid?: number; id?: number } };
	}) => {
		if (onLocationModalOpen) {
			// Get feature id
			const featureId = getFeatureId(e.layer.properties);
			if (!featureId) {
				return;
			}

			const { latlng } = e;
			const locationByCoords = await fetchLocationByCoords(latlng);

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
						title={locationByCoords.title}
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
					title={locationByCoords.title}
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
		const interactiveRegion = climateVariable?.getInteractiveRegion() ?? InteractiveRegionOption.GRIDDED_DATA;

		layerInstanceRef.current.setFeatureStyle(featureId, {
			fill: true,
			fillColor: interactiveRegion === InteractiveRegionOption.GRIDDED_DATA ? '#fff' : getColor(featureId),
			fillOpacity: interactiveRegion === InteractiveRegionOption.GRIDDED_DATA ? 0.2 : 1,
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
