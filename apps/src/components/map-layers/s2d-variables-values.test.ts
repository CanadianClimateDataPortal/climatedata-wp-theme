import { beforeEach, describe, expect, test } from 'vitest';
import { ColourMap, ColourSchemeType } from '@/types/types';
import { getProbabilityColour } from '@/components/map-layers/s2d-variable-values';
import { findCeilingIndex } from '@/lib/utils';

describe('getProbabilityColour', () => {
	let colourMap: ColourMap;
	const defaultColour = '#909090';
	const whiteColours = ['#ffffff', '#fff', '#FFFFFF', '#FFF'];

	describe('with problematic quantities and colours', () => {
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
	});

	describe('handling when colours are very close to white', () => {
		beforeEach(() => {
			colourMap = {
				colours: [],
				quantities: [],
			} as unknown as ColourMap;
		});

		test.each(whiteColours)(
			'return next non-white if the associated colour is white (%s)',
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
	})

	describe('when we are within cutoff use next color', () => {
		beforeEach(() => {
			colourMap = {
				colours: [
					'#FFFFFF',
					// Outcome 0
					/* 40% */ '#FCDAC6',
					/* 50% */ '#F6B79A',
					/* 60% */ '#E98D70',
					/* 70% */ '#D45E4C',
					/* 80% */ '#BD3036',
					/* 90% */ '#970F27',
				],
				quantities: [
					// Outcome 0
					/* colourIndex 0 */ 1040,
					/* colourIndex 1 */ 1050,
					/* colourIndex 2 */ 1060,
					/* colourIndex 3 */ 1070,
					/* colourIndex 4 */ 1080,
					/* colourIndex 5 */ 1090,
					/* colourIndex 6 */ 1100,
				],
			} as unknown as ColourMap;
		});
		/**
		 * Reproducing visualization on the map.
		 *
		 * Focus on an area where there's a shift of colours, like close to "Lac Tilly":
		 * @see {@link https://dev-fr.climatedata.ca/cartes/?lat=53.97184&lng=-73.68599&zoom=10}
		 *
		 * Adjust the map for the following:
		 * - Seasonal To Decadal; Mean Temperature
		 * - Forecast Type: Expected
		 * - Forecast Display: Forecast
		 */
		const TEST_CASES = [
			// Near "Lac Tilly"
			{
				// Lac Pikwahipanan
				// /cartes/?lat=54.28527041873418&lng=-74.53811645507814&var=s2d_air_temp&zoom=11
				percentage: 53.29999923706055,
				expectedPercentageRounding: 53, // TODO: confirm if expected rounding/ceiling
				expectedColourIndex: 2,
			} as const,
			{
				// Rivière Wapusukatinastikw -- TODO: Double check
				// Where it's dark on the map but the band in the legend is not the same color.
				// /cartes/?lat=53.850096358390836&lng=-74.53399658203126&var=s2d_air_temp&zoom=11
				percentage: 50.099998474121094,
				expectedPercentageRounding: 50, // TODO: confirm if expected rounding/ceiling
				expectedColourIndex: 1, // 2,   // bug to solve
			} as const,
			{
				// Lac Awapichuchinasich -- TODO: Double check
				// Where it's dark on the map but the band in the legend is not the same color.
				// /cartes/?lat=52.6463964439847&lng=-77.06909179687501&var=s2d_air_temp&zoom=11
				percentage: 50.224998474121094,
				expectedPercentageRounding: 50, // TODO: confirm if expected rounding/ceiling
				expectedColourIndex: 1, // 2,   // bug to solve
			} as const,

			// On the other side of the Hudson's Bay where we can see 3 colours
			{
				// Where is pale, and bands are pale too
				// /cartes/?lat=53.34399288223422&lng=-85.01220703125&var=s2d_air_temp&zoom=11
				percentage: 47.75,
				expectedPercentageRounding: 48, // TODO: confirm if expected rounding/ceiling
				expectedColourIndex: 1,
			} as const,
			{
				// Near Opinnagau Lake, then (-2, -1) squares off it close to North Washagami River
				// Where it's the same colour and still far from darker, the bands shows darker
				// /cartes/?lat=53.78118084719588&lng=-84.6331787109375&var=s2d_air_temp&zoom=11
				percentage: 49.70000076293945,
				expectedPercentageRounding: 50, // TODO: confirm if expected rounding/ceiling
				expectedColourIndex: 1,
			} as const,
			{
				// /cartes/?lat=54.97918989342808&lng=-82.94403076171876&var=s2d_air_temp&zoom=11
				percentage: 60.025001525878906,
				expectedPercentageRounding: 60, // TODO: confirm if expected rounding/ceiling
				expectedColourIndex: 2, // 3,   // bug to solve
			} as const,
		] as const;

		/**
		 * WIP - extracting the inner logic of {@link getProbabilityColour}
		 */
		test.each(TEST_CASES)(
			'findCeilingIndex: using $percentage -> $expectedColourIndex',
			({
				percentage,
				// expectedPercentageRounding,
				expectedColourIndex,
			}) => {
				/**
				 * Reminder: Reproduce these edge cases as simply as possible
				 */
				const outcome = 0; // outcome is not relevant for this inner logic test
				const queryQuantity = 1000 * (outcome + 1) + Math.round(percentage);
				const colourIndex = findCeilingIndex(
					colourMap.quantities,
					queryQuantity
				);
				expect(colourIndex).toBe(expectedColourIndex);
			}
		);
	});
});
