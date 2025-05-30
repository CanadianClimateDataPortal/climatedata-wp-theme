import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import L from 'leaflet';
import { useMap } from 'react-leaflet';

import MapLegendControl from '@/components/map-legend-control';

import { useAppDispatch } from '@/app/hooks';
import { setLegendData } from '@/features/map/map-slice';
import { transformLegendData } from '@/lib/format';
import { getCommonPrefix } from '@/lib/utils';
import { fetchLegendData } from '@/services/services';
import { TransformedLegendEntry, WMSLegendData } from '@/types/types';
import { useClimateVariable } from '@/hooks/use-climate-variable';
import { useColorMap } from '@/hooks/use-color-map';
import { ColourType } from '@/types/climate-variable-interface';

const MapLegend: React.FC<{ url: string }> = ({ url }) => {
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [rawLegendData, setRawLegendData] = useState<WMSLegendData | null>(null);
	const [transformedLegendData, setTransformedLegendData] = useState<TransformedLegendEntry[] | null>(null);

	const map = useMap();
	const dispatch = useAppDispatch();
	const { climateVariable } = useClimateVariable();
	const { colorMap } = useColorMap();

	const isCategorical = climateVariable?.getCustomColourSchemes()?.default?.categorical ?? false;
	const customColors = climateVariable?.getCustomColourSchemes()?.default?.colours;

	// Fetch legend data from the API
	useEffect(() => {
		(async () => {
			const data = await fetchLegendData(url);

			// store in redux
			dispatch(setLegendData(data));

			setRawLegendData(data);
		})();
	}, [url, climateVariable, dispatch]);

	// This is what updates the legend colors when selecting a new color scheme
	useEffect(() => {
		if (!rawLegendData || !colorMap) return;
		(async () => {
			if (customColors) {
				const commonPrefix = getCommonPrefix(customColors.map(item => item.label))

				// Using this to get a properly typed transformed legend data
				const legendEntries = rawLegendData?.Legend?.flatMap(legend =>
					legend.rules?.flatMap(rule =>
						rule.symbolizers?.flatMap(symbolizer =>
							symbolizer.Raster?.colormap?.entries ?? []
						) ?? []
					) ?? []
				) ?? [];

				setTransformedLegendData(
					customColors.map((item, index) => ({
						label: item.label.replace(commonPrefix, ''),
						color: item.colour,
						// use these from raw legend data because the custom colors config doesn't have them
						opacity: Number(legendEntries[index]?.opacity ?? 1),
						quantities: legendEntries[index]?.quantity !== undefined ? [legendEntries[index].quantity] : [],
					})).reverse()
				);
				return
			}

			const transformedData: TransformedLegendEntry[] =
				await transformLegendData(rawLegendData, {
					...colorMap,
					schemeType: colorMap.schemeType as ColourType,
				});

			let processedData = transformedData.slice();

			if (colorMap.isDivergent && colorMap.quantities) {
				processedData = transformedData.map((entry, index) => ({
					...entry,
					label: colorMap.quantities?.[index]?.toFixed(climateVariable?.getUnitDecimalPlaces() ?? 0) ?? entry.label
				}));
			}

			setTransformedLegendData(
				processedData
					.reverse() // reverse the data to put higher values at the top
					.slice(isCategorical ? 0 : 1) // remove the first element for non categorical data
			);
		})();
	}, [rawLegendData, colorMap, isCategorical, climateVariable]);

	useEffect(() => {
		if (!transformedLegendData) {
			return;
		}

		const legend = new L.Control({ position: 'topright' });

		const colourType = climateVariable?.getColourType()
			?? rawLegendData?.Legend?.[0]?.rules?.[0]?.symbolizers?.[0]?.Raster?.colormap?.type
			?? ColourType.CONTINUOUS;

		const hasCustomScheme = Boolean(customColors);
		const unit = climateVariable?.getUnitLegend();
		legend.onAdd = () => {
			const container = L.DomUtil.create(
				'div',
				'legend-wrapper top-[9rem] md:top-24 right-5 m-0 !mt-1.5 z-30'
			);
			const root = createRoot(container);

			root.render(
				<MapLegendControl
					data={transformedLegendData ?? []}
					isOpen={isOpen}
					toggleOpen={() => setIsOpen((prev) => !prev)}
					isCategorical={isCategorical}
					hasCustomScheme={hasCustomScheme}
					colourType={colourType}
					unit={unit}
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
	}, [map, transformedLegendData, isOpen]);

	return null;
};

export default MapLegend;
