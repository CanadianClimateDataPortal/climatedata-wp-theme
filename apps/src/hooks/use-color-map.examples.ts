import type { ColourQuantitiesMap } from '@/types/types';

/**
 * @file Color Map Examples and Fixtures
 *
 * This file contains example ColourQuantitiesMap data structures for documentation,
 * testing, and Ladle component development.
 *
 * FORMAT OVERVIEW:
 * - @see EXAMPLE_COLOR_MAP_DISCRETE_SINGLE - Standard format
 * - @see EXAMPLE_COLOR_MAP_S2D_MULTIBAND - Special S2D forecast format (exception, one component only)
 */

// ============================================================================
// STANDARD FORMAT (PRIMARY - USED BY MOST OF THE APPLICATION)
// ============================================================================

/**
 * Example ColourMap for single-gradient legend (STANDARD FORMAT - MOST COMMON).
 *
 * This is the PRIMARY format used throughout the application for most climate data visualizations.
 * It represents a single continuous or discrete color scale WITHOUT groupings.
 *
 * Key characteristics:
 * - Quantities are actual data values (can be negative, decimal, any range)
 * - No GXYY encoding pattern
 * - No grouping structure (1000s, 2000s, 3000s)
 * - No placeholder colors
 * - Direct 1:1 mapping of values to colors
 *
 * Used by: Most map legends, standard climate variable visualizations
 *
 * Note: This format is NOT compatible with transformColorMapToMultiBandLegend.
 * It requires a different rendering approach for single-gradient legends.
 *
 * @see useColorMap (`@/hooks/use-color-map`) - Hook that can return this format OR multi-band format
 * @see EXAMPLE_COLOR_MAP_S2D_MULTIBAND - For the special S2D forecast exception
 */
export const EXAMPLE_COLOR_MAP_DISCRETE_SINGLE: ColourQuantitiesMap = {
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
};


// ============================================================================
// S2D MULTI-BAND FORMAT (EXCEPTION - SPECIFIC TO MapLegendInnerS2D COMPONENT)
// ============================================================================

/**
 * Example ColourQuantitiesMap for S2D Forecast multi-band legends (SPECIAL CASE - EXCEPTION).
 *
 * ⚠️ THIS IS A SPECIALIZED FORMAT used ONLY for S2D (Sub-seasonal to Decadal) forecast visualizations.
 * ⚠️ Most of the application uses EXAMPLE_COLOR_MAP_DISCRETE_SINGLE instead.
 *
 * SPECIFIC TO: MapLegendInnerS2D component (`@/components/map-layers/map-legend-inner-s2d`)
 * CONSUMED BY: {@link transformColorMapToMultiBandLegend} → {@link MapLegendInnerS2D}
 * NOT COMPATIBLE WITH: {@link MapLegendCommon}
 *
 * This represents the transformed response from GeoServer's GetLegendGraphic endpoint
 * for S2D forecasts that require displaying multiple probability bands simultaneously
 * (e.g., "Above Normal", "Near Normal", "Below Normal").
 *
 * Format: Quantities use GXYY encoding pattern
 * - G (1st digit): Grouping/outcome index (1-9) - identifies which band (e.g. Above, Near, Below)
 * - X (2nd digit): Must be 0 or 1 (represents hundreds place of percentage, allowing 0-100%)
 * - YY (3rd-4th digits): Tens and ones place of percentage value
 *
 * Examples:
 * - 1040 → Grouping 1, 40%
 * - 1090 → Grouping 1, 90%
 * - 1100 → Grouping 1, 100%
 * - 2050 → Grouping 2, 50%
 * - 3080 → Grouping 3, 80%
 *
 * Invalid examples:
 * - 1200 → Invalid (2nd digit is 2, would represent 200%)
 * - 1340 → Invalid (2nd digit is 3, would represent 340%)
 *
 * Structure requirements:
 * - Each grouping represents a separate visualization band
 * - All groupings must share the same percentage scale
 * - First color in each grouping (#FFFFFF) acts as a placeholder and is excluded from rendering
 *
 * @see useColorMap (`@/hooks/use-color-map`) - Hook that fetches and transforms this data
 * @see transformColorMapToMultiBandLegend (`@/lib/multi-band-legend`) - Transforms GXYY format
 * @see MapLegendInnerS2D (`@/components/map-layers/map-legend-inner-s2d`) - Horizontal multi-band legend renderer
 * @see EXAMPLE_COLOR_MAP_DISCRETE_SINGLE - The standard format used everywhere else
 */
export const EXAMPLE_COLOR_MAP_S2D_MULTIBAND: ColourQuantitiesMap = {
	/**
	 * The text outcome labels examples would assume receiving data from GeoServer like:
	 *
	 * @example
	 * ```ts
	 * let locationData: LocationS2DData = {
	 *   cutoff_above_normal_p66: -19.333412204398492,
	 *   cutoff_below_normal_p33: -21.157791103706977,
	 *   // ...
	 * };
	 * ```
	 *
	 * Which would tell us the following outcome labels:
	 * - Outcome 0: "Above -19"
	 * - Outcome 1: "-21 to -19"
	 * - Outcome 2: "Below -21"
	 */
	colours: [
		'#FFFFFF',
		/* Outcome 0 (or Grouping 1); labelled e.g. "Above -19" */
		//  40%
		'#FCDAC6',
		'#F6B79A',
		'#E98D70',
		'#D45E4C',
		'#BD3036',
		// 100%
		'#970F27',

		'#FFFFFF',
		/* Outcome 1 (or Grouping 2); labelled e.g. "-21 to -19" */
		'#E0E0E0',
		'#C4C4C4',
		'#A8A8A8',
		'#8C8C8C',
		'#707070',
		'#545454',

		'#FFFFFF',
		/* Outcome 2 (or Grouping 3); labelled e.g. "Below -21" */
		'#D0E4EF',
		'#A8CFE3',
		'#77B4D4',
		'#4292C2',
		'#2C75B3',
		'#175391',
	],
	/* prettier-ignore-start */
	quantities: [
		// Outcome 0
		// 40%  50%   60%   70%   80%   90%  100%
		1040, 1050, 1060, 1070, 1080, 1090, 1100,
		// |    |     |     |     |     |     |
		// └────┴─────┴─────┴─────┴─────┴─────┘
		// ^                                  ^
		// Left mark                 Right mark

		// Outcome 1
		// 40%  50%   60%   70%   80%   90%  100%
		2040, 2050, 2060, 2070, 2080, 2090, 2100,

		// Outcome 2
		// 40%  50%   60%   70%   80%   90%  100%
		3040, 3050, 3060, 3070, 3080, 3090, 3100,
	],
	/* prettier-ignore-end */
};
