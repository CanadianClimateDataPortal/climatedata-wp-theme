import { beforeEach, describe, expect, test } from 'vitest';
import { ColourMap, ColourSchemeType } from '@/types/types';
import { getProbabilityColour } from '@/components/map-layers/s2d-variable-values';

describe('getProbabilityColour', () => {
	let colourMap: ColourMap;
	const defaultColour = '#909090';
	const whiteColours = ['#ffffff', '#fff', '#FFFFFF', '#FFF'];

	describe('when the associated colour is not white', () => {
		beforeEach(() => {
			colourMap = {
				// Notice the gaps in colours and quantities
				// This is deliberate and not a situation enforced here.
				colours: [
					// outcome 0
					'#001010', '#001020', '#001030',
					// outcome 1
					/*                  */'#002030', '#002040', '#002050',
					// outcome 2
					/*       */'#003020',/*        */'#003040', '#003050', '#003060',
				],
				quantities: [
					// outcome 0
					1010, 1020, 1030,
					// outcome 1
					/*				*/2030, 2040, 2050,
					// outcome 2
					/*  */3020,/*   */3040, 3050, 3060,
				],
				type: ColourSchemeType.DIVERGENT,
				isDivergent: true,
			};
		});

		test('returns correct colour if exact quantity', () => {
			const colour = getProbabilityColour(1, 40, colourMap);
			// As per the description of {getProbabilityColour}, the colour
			// returned for a value matching an exact quantity is the colour
			// of the next quantity (because the boundaries are exclusive).
			expect(colour).toEqual('#002050');
		});

		test('percentage is rounded (rounded down)', () => {
			const colour = getProbabilityColour(2, 50.4, colourMap);
			// As per the description of {getProbabilityColour}, the colour
			// returned for a value matching an exact quantity, after rounding,
			// is the colour of the next quantity (because the boundaries are
			// exclusive).
			expect(colour).toEqual('#003060');
		});

		test('percentage is rounded (rounded up)', () => {
			const colour = getProbabilityColour(2, 49.6, colourMap);
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
	});

	describe('when percentage is 100', () => {
		beforeEach(() => {
			colourMap = {
				colours: ['#001010', '#001100', '#002030', '#002030'],
				quantities: [1010, 1100, 2030, 3030],
			} as unknown as ColourMap;
		});

		test('returns correct colour if exact quantity', () => {
			// If there is a colour specified for the exact quantity of 100,
			// we return this colour (contrary to other cases where we return
			// the next colour)
			const colour = getProbabilityColour(0, 100, colourMap);
			// The correct colour with an exact match is the one after (i.e. the
			// same as if the percentage was >40)
			expect(colour).toEqual('#001100');
		});

		test('returns default colour if above max outcome quantity', () => {
			// If there is no colour specified for the exact quantity of 100,
			// have the default behaviour of returning the default colour if
			// no coulour available for the outcome.
			const colour = getProbabilityColour(1, 100, colourMap);
			// The correct colour with an exact match is the one after (i.e. the
			// same as if the percentage was >40)
			expect(colour).toEqual(defaultColour);
		});
	});

	describe('when the associated colour is white', () => {
		beforeEach(() => {
			colourMap = {
				colours: [],
				quantities: [],
			} as unknown as ColourMap;
		});

		test.each(whiteColours)('return next non-white (%s)',
			(whiteColour) => {
				colourMap.colours = [
					whiteColour,
					whiteColour,
					'#001095',
				];
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
});
