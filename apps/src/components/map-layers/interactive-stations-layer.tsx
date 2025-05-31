import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

import LocationInfoPanel from '@/components/map-info/location-info-panel';
import { useClimateVariable } from '@/hooks/use-climate-variable';
import { useIsMobile } from '@/hooks/use-mobile';
import { fetchStationsList, fetchMSCClimateNormalsChartData } from '@/services/services';
import { useAnimatedPanel } from '@/hooks/use-animated-panel';
import { LocationModalContent } from './location-modal-content';
import { remToPx } from '@/lib/utils';
import { Station } from '@/types/types';
import ReactDOMServer from 'react-dom/server';
import {
	SIDEBAR_WIDTH,
	AHCCD_SQUARE_ICON,
	AHCCD_TRIANGLE_ICON,
	AHCCD_CIRCLE_ICON,
	AHCCD_SQUARE_ICON_SELECTED,
	AHCCD_TRIANGLE_ICON_SELECTED,
	AHCCD_CIRCLE_ICON_SELECTED
} from '@/lib/constants';


import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

interface InteractiveStationsLayerProps {
	onLocationModalOpen?: (content: React.ReactNode) => void;
	onLocationModalClose?: () => void;
	stationTypes?: string[];
	onStationSelect?: (station: Station) => void;
	onStationsLoaded?: (stations: Station[]) => void;
}

const SELECTED_STYLE = {
	color: '#E50E40',
	weight: 2,
	fillColor: '#fff',
	fillOpacity: 1,
	radius: 6,
};

const UNSELECTED_STYLE = {
	color: '#fff',
	weight: 2,
	fillColor: '#E50E40',
	fillOpacity: 1,
	radius: 6,
};

// Helper to get SVG markup for a given AHCCD type and selection state inside the map
const getAhccdSvgMarkup = (type: string, selected: boolean) => {
	if (selected) {
		switch (type) {
			case 'T': return ReactDOMServer.renderToStaticMarkup(AHCCD_SQUARE_ICON_SELECTED);
			case 'P': return ReactDOMServer.renderToStaticMarkup(AHCCD_TRIANGLE_ICON_SELECTED);
			case 'B': default: return ReactDOMServer.renderToStaticMarkup(AHCCD_CIRCLE_ICON_SELECTED);
		}
	} else {
		switch (type) {
			case 'T': return ReactDOMServer.renderToStaticMarkup(AHCCD_SQUARE_ICON);
			case 'P': return ReactDOMServer.renderToStaticMarkup(AHCCD_TRIANGLE_ICON);
			case 'B': default: return ReactDOMServer.renderToStaticMarkup(AHCCD_CIRCLE_ICON);
		}
	}
};

