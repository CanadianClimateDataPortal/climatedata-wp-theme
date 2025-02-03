import { useMap } from 'react-leaflet';
import * as L from 'leaflet';
import { useEffect } from 'react';

const GridLayer = () => {
	const map = useMap();

	useEffect(() => {
		// Define a custom grid layer
		const gridLayer = L.GridLayer.extend({
			createTile: function (coords: L.Coords) {
				const tile = document.createElement('div');
				tile.style.outline = '1px solid rgba(0, 0, 0, 0.2)';
				tile.style.background = 'transparent';
				tile.style.width = '256px';
				tile.style.height = '256px';

				// Add event listener for interaction
				tile.addEventListener('click', () => {
					console.log('Grid cell clicked:', coords);
					tile.style.background = 'rgba(0, 128, 0, 0.3)'; // Example: change background to indicate selection
				});

				return tile;
			},
		});

		// Add the grid layer to the map
		const grid = new gridLayer();
		grid.addTo(map);

		return () => {
			map.removeLayer(grid); // Clean up the layer on component unmount
		};
	}, [map]);

	return null;
};

export default GridLayer;
