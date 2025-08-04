import { ColourMap } from '@/types/types';
import { findCeilingIndex } from '@/lib/utils';
import chroma from 'chroma-js';

/**
 * Generates a colour scale with a specified number of steps.
 *
 * @param steps Number of steps or intervals for the colour scale. Must be greater than 0.
 * @param colors An ordered list of colours for the gradient. Must contain at least one colour.
 * @return An array of hexadecimal colours (strings) creating the colour scale.
 */
export function generateColourScale(steps: number, colors: string[]): string[] {
	if (steps <= 0 || colors.length === 0) {
		return [];
	}

	if (steps === 1) {
		return [colors[0]];
	}

	const colorScale = chroma.scale(colors);

	return Array.from({ length: steps }, (_, index) => {
		const normalizedValue = index / (steps - 1);
		return colorScale(normalizedValue).hex();
	});
}

/**
 * Returns the colour in the colourMap matching the specified value.
 *
 * @param value  The numerical value for which to get the color
 * @param colourMap The ColourMap, containing colours and associated values
 * @param isDiscrete If true, the nearest (ceiling) exact colour in the colourMap will be returned
 *                   for the value. If false, interpolation will be done.
 * @return  The resulting colour as a hexadecimal string.
 */
export function getColour(value: number, colourMap: ColourMap, isDiscrete: boolean): string {
	const minValue = colourMap.quantities[0];
	const maxValue = colourMap.quantities[colourMap.quantities.length - 1];

	if (value < minValue) {
		return colourMap.colours[0];
	}

	if (value > maxValue) {
		return colourMap.colours[colourMap.colours.length - 1];
	}

	if (isDiscrete) {
		const index = findCeilingIndex(colourMap.quantities, value);
		return colourMap.colours[index];
	}

	const colorScale = chroma.scale(colourMap.colours).domain(colourMap.quantities);

	return colorScale(value).hex();
}
