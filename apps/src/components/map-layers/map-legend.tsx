import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import L from 'leaflet';
import { useMap } from 'react-leaflet';

import MapLegendControl from '@/components/map-legend-control';
import { useClimateVariable } from '@/hooks/use-climate-variable';
import { useColorMap } from '@/hooks/use-color-map';
import { ColourType } from '@/types/climate-variable-interface';
import { MapDisplayType } from '@/types/types';
import { useLocale } from '@/hooks/use-locale';

const MapLegend: React.FC = () => {
	const [isOpen, setIsOpen] = useState<boolean>(false);

	const map = useMap();
	const { locale } = useLocale();
	const { climateVariable } = useClimateVariable();
	const { colorMap } = useColorMap();

	const isDelta = climateVariable?.getDataValue() === 'delta';
	const unit = climateVariable?.getUnitLegend();
	const isCategorical = climateVariable?.getColourType() !== ColourType.CONTINUOUS;
	const legendConfig = climateVariable?.getLegendConfig(isDelta ? MapDisplayType.DELTA : MapDisplayType.ABSOLUTE);

	useEffect(() => {
		if (!colorMap) {
			return;
		}

		const legend = new L.Control({ position: 'topright' });

		const colourType = colorMap.type;

		legend.onAdd = () => {
			const container = L.DomUtil.create(
				'div',
				'legend-wrapper top-[9rem] md:top-24 right-5 m-0 !mt-1.5 z-30'
			);
			const root = createRoot(container);

			root.render(
				<MapLegendControl
					data={colorMap}
					isOpen={isOpen}
					toggleOpen={() => setIsOpen((prev) => !prev)}
					isCategorical={isCategorical}
					colourType={colourType}
					legendConfig={legendConfig}
					unit={unit}
					isDelta={isDelta}
					locale={locale}
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
	}, [map, colorMap, isOpen, isCategorical, legendConfig]);

	return null;
};

export default MapLegend;
