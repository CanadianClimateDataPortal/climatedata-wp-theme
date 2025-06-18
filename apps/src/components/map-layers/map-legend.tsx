import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import L from 'leaflet';
import { useMap } from 'react-leaflet';

import MapLegendControl from '@/components/map-legend-control';

import { useAppDispatch } from '@/app/hooks';
import { useAppSelector } from "@/app/hooks";
import { setLegendData, setTransformedLegendEntry } from '@/features/map/map-slice';
import { transformLegendData } from '@/lib/format';
import { getCommonPrefix } from '@/lib/utils';
import { fetchLegendData } from '@/services/services';
import { TransformedLegendEntry, WMSLegendData } from '@/types/types';
import { useClimateVariable } from '@/hooks/use-climate-variable';
import { useColorMap } from '@/hooks/use-color-map';
import { ColourType } from '@/types/climate-variable-interface';
import { useLocale } from '@/hooks/use-locale';

const MapLegend: React.FC<{ url: string; isComparisonMap?: boolean }> = ({
	url,
	isComparisonMap = false,
}) => {
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [rawLegendData, setRawLegendData] = useState<WMSLegendData | null>(null);
	const [transformedLegendData, setTransformedLegendData] = useState<TransformedLegendEntry[] | null>(null);

	const map = useMap();
	const dispatch = useAppDispatch();
	const { climateVariable } = useClimateVariable();
	const { colorMap } = useColorMap();
	const transformedLegendEntry = useAppSelector((state) => state.map.transformedLegendEntry);

	const { locale } = useLocale();
	const isDelta = climateVariable?.getDataValue() === 'delta';
	const unit = climateVariable?.getUnitLegend();
	const decimals = climateVariable?.getDecimalPlace() ?? 0;
	const colourScheme = climateVariable?.getColourScheme() ?? 'default';
	const isCategorical = climateVariable?.getCustomColourSchemes()?.default?.categorical ?? false;
	const customColors = climateVariable?.getCustomColourSchemes()?.default?.colours;
	const temporalRange = climateVariable?.getCurrentTemporalRange() ?? null;

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

			// Format legend data
			setTransformedLegendData(
				customColors.map((item, index) => ({
					label: item.label.replace(commonPrefix, ''),
					color: item.colour,
					// use these from raw legend data because the custom colors config doesn't have them
					opacity: Number(legendEntries[index]?.opacity ?? 1),
					quantities: legendEntries[index]?.quantity !== undefined ? [legendEntries[index].quantity] : [],
				})).reverse()
			);
			return;
		}

		if(isComparisonMap && climateVariable?.getId() === "sea_level" && transformedLegendEntry.length > 0) {
			setTransformedLegendData(transformedLegendEntry);
		} else {
			(async () => {
				const transformedData: TransformedLegendEntry[] =
					await transformLegendData(rawLegendData, colourScheme, temporalRange, isDelta, unit, locale, decimals, colorMap);

				if(!isComparisonMap) {
					dispatch(setTransformedLegendEntry(transformedData));
				}

				setTransformedLegendData(transformedData);
			})();
		}
	}, [rawLegendData, colourScheme, colorMap, isCategorical, climateVariable, isComparisonMap, transformedLegendEntry]);

	useEffect(() => {
		if (!transformedLegendData) {
			return;
		}

		const legend = new L.Control({ position: 'topright' });

		const colourType = climateVariable?.getColourType()
			?? rawLegendData?.Legend?.[0]?.rules?.[0]?.symbolizers?.[0]?.Raster?.colormap?.type
			?? ColourType.CONTINUOUS;

		const hasCustomScheme = Boolean(customColors);
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
					isDelta={isDelta}
					isDefaultColourScheme={colourScheme === 'default'}
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
