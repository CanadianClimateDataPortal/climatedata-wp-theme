import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

interface CustomPanesDefinition {
	[key: string]: {
		style: {
			[key: string]: unknown;
		}
	}
}

const customPanes: CustomPanesDefinition = {
	basemap: {
		style: { zIndex: '100', pointerEvents: 'none' },
	},
	raster: {
		style: { zIndex: '200', pointerEvents: 'none' },
	},
	aboveRaster: {
		style: { zIndex: '300', pointerEvents: 'none' },
	},
	grid: {
		style: { zIndex: '400', pointerEvents: 'all' },
	},
	aboveGrid: {
		style: { zIndex: '500', pointerEvents: 'none' },
	},
	labels: {
		style: { zIndex: '600', pointerEvents: 'none' },
	},
	stations: {
		style: { zIndex: '700', pointerEvents: 'all' },
	},
	custom_shapefile: {
		style: { zIndex: '800', pointerEvents: 'all' },
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
			const { style } = configuration;
			if (!map.getPane(paneName)) {
				const pane = map.createPane(paneName);
				Object.assign(pane.style, style);
			}
		});

	}, [map]);

	return null;
}
