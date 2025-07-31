import { useContext, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useClimateVariable } from '@/hooks/use-climate-variable';
import { generateColourScale } from '@/lib/colour-scheme';
import SectionContext from '@/context/section-provider';
import { DEFAULT_COLOUR_SCHEMES, GEOSERVER_BASE_URL } from '@/lib/constants';
import { fetchLegendData } from '@/services/services';
import { setLegendData } from '@/features/map/map-slice';
import { ColourMap, ColourSchemeType } from '@/types/types';

export function useColorMap() {
	const dispatch = useAppDispatch();
	const { legendData } = useAppSelector((state) => state.map);
	const {climateVariable} = useClimateVariable();
	const section = useContext(SectionContext);
	const colorScheme = climateVariable?.getColourScheme();
	const scenario = climateVariable?.getScenario();
	const layerValue = climateVariable?.getLayerValue(scenario, section);
	const layerStyles = climateVariable?.getLayerStyles();

	useEffect(() => {
		const abortController = new AbortController();
		let url = `${GEOSERVER_BASE_URL}/geoserver/wms?service=WMS&version=1.1.0&request=GetLegendGraphic&format=application/json&layer=${layerValue}`;

		if (layerStyles) {
			url += `&style=${layerStyles}`;
		}

		(async () => {
			const data = await fetchLegendData(url, {signal: abortController.signal});

			if (!abortController.signal.aborted) {
				// store in redux
				dispatch(setLegendData(data));
			}
		})();

		return () => {
			abortController.abort();
		}
	}, [layerValue, layerStyles, dispatch]);

	const colorMap = useMemo<null | ColourMap>(() => {
		if (!legendData || !legendData.Legend) {
			return null;
		}

		const isCustomScheme = colorScheme && colorScheme in DEFAULT_COLOUR_SCHEMES;
		const legendColourMapEntries = legendData.Legend[0]?.rules?.[0]?.symbolizers?.[0]?.Raster?.colormap?.entries ?? [];
		const values = legendColourMapEntries.map((entry) => Number(entry.quantity))
		let colours = legendColourMapEntries.map((entry) => entry.color);
		let type = ColourSchemeType.SEQUENTIAL;
		let isDivergent = false;

		if (isCustomScheme) {
			const customScheme = DEFAULT_COLOUR_SCHEMES[colorScheme];
			type = customScheme.type;
			isDivergent = customScheme.isDivergent ?? false;
			colours = generateColourScale(values.length, customScheme.colours);
		}

		return {
			colours,
			quantities: values,
			type,
			isDivergent,
		} as ColourMap;

	}, [colorScheme, legendData]);

	return { colorMap };
}
