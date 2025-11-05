import type { ColourMap } from '@/types/types';

/**
 * Example ColourMap as returned by useColorMap hook when it's a multi-band legend (e.g. in S2D forecasts).
 *
 * CONSUMED BY: {@link transformColorMapToMultiBandLegend} → {@link MapLegendInnerS2D}
 * NOT COMPATIBLE WITH: {@link MapLegendControl}
 *
 * This represents the transformed response from GeoServer's GetLegendGraphic endpoint.
 * The data structure is used across multiple components and transformations.
 *
 * "quantity" is a 4-digit number where each position has its role.
 *
 * Format: GXYY
 * - G (1st digit): Grouping/layer index (1-9)
 * - X (2nd digit): Must be 0 or 1 (represents hundreds place of percentage, allowing 0-100%)
 * - YY (3rd-4th digits): Tens and ones place of percentage value
 *
 * Examples:
 * - 1040 → Group 1, 40%
 * - 1090 → Group 1, 90%
 * - 1100 → Group 1, 100%
 * - 2050 → Group 2, 50%
 * - 3080 → Group 3, 80%
 *
 * Invalid examples:
 * - 1200 → Invalid (2nd digit is 2, would represent 200%)
 * - 1340 → Invalid (2nd digit is 3, would represent 340%)
 *
 * Each grouping represents a separate visualization band (e.g., "Above", "Near", "Below")
 * and all groupings must share the same percentage scale. The first color in each
 * grouping (#FFFFFF) acts as a placeholder and is excluded from the final visualization.
 *
 * @see useColorMap (`@/hooks/use-color-map`) - Hook that fetches and transforms this data
 * @see transformColorMapToMultiBandLegend (`@/lib/multi-band-legend`) - Transforms GXYY format
 * @see MapLegendInnerS2D (`@/components/map-layers/map-legend-inner-s2d`) - Horizontal multi-band legend renderer
 */
export const EXAMPLE_COLOR_MAP_3_BANDS: ColourMap = {
	colours: [
		'#FFFFFF',
		/* Will get into "Line 1" */
		//  40%
		'#FDD0BB',
		'#FBAD94',
		'#F88B6E',
		'#F26A49',
		'#E54E29',
		// 100%
		'#C73518',

		'#FFFFFF',
		/* Will get into "Line 2" */
		'#E5E5E5',
		'#D0D0D0',
		'#BABABA',
		'#A5A5A5',
		'#8F8F8F',
		'#7A7A7A',

		'#FFFFFF',
		/* Will get into "Line 3" */
		'#D4E8F5',
		'#B5D9EE',
		'#96CAE7',
		'#77BBE0',
		'#58ACD9',
		'#3A9DD2',
	],
	/* prettier-ignore-start */
	quantities: [
		// Line 1 - The Red gradient (labelled: "Below" in S2D Forecasts)
		// 40%  50%   60%   70%   80%   90%  100%
		1040, 1050, 1060, 1070, 1080, 1090, 1100,
		// |    |     |     |     |     |     |
		// └────┴─────┴─────┴─────┴─────┴─────┘
		// ^                                 ^
		// Left mark                 Right mark

		// Line 2 - The Gray gradient (labelled: "Near" in S2D Forecasts)
		//      40%   50%   60%   70%   80%   90%  100%
		2040, 2050, 2060, 2070, 2080, 2090, 2100,

		// Line 3 - The Blue gradient (labelled: "Above" in S2D Forecasts)
		//      40%   50%   60%   70%   80%   90%  100%
		3040, 3050, 3060, 3070, 3080, 3090, 3100,
	],
	/* prettier-ignore-end */
	// ...
} as ColourMap;

/**
 * Example ColourMap for single-gradient discrete legend.
 *
 * This format represents a single continuous or discrete color scale
 * WITHOUT groupings. Used for data that doesn't need multi-band visualization.
 *
 * Key differences from multi-band format:
 * - Quantities are actual data values (can be negative, decimal, any range)
 * - No GXYY encoding pattern
 * - No grouping structure (1000s, 2000s, 3000s)
 * - No placeholder colors
 * - Direct 1:1 mapping of values to colors
 *
 * Note: This format is NOT compatible with transformColorMapToMultiBandLegend.
 * It requires a different rendering approach for single-gradient legends.
 *
 * @see useColorMap (`@/hooks/use-color-map`) - Hook that can return this format OR multi-band format
 */
export const EXAMPLE_COLOR_MAP_DISCRETE_SINGLE: ColourMap = {
	colours: [
		//  -150
		'#053061',
		//  -117.7
		'#2166AC',
		'#4393C3',
		'#92C5DE',
		'#D1E5F0',
		'#FBF8BF',
		'#FDDBC7',
		'#F4A582',
		'#D6604D',
		'#B2182B',
		'#67001F',
	],
	quantities: [
		-150,
		-116.7,
		-83.3,
		-50,
		-16.7,
		// Zero
		 16.7,
		 50,
		 83.3,
		 116.7,
		 150,
		 22500,
	],
	// ...
} as ColourMap;
