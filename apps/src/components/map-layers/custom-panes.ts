import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { MAP_CONFIG } from '@/config/map.config';

/**
 * Component that creates the custom Leaflet map panes for the layers of our map.
 */
export default function CustomPanesLayer(): null {
	const map = useMap();

	useEffect(() => {
		// Target the main leaflet-map-pane element
		const mapPane = map.getPane('mapPane');
		if (mapPane) {
			mapPane.classList.add('z-20');
		}

		// Clear any existing custom panes to prevent duplicates
		const existingPanes = [
			'basemap',
			'raster',
			'grid',
			'landmassMask',
			'labels',
			'stations',
			'custom_shapefile',
		];

		existingPanes.forEach(pane => {
			if (map.getPane(pane)) {
				map.getPane(pane)!.remove();
			}
		});

		map.createPane('basemap');
		map.getPane('basemap')!.style.zIndex = String(MAP_CONFIG.standardPanes.basemap);
		map.getPane('basemap')!.style.pointerEvents = 'none';

		map.createPane('raster');
		map.getPane('raster')!.style.zIndex = String(MAP_CONFIG.standardPanes.raster);
		map.getPane('raster')!.style.pointerEvents = 'none';

		map.createPane('grid');
		map.getPane('grid')!.style.zIndex = String(MAP_CONFIG.standardPanes.grid);
		map.getPane('grid')!.style.pointerEvents = 'all';

		// Marine data landmass layer (with transparent oceans)
		map.createPane('landmassMask');
		map.getPane('landmassMask')!.style.zIndex = String(MAP_CONFIG.standardPanes.landmassMask);
		map.getPane('landmassMask')!.style.pointerEvents = 'none';

		map.createPane('labels');
		map.getPane('labels')!.style.zIndex = String(MAP_CONFIG.standardPanes.labels);
		map.getPane('labels')!.style.pointerEvents = 'none';

		map.createPane('stations');
		map.getPane('stations')!.style.zIndex = String(MAP_CONFIG.standardPanes.stations);
		map.getPane('stations')!.style.pointerEvents = 'all';

		map.createPane('custom_shapefile');
		map.getPane('custom_shapefile')!.style.zIndex = String(MAP_CONFIG.standardPanes.custom_shapefile);
		map.getPane('custom_shapefile')!.style.pointerEvents = 'all';

	}, [map]);

	return null;
}
