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
import { useAppSelector } from '@/app/hooks';

const MapLegend: React.FC = () => {
	const [isOpen, setIsOpen] = useState<boolean>(false);

	const map = useMap();
	const { locale } = useLocale();
	const { climateVariable } = useClimateVariable();
	const { colorMap } = useColorMap();

	const { legendData } = useAppSelector((state) => state.map);
	const colourScheme = climateVariable?.getColourScheme();
	const isDelta = climateVariable?.getDataValue() === 'delta';
	const unit = climateVariable?.getUnitLegend();
	const legendConfig = climateVariable?.getLegendConfig(isDelta ? MapDisplayType.DELTA : MapDisplayType.ABSOLUTE);
	let isCategorical = climateVariable?.getColourType() !== ColourType.CONTINUOUS;

	// For the default colour palette, isCategorical defaults to the default legend's type
	if ((colourScheme === null || colourScheme === 'default') && legendData && legendData.Legend) {
		const type = legendData.Legend[0]?.rules?.[0]?.symbolizers?.[0]?.Raster?.colormap?.type;
		isCategorical = (type === ColourType.DISCRETE);
	}

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
					isDelta={isDelta}
					colourType={colourType}
					unit={unit}
					legendConfig={legendConfig}
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
	}, [map, colorMap, isOpen, isCategorical, legendConfig, isDelta, unit, locale]);

	return null;
};

export default MapLegend;
