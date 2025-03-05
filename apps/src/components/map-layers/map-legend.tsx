import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import L from 'leaflet';
import { useMap } from 'react-leaflet';

import MapLegendControl from '@/components/map-legend-control';

import { fetchLegendData } from '@/services/services';
import { TransformedLegendEntry } from '@/types/types';

const MapLegend: React.FC<{ url: string }> = ({ url }) => {
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [legendData, setLegendData] = useState<
		TransformedLegendEntry[] | null
	>(null);

	const map = useMap();

	useEffect(() => {
		(async () => {
			const data = await fetchLegendData(url);
			setLegendData(data.slice().reverse()); // reverse the data to put higher values at the top
		})();
	}, [url]);

	useEffect(() => {
		if (!legendData) {
			return;
		}

		const legend = new L.Control({ position: 'topright' });

		legend.onAdd = () => {
			const container = L.DomUtil.create(
				'div',
				'legend-wrapper top-24 right-5 m-0 !mt-1.5 z-30'
			);
			const root = createRoot(container);

			root.render(
				<MapLegendControl
					data={legendData}
					isOpen={isOpen}
					toggleOpen={() => setIsOpen((prev) => !prev)}
				/>
			);

			// prevent interactions from affecting the map
			L.DomEvent.disableClickPropagation(container);
			L.DomEvent.disableScrollPropagation(container);

			return container;
		};

		legend.addTo(map);

		return () => {
			legend.remove();
		};
	}, [map, legendData, isOpen]);

	return null;
};

export default MapLegend;
