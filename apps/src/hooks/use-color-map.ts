import { useContext, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useClimateVariable } from '@/hooks/use-climate-variable';
import { generateColourScale } from '@/lib/colour-scheme';
import SectionContext from '@/context/section-provider';
import { DEFAULT_COLOUR_SCHEMES } from '@/lib/constants';
import { fetchLegendData } from '@/services/services';
import { setLegendData } from '@/features/map/map-slice';
import { ColourMap, ColourSchemeType } from '@/types/types';

export function useColorMap() {
	const dispatch = useAppDispatch();
	const { legendData } = useAppSelector((state) => state.map);
	const { climateVariable } = useClimateVariable();
	const section = useContext(SectionContext);
	const colorScheme = climateVariable?.getColourScheme();
	const scenario = climateVariable?.getScenario();
	const layerValue = climateVariable?.getLayerValue(scenario, section);
	const layerStyles = climateVariable?.getLayerStyles();

	useEffect(() => {
		const abortController = new AbortController();

		(async () => {
			const data = await fetchLegendData(
				layerValue,
				layerStyles,
				{ signal: abortController.signal },
			);

			if (data && !abortController.signal.aborted) {
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

		// legendData can still hold the previous layer's response while a new
		// fetch is in flight for the layer the user just selected. GeoServer
		// echoes the requested layer back as Legend[0].layerName, so compare
		// it against the layer we currently want, and treat a mismatch the
		// same as no data yet, rather than transform a response that belongs
		// to a different layer.
		//
		// GeoServer's response omits the "CDC:" workspace prefix that every
		// layer name in this app is built with (see getLayerValue in
		// climate-variable-base.ts and s2d-climate-variable.ts), so strip it
		// from layerValue before comparing.
		if (legendData.Legend[0]?.layerName !== layerValue?.replace(/^CDC:/, '')) {
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

	}, [colorScheme, legendData, layerValue]);

	return { colorMap };
}
