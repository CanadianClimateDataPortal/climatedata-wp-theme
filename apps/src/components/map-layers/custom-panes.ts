import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

interface CustomPanesDefinition {
	[key: string]: {
		classList?: string[];
	};
}

const customPanes: CustomPanesDefinition = {
	basemap: {
		classList: ['z-[100]', 'pointer-events-none'],
	},
	raster: {
		classList: ['z-[200]', 'pointer-events-none'],
	},
	aboveRaster: {
		classList: ['z-[300]', 'pointer-events-none'],
	},
	grid: {
		classList: ['z-[400]'],
	},
	aboveGrid: {
		classList: ['z-[500]', 'pointer-events-none'],
	},
	labels: {
		classList: ['z-[600]', 'pointer-events-none'],
	},
	stations: {
		classList: ['z-[700]'],
	},
	custom_shapefile: {
		classList: ['z-[800]'],
	},
};

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

		Object.entries(customPanes).forEach(([paneName, configuration]) => {
			if (!map.getPane(paneName)) {
				const { classList } = configuration;
				const pane = map.createPane(paneName);

				if (classList) {
					pane.classList.add(...classList);
				}
			}
		});
	}, [map]);

	return null;
}