const InteractiveStationsLayer = forwardRef<{
	clearSelection: () => void;
}, InteractiveStationsLayerProps>(({ onLocationModalOpen, onLocationModalClose, stationTypes, onStationSelect, onStationsLoaded }, ref) => {
	const [stations, setStations] = useState<Station[]>([]);

	const { climateVariable, addSelectedPoints, removeSelectedPoint, resetSelectedPoints } = useClimateVariable();
	const { togglePanel } = useAnimatedPanel();
	const isMobile = useIsMobile();

	const map = useMap();
	const layerGroupRef = useRef<L.MarkerClusterGroup | null>(null);
	const markerRefs = useRef<Record<string, L.Marker | L.CircleMarker>>({});

	// Fetch stations list on mount
	useEffect(() => {
		fetchStationsList({ threshold: climateVariable?.getThreshold() ?? undefined }).then(stations => {
			setStations(stations);
			if (typeof onStationsLoaded === 'function') {
				onStationsLoaded(stations);
			}
		});
	}, [onStationsLoaded]);

	const selectedIds = React.useMemo(
		() => Object.keys(climateVariable?.getSelectedPoints() ?? {}),
		[climateVariable]
	);

	useEffect(() => {
		if (!stations.length) return;

		// Using MarkerClusterGroup to group points together as in v2
		let group: L.MarkerClusterGroup = L.markerClusterGroup();
		markerRefs.current = {};

		let filteredStations = stations;
		if (stationTypes && stationTypes.length === 0) {
			filteredStations = [];
		} else if (stationTypes && stationTypes.length > 0) {
			filteredStations = stations.filter((station: Station) => station.type && stationTypes.includes(station.type));
		}

		filteredStations.forEach((station: any) => {
			let marker: L.Marker | L.CircleMarker | undefined;
			const isSelected = selectedIds.includes(station.id);
			if (stationTypes) {
				// Defensive: check coordinates
				if (
					!station.coordinates ||
					typeof station.coordinates.lat !== 'number' ||
					typeof station.coordinates.lng !== 'number'
				) {
					console.warn('Skipping station with invalid coordinates:', station);
					return;
				}
				marker = L.marker([station.coordinates.lat, station.coordinates.lng], {
					icon: L.divIcon({
						className: 'ahccd-svg-marker',
						html: getAhccdSvgMarkup(station.type, isSelected),
						iconSize: [20, 20],
						iconAnchor: [10, 10],
					}),
					pane: 'stations',
				});
			} else {
				marker = L.circleMarker([station.coordinates.lat, station.coordinates.lng], {
					pane: 'stations',
					...UNSELECTED_STYLE,
				});
			}
			if (!marker) {
				console.warn('Failed to create marker for station:', station);
				return;
			}
			markerRefs.current[station.id] = marker;
			marker.bindTooltip(station.name);
			marker.on('click', () => {
				if (typeof onStationSelect === 'function') {
					onStationSelect(station);
				} else if (onLocationModalOpen) {
					// Open the location modal with the station details
					// For MSC Climate normals 1981 - 2010

					onLocationModalOpen(
						<LocationModalContent
							title={station.name}
							latlng={L.latLng(station.coordinates.lat, station.coordinates.lng)}
							featureId={Number(station.id) || 0}
							onDetailsClick={() => {
								if (onLocationModalClose) onLocationModalClose();

								// Retrieve chart data
								const chartNormals = [
									{ name: 'daily_average_temperature', normalId: 1},
									{ name: 'daily_maximum_temperature', normalId: 5},
									{ name: 'daily_minimum_temperature', normalId: 8},
									{ name: 'precipitation', normalId: 56},
								];

								Promise.all(
									chartNormals.map((normal) =>
										fetchMSCClimateNormalsChartData(station.id, normal.normalId).then((data) => ({
											[normal.name]: data.features.slice(0, 12).map((feature: { properties: { VALUE: number } }): number => {
												return feature.properties.VALUE;
											})
										}))
									)
								).then((chartDataArray) => {
									const chartData = chartDataArray.reduce((acc, curr) => {
										return { ...acc, ...curr };
									}, {});

									togglePanel(
										<LocationInfoPanel
											title={station.name}
											latlng={L.latLng(station.coordinates.lat, station.coordinates.lng)}
											featureId={-1}
											data={chartData}
										/>,
										{
											position: {
											left: isMobile ? 0 : remToPx(SIDEBAR_WIDTH),
											right: 0,
											bottom: 0,
											},
											direction: 'bottom',
										}
									);
								});
							}}
						/>
					);
				}
			});
			group.addLayer(marker);
		});

		group.addTo(map);
		layerGroupRef.current = group;

		return () => {
			if (layerGroupRef.current) {
				map.removeLayer(layerGroupRef.current);
				layerGroupRef.current = null;
			}
		};
	}, [map, stations, onLocationModalOpen, onLocationModalClose, addSelectedPoints, removeSelectedPoint, selectedIds, stationTypes, onStationSelect]);

	// Update marker styles when selection changes and on mount
	useEffect(() => {
		if (!markerRefs.current) return;

		if (stationTypes) return; // AHCCD icons don't use style changes

		selectedIds.forEach((id) => {
			const marker = markerRefs.current[id];
			if (marker && marker instanceof L.CircleMarker) {
				marker.setStyle(SELECTED_STYLE);
			}
		});
	}, [markerRefs.current, selectedIds, stationTypes]);

	// Expose clearSelection to parent via ref
	useImperativeHandle(ref, () => ({
		clearSelection() {
			if (stationTypes) {
				// No style change for icons, but could implement icon swap if needed
				resetSelectedPoints();
			} else {
				selectedIds.forEach((id) => {
					const marker = markerRefs.current[id];
					if (marker && marker instanceof L.CircleMarker) {
						marker.setStyle(UNSELECTED_STYLE);
					}
				});
				resetSelectedPoints();
			}
		}
	}), [selectedIds, resetSelectedPoints, stationTypes]);

	return null;
});

export default InteractiveStationsLayer;