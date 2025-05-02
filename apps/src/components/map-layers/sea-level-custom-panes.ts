import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

/**
 * SeaLevelCustomPanes Component
 *
 * This component modifies the map instance creating predefined panes with a custom z-index order
 * specifically for the sea-level variable, where the raster layer should be below the basemap.
 *
 * @returns {null}
 */
export default function SeaLevelCustomPanes(): null {
	const map = useMap();

	useEffect(() => {
		// target the main leaflet-map-pane element
		const mapPane = map.getPane('mapPane');
		if (mapPane) {
			mapPane.classList.add('z-20');
		}
			// Raster (ocean level) - should be at the bottom
		map.createPane('raster');
		map.getPane('raster')!.style.zIndex = '100';
		map.getPane('raster')!.style.pointerEvents = 'none';
			// Grid (interactive regions, slrgrid)
		map.createPane('grid');
		map.getPane('grid')!.style.zIndex = '150';
		map.getPane('grid')!.style.pointerEvents = 'all';

			// Basemap (Canada base map)
		map.createPane('basemap');
		map.getPane('basemap')!.style.zIndex = '200';
		map.getPane('basemap')!.style.pointerEvents = 'none';

			// Labels (location labels)
		map.createPane('labels');
		map.getPane('labels')!.style.zIndex = '250';
		map.getPane('labels')!.style.pointerEvents = 'none';


			// Custom shapefile layer (optional, stays on top if used)
		map.createPane('custom_shapefile');
		map.getPane('custom_shapefile')!.style.zIndex = '300';
		map.getPane('custom_shapefile')!.style.pointerEvents = 'all';
	}, [map]);

	return null;
}