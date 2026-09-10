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

		/**
		 * `legendData` can hold the response for the layer we just left.
		 * GeoServer echoes layerName without the CDC: prefix, so strip it before comparing
		 * and use this comparison to determine if the legend data matches the current layer.
		 * See `layerValue` in `climate-variable-base.ts` and `s2d-climate-variable.ts`.
		 *
		 * To detect during a re-execution if data is ready these two has to be matching.
		 * Anytime the layer names match, the data is considered ready,
		 * otherwise, return `null` to signal React renderer pass to notice the value change.
		 */
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
