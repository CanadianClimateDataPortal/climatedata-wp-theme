import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useClimateVariable } from '@/hooks/use-climate-variable';
import { fetchStationsList } from '@/services/services';
import { LocationModalContent } from './location-modal-content';
import { Station } from '@/types/types';
import ReactDOMServer from 'react-dom/server';
import {
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
	type?: string;
	selectable?: boolean;
	onLocationModalOpen?: (content: React.ReactNode) => void;
	onLocationModalClose?: () => void;
	stationTypes?: string[];
	onStationSelect?: (station: { id: string, name: string }) => void;
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
}, InteractiveStationsLayerProps>(({ selectable = false, onLocationModalOpen, onLocationModalClose, type, stationTypes, onStationSelect, onStationsLoaded }, ref) => {
	const [stations, setStations] = useState<Station[]>([]);

	const { climateVariable, addSelectedPoints, removeSelectedPoint, resetSelectedPoints } = useClimateVariable();

	const map = useMap();
	const layerGroupRef = useRef<L.MarkerClusterGroup | null>(null);
	const markerRefs = useRef<Record<string, L.Marker | L.CircleMarker>>({});

	// Fetch stations list on mount
	useEffect(() => {
		fetchStationsList({ type }).then(stations => {
			setStations(stations);
			if (typeof onStationsLoaded === 'function') {
				onStationsLoaded(stations);
			}
		});
	}, [type, onStationsLoaded]);

	const selectedIds = React.useMemo(
		() => Object.keys(climateVariable?.getSelectedPoints() ?? {}).map(Number),
		[climateVariable]
	);

	useEffect(() => {
		if (!stations.length) return;

		// Using MarkerClusterGroup to group points together as in v2
		let group: L.MarkerClusterGroup = L.markerClusterGroup();
		markerRefs.current = {};

		let filteredStations = stations;
		if (type === 'ahccd') {
			if (stationTypes && stationTypes.length === 0) {
				filteredStations = [];
			} else if (stationTypes && stationTypes.length > 0) {
				filteredStations = stations.filter((station: any) => stationTypes.includes(station.type));
			}
		}

		filteredStations.forEach((station: any) => {
			let marker: L.Marker | L.CircleMarker | undefined;
			const isSelected = selectedIds.includes(Number(station.id));
			if (type === 'ahccd') {
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
				if (selectable) {
					if (selectedIds.includes(Number(station.id))) {
						removeSelectedPoint(Number(station.id));
					} else {
						addSelectedPoints({ [station.id]: { lat: station.coordinates.lat, lng: station.coordinates.lng, name: station.name } });
					}
				} else if (onLocationModalOpen) {
					onLocationModalOpen(
						<LocationModalContent
							title={station.name}
							latlng={L.latLng(station.coordinates.lat, station.coordinates.lng)}
							featureId={Number(station.id) || 0}
							onDetailsClick={() => {
								if (onLocationModalClose) onLocationModalClose();
							}}
						/>
					);
				} else if (typeof onStationSelect === 'function') {
					onStationSelect({ id: station.id, name: station.name });
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
	}, [map, stations, onLocationModalOpen, onLocationModalClose, selectable, addSelectedPoints, removeSelectedPoint, selectedIds, type, stationTypes, onStationSelect]);

	// Update marker styles when selection changes and on mount
	useEffect(() => {
		if (!markerRefs.current) return;
		if (type === 'ahccd') return; // AHCCD icons don't use style changes
		selectedIds.forEach((id) => {
			const marker = markerRefs.current[id];
			if (marker && marker instanceof L.CircleMarker) {
				marker.setStyle(SELECTED_STYLE);
			}
		});
	}, [markerRefs.current, selectedIds, type]);

	// Expose clearSelection to parent via ref
	useImperativeHandle(ref, () => ({
		clearSelection() {
			if (type === 'ahccd') {
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
	}), [selectedIds, resetSelectedPoints, type]);

	return null;
});

export default InteractiveStationsLayer;