import { ColourMap } from '@/types/types';
import { findCeilingIndex } from '@/lib/utils';
import chroma from 'chroma-js';

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
