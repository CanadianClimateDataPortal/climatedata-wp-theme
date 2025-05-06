import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { MAP_CONFIG } from '@/config/map.config';

/**
 * CustomPanesLayer Component
 *
 * This component modifies the map instance creating predefined panes for different types of layers.
 * It supports two rendering modes:
 * - standard: normal z-index ordering with basemap at bottom
 * - seaLevel: complex ordering with multiple basemaps for sea level visualization
 *
 * @param {Object} props
 * @param {('standard'|'seaLevel')} [props.mode='standard'] - The pane mode to use
 * @returns {null}
 */
export default function CustomPanesLayer({ mode = 'standard' }: { mode?: 'standard' | 'seaLevel' } = {}): null {
	const map = useMap();

	useEffect(() => {
		// Target the main leaflet-map-pane element
		const mapPane = map.getPane('mapPane');
		if (mapPane) {
			mapPane.classList.add('z-20');
		}

		// Clear any existing custom panes to prevent duplicates
		const existingPanes = ['basemap', 'raster', 'grid', 'labels', 'stations', 'custom_shapefile', 
			'standardBasemap', 'seaLevelBasemap'];
		
		existingPanes.forEach(pane => {
			if (map.getPane(pane)) {
				map.getPane(pane)!.remove();
			}
		});

		if (mode === 'standard') {
			// Standard map panes - basemap at bottom, then raster, grid, labels, etc.
			map.createPane('basemap');
			map.getPane('basemap')!.style.zIndex = String(MAP_CONFIG.standardPanes.basemap);
			map.getPane('basemap')!.style.pointerEvents = 'none';

			map.createPane('raster');
			map.getPane('raster')!.style.zIndex = String(MAP_CONFIG.standardPanes.raster);
			map.getPane('raster')!.style.pointerEvents = 'none';

			map.createPane('grid');
			map.getPane('grid')!.style.zIndex = String(MAP_CONFIG.standardPanes.grid);
			map.getPane('grid')!.style.pointerEvents = 'all';

			map.createPane('labels');
			map.getPane('labels')!.style.zIndex = String(MAP_CONFIG.standardPanes.labels);
			map.getPane('labels')!.style.pointerEvents = 'none';

			map.createPane('stations');
			map.getPane('stations')!.style.zIndex = String(MAP_CONFIG.standardPanes.stations);
			map.getPane('stations')!.style.pointerEvents = 'all';

			map.createPane('custom_shapefile');
			map.getPane('custom_shapefile')!.style.zIndex = String(MAP_CONFIG.standardPanes.custom_shapefile);
			map.getPane('custom_shapefile')!.style.pointerEvents = 'all';
		} 
		else {
			// Sea level with standard map underneath
			
			// Standard basemap (complete world map at the bottom)
			map.createPane('standardBasemap');
			map.getPane('standardBasemap')!.style.zIndex = String(MAP_CONFIG.combinedSeaLevelPanes.standardBasemap);
			map.getPane('standardBasemap')!.style.pointerEvents = 'none';
			
			// Raster layer for sea level data
			map.createPane('raster');
			map.getPane('raster')!.style.zIndex = String(MAP_CONFIG.combinedSeaLevelPanes.raster);
			map.getPane('raster')!.style.pointerEvents = 'none';
			
			// Grid for interactive regions
			map.createPane('grid');
			map.getPane('grid')!.style.zIndex = String(MAP_CONFIG.combinedSeaLevelPanes.grid);
			map.getPane('grid')!.style.pointerEvents = 'all';
			
			// Sea level landmass layer (with transparent oceans)
			map.createPane('seaLevelBasemap');
			map.getPane('seaLevelBasemap')!.style.zIndex = String(MAP_CONFIG.combinedSeaLevelPanes.seaLevelBasemap);
			map.getPane('seaLevelBasemap')!.style.pointerEvents = 'none';
			
			// Labels layer on top
			map.createPane('labels');
			map.getPane('labels')!.style.zIndex = String(MAP_CONFIG.combinedSeaLevelPanes.labels);
			map.getPane('labels')!.style.pointerEvents = 'none';
			
			// Custom shapefile layer (if needed)
			map.createPane('custom_shapefile');
			map.getPane('custom_shapefile')!.style.zIndex = String(MAP_CONFIG.combinedSeaLevelPanes.custom_shapefile);
			map.getPane('custom_shapefile')!.style.pointerEvents = 'all';
		}
	}, [map, mode]);

	return null;
}