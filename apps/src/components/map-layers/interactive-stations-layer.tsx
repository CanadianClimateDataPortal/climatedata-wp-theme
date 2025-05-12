import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useClimateVariable } from '@/hooks/use-climate-variable';
import { fetchStationsList, fetchMSCClimateNormalsChartData } from '@/services/services';
import { LocationModalContent } from './location-modal-content';
import { Station } from '@/types/types';
import { useAnimatedPanel } from '@/hooks/use-animated-panel';
import LocationInfoPanel from '@/components/map-info/location-info-panel';
import { remToPx } from '@/lib/utils';
import { SIDEBAR_WIDTH } from '@/lib/constants';

import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

interface InteractiveStationsLayerProps {
	selectable?: boolean;
	onLocationModalOpen?: (content: React.ReactNode) => void;
	onLocationModalClose?: () => void;
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

const InteractiveStationsLayer = forwardRef<{
	clearSelection: () => void;
}, InteractiveStationsLayerProps>(({ selectable = false, onLocationModalOpen, onLocationModalClose }, ref) => {
	const [stations, setStations] = useState<Station[]>([]);

	const { climateVariable, addSelectedPoints, removeSelectedPoint, resetSelectedPoints } = useClimateVariable();
	const { togglePanel } = useAnimatedPanel();

	const map = useMap();
	const layerGroupRef = useRef<L.MarkerClusterGroup | null>(null);
	const markerRefs = useRef<Record<string, L.CircleMarker>>({});

	// Fetch stations list on mount
	useEffect(() => {
		fetchStationsList().then(setStations);
	}, []);

	const selectedIds = React.useMemo(
		() => Object.keys(climateVariable?.getSelectedPoints() ?? {}).map(Number),
		[climateVariable]
	);

	useEffect(() => {
		if (!stations.length) return;

		// Using MarkerClusterGroup to group points together as in v2
		let group: L.MarkerClusterGroup = L.markerClusterGroup();
		markerRefs.current = {};

		stations.forEach((station: Station) => {
			const marker = L.circleMarker([station.coordinates.lat, station.coordinates.lng], {
				pane: 'stations',
				...UNSELECTED_STYLE,
			});

			markerRefs.current[station.id] = marker;
			marker.bindTooltip(station.name);

			marker.on('click', () => {
				// Behavior is different when the layer is selectable or not
				if (selectable) {
					if (selectedIds.includes(Number(station.id))) {
						removeSelectedPoint(Number(station.id));
					} else {
						addSelectedPoints({ [station.id]: { lat: station.coordinates.lat, lng: station.coordinates.lng } });
					}
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
												left: remToPx(SIDEBAR_WIDTH),
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
	}, [map, stations, onLocationModalOpen, onLocationModalClose, selectable, addSelectedPoints, removeSelectedPoint, selectedIds]);

	// Update marker styles when selection changes and on mount
	useEffect(() => {
		if (!markerRefs.current) return;

		selectedIds.forEach((id) => {
			const marker = markerRefs.current[id];
			if (marker) {
				marker.setStyle(SELECTED_STYLE);
			}
		});
	}, [markerRefs.current, selectedIds]);

	// Expose clearSelection to parent via ref
	useImperativeHandle(ref, () => ({
		clearSelection() {
			selectedIds.forEach((id) => {
				const marker = markerRefs.current[id];
				if (marker) {
					marker.setStyle(UNSELECTED_STYLE);
				}
			});
			resetSelectedPoints();
		}
	}), [selectedIds, resetSelectedPoints]);

	return null;
});

export default InteractiveStationsLayer;