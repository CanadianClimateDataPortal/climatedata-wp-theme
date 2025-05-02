import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { fetchStationsList } from '@/services/services';
import { LocationModalContent } from './location-modal-content';
import { Station } from '@/types/types';

import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

interface InteractiveStationsLayerProps {
	onLocationModalOpen: (content: React.ReactNode) => void;
	onLocationModalClose: () => void;
}

const InteractiveStationsLayer: React.FC<InteractiveStationsLayerProps> = ({ onLocationModalOpen, onLocationModalClose }) => {
	const map = useMap();
	const layerGroupRef = useRef<L.MarkerClusterGroup | null>(null);

	useEffect(() => {
		// @ts-ignore
		let group: L.MarkerClusterGroup = L.markerClusterGroup();

		fetchStationsList().then((stations: Station[]) => {
			stations.forEach((station: Station) => {
				const marker = L.circleMarker([station.coordinates.lat, station.coordinates.lng], {
					pane: 'stations',
					color: '#fff',
					fillColor: '#0074D9',
					fillOpacity: 1,
					radius: 6,
					weight: 2,
				});

				marker.bindTooltip(station.name);

				marker.on('click', () => {
					onLocationModalOpen(
						<LocationModalContent
							title={station.name}
							latlng={L.latLng(station.coordinates.lat, station.coordinates.lng)}
							featureId={Number(station.id) || 0}
							onDetailsClick={() => {
								if (onLocationModalClose) {
									onLocationModalClose();
								}
							}}
						/>
					);
				});

				group.addLayer(marker);
			});

			group.addTo(map);
			layerGroupRef.current = group;
		});

		return () => {
			if (layerGroupRef.current) {
				map.removeLayer(layerGroupRef.current);
				layerGroupRef.current = null;
			}
		};
	}, [map, onLocationModalOpen, onLocationModalClose]);

	return null;
};

export default InteractiveStationsLayer;