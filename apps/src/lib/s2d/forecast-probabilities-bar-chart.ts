
import { findCeilingIndex } from '@/lib/utils';

import type { HexColor, ProgressBarProps } from '@/types/progress-bar';
import type { ColourMap } from '@/types/types';

/**
 * Return true if two numbers are in the same thousand.
 */
const isSameThousand = (valueA: number, valueB: number): boolean =>
	Math.floor(valueA / 1000) === Math.floor(valueB / 1000);

/**
 * Return true if the given RGB colour code is white.
 *
 * @param colour - The colour code, prefixed with `#`.
 */
const isWhite = (colour: `#${string}`): boolean =>
	colour.toUpperCase() === '#FFFFFF' || colour.toUpperCase() === '#FFF';

/**
 * The way we represent the percent value and cutoff whether its value is one of the probabilities defined by the cutoffs.
 * The method of trimming decimal values to determine if the value is part of the cutoff.
 *
 * @see {@link LocationS2DData} for the cutoffs and probabilities values.
 * @see {@link getProbabilitiesBarChartColour} for how the normalized percent value is used to determine the colour of the probability bar.
 */
export const normalizeProbabilitiesBarChartPercent = (
	input: Pick<ProgressBarProps, 'percent'>,
): number => {
	return Math.round(input.percent);
};

/**
 * Given a colour map, returns the colour for a specific percentage and outcome.
 *
 * The `colorMap.quantities` defines the boundaries where colours change. For a
 * given quantity (calculated as `1000 * (outcome + 1) + percentage`), the
 * returned colour will be the one associated with the *next* boundary. In other
 * words, the boundaries serve to define the colour for values below them.
 *
 * Special cases:
 * - If the calculated quantity is above the highest boundary for the same
 *   outcome, a default colour is returned.
 * - If the determined colour is white, the next non-white colour in the same
 *   outcome is returned. If no such colour exists, a default colour is
 *   returned.
 * - If the calculated quantity is exactly on a boundary, the colour associated
 *   with the *next* boundary will be returned (in other words, a boundary
 *   quantity is exclusive).
 *   - An exception to the previous case: if the percentage is 100 *and* its
 *     calculated quantity is a boundary, the colour associated with the current
 *     boundary (not the next one) is returned. In other words, 100 is included
 *     in the range that ends at 100. If 100 is not a boundary, the above rules
 *     apply (i.e. a default colour is returned if there is no next boundary in
 *     the same outcome).
 *
 * @param outcome - Index number of the outcome (e.g. 0 for "above", 1 for "below", ...)
 * @param percentage - Percentage for which to get the colour
 * @param colorMap - The colour map containing the colours
 * @returns The colour associated with the given percentage and outcome.
 */
export const getProbabilitiesBarChartColour = (
	outcome: number,
	percentage: number,
	colorMap: ColourMap
): HexColor => {
	const colours = colorMap.colours as HexColor[];
	const defaultColor: HexColor = '#909090';
	let percentageForQuery = normalizeProbabilitiesBarChartPercent({ percent: percentage });

	/**
	 * For values falling exactly on the limit between two colors, we always
	 * use the color "on the right", except for 100, where we use the color
	 * on the left.
	 *
	 * To achieve this behavior, we add 0.1 to the (rounded) percentage
	 * (unless if 100) to ensure we always take the color on the right.
	 */
	if (percentageForQuery < 100) {
		percentageForQuery += 0.1;
	}

	// The "quantity" associated with this percentage and outcome.
	// For example, an outcome of 0 (e.g. "above") and a `percentageForQuery` of
	// 23.1 would give 1023.1
	const queryQuantity = 1000 * (outcome + 1) + percentageForQuery;

	const colourIndex = findCeilingIndex(colorMap.quantities, queryQuantity);

	// If the percentage/outcome is bigger than the highest value
	if (colourIndex === -1) {
		return defaultColor;
	}

	// If the next colour is not in the same outcome
	if (!isSameThousand(colorMap.quantities[colourIndex], queryQuantity)) {
		return defaultColor;
	}

	let colour = colours[colourIndex];

	// If the colour is white, we find the next none-white colour
	if (isWhite(colour)) {
		// First, set the colour to a default "grey", in case we don't find
		// another replacement colour.
		colour = defaultColor;

		for (let i = colourIndex + 1; i < colours.length; i++) {
			// Stop if we are now in the next outcome's colours
			if (!isSameThousand(colorMap.quantities[i], queryQuantity)) {
				break;
			}

			const nextColour = colours[i];
			if (!isWhite(nextColour)) {
				colour = nextColour;
				break;
			}
		}
	}

	return colour;
};
