import React, { useEffect, useMemo, useState } from 'react';
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

				setTransformedLegendData(
					customColors.map(item => ({
						...item,
						label: item.label.replace(commonPrefix, ''),
						color: item.colour
					})).reverse()
				);
				return
			}

			const transformedData: TransformedLegendEntry[] =
				await transformLegendData(rawLegendData, colorMap);

			setTransformedLegendData(
				transformedData.slice()
					.reverse() // reverse the data to put higher values at the top
					.slice(isCategorical ? 0 : 1) // remove the first element for non categorical data
			);
		})();
	}, [rawLegendData, colorMap, isCategorical]);

	useEffect(() => {
		if (!transformedLegendData) {
			return;
		}

		const legend = new L.Control({ position: 'topright' });

		// TODO: need to know how to deal with custom scheme variables like "building_climate_zones",
		//  for now, we just use whatever prefix in the labels as the unit
		const hasCustomScheme = Boolean(customColors);
		const unit = hasCustomScheme
			? getCommonPrefix(customColors?.map(item => item.label))
			: climateVariable?.getUnit() || '°C';

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
