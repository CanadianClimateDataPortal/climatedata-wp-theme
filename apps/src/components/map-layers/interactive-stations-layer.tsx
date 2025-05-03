/**
 * Component that adds interaction to the map depending on the selected region (gridded data, watershed, health, census).
 */
import React, { useEffect, useState } from 'react';
import 'leaflet.vectorgrid';

import { fetchStationsList } from '@/services/services';

interface InteractiveStationsLayerProps {
	onLocationModalOpen: (content: React.ReactNode) => void;
	onLocationModalClose: () => void;
}

interface Station {
	id: string;
	name: string;
	coordinates: {
		latitude: number;
		longitude: number;
	}
}

const InteractiveStationsLayer: React.FC<InteractiveStationsLayerProps> = () => {
	const [stations, setStations] = useState<Station[]>([]);

	useEffect(() => {
		const fetchStations = async () => {
			try {
				const stationsList = await fetchStationsList();
				setStations(stationsList);
				console.log(stations);
			} catch (error) {
				console.error('Error fetching stations list:', error);
			}
		};

		fetchStations();
	}, []);

	return null;
};

export default InteractiveStationsLayer;