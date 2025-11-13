import { beforeEach, describe, expect, test } from 'vitest';
import { ColourMap, ColourSchemeType } from '@/types/types';
import { getProbabilityColour } from '@/components/map-layers/s2d-variable-values';

describe('getProbabilityColour', () => {
	let colourMap: ColourMap;
	const defaultColour = '#909090';
	const whiteColours = ['#ffffff', '#fff', '#FFFFFF', '#FFF'];

	beforeEach(() => {
		colourMap = {
			colours: [
				'#001010',
				'#001020',
				'#001030',
				'#002030',
				'#002040',
				'#002050',
				'#003020',
				'#003040',
				'#003050',
				'#003060',
			],
			quantities: [
				1010, 1020, 1030, 2030, 2040, 2050, 3020, 3040, 3050, 3060,
			],
			type: ColourSchemeType.DIVERGENT,
			isDivergent: true,
		};
	});

	test('returns correct colour if exact quantity', () => {
		const colour = getProbabilityColour(1, 40, colourMap);
		expect(colour).toEqual('#002040');
	});

	test('percentage is rounded (to lower integer)', () => {
		const colour = getProbabilityColour(2, 50.4, colourMap);
		expect(colour).toEqual('#003050');
	});

	test('percentage is rounded (to upper integer)', () => {
		const colour = getProbabilityColour(2, 50.6, colourMap);
		expect(colour).toEqual('#003060');
	});

	test('returns the next colour if less than the exact quantity (in quantity range)', () => {
		const colour = getProbabilityColour(2, 42, colourMap);
		expect(colour).toEqual('#003050');
	});

	test('returns the next colour if less than the exact quantity (below minimum quantity)', () => {
		const colour = getProbabilityColour(0, 2, colourMap);
		expect(colour).toEqual('#001010');
	});

	test('returns the default colour if greater than max of same outcome', () => {
		const colour = getProbabilityColour(1, 61, colourMap);
		expect(colour).toEqual(defaultColour);
	});

	test('returns the default colour if greater than max of last outcome', () => {
		const colour = getProbabilityColour(2, 70, colourMap);
		expect(colour).toEqual(defaultColour);
	});

	test('returns the default colour if outcome greater than max outcome', () => {
		const colour = getProbabilityColour(3, 10, colourMap);
		expect(colour).toEqual(defaultColour);
	});

	test.each(whiteColours)(
		'return next non-white if the associated colour is white (%s)',
		(whiteColour) => {
			colourMap.colours = [whiteColour, whiteColour, '#001095'];
			colourMap.quantities = [1030, 1050, 1095];
			const colour = getProbabilityColour(0, 22, colourMap);
			expect(colour).toEqual('#001095');
		}
	);

	test.each(whiteColours)(
		'return the default colour if all next colours of the same outcome are white (%s)',
		(whiteColour) => {
			colourMap.colours = [
				'#001020',
				whiteColour,
				whiteColour,
				'#002050',
			];
			colourMap.quantities = [1020, 1050, 1100, 2050];
			const colour = getProbabilityColour(0, 35, colourMap);
			expect(colour).toEqual(defaultColour);
		}
	);

	test.each(whiteColours)(
		'return the default colour if there is no non-white colour (%s)',
		(whiteColour) => {
			colourMap.colours = [
				'#001020',
				'#002050',
				whiteColour,
				whiteColour,
			];
			colourMap.quantities = [1020, 1050, 1100, 2050];
			const colour = getProbabilityColour(1, 51, colourMap);
			expect(colour).toEqual(defaultColour);
		}
	);
});
