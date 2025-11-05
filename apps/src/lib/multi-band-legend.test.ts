import { describe, it, expect } from 'vitest';

import {
	transformColorMapToMultiBandLegend,
	InvalidQuantityFormatError,
	ScaleMismatchError,
	type TransformColorMapInput,
} from '@/lib/multi-band-legend';

import { EXAMPLE_COLOR_MAP_3_BANDS } from '@/hooks/use-color-map.examples';

/**
 * Factory to create test fixtures for multi-band legend
 *
 * @param groups - Number of groups (1-9)
 * @param percentages - Percentage values for scale (e.g., [40, 50, 60, 70, 80, 90, 100])
 */
const createFixture = (
	groups: number = 3,
	percentages: number[] = [40, 50, 60, 70, 80, 90, 100]
): TransformColorMapInput => {
	const colours: string[] = [];
	const quantities: number[] = [];

	const baseColors = [
		'#FF0000',
		'#00FF00',
		'#0000FF',
		'#FFFF00',
		'#FF00FF',
		'#00FFFF',
		'#FFA500',
		'#FFA511',
		'#FFA522',
	];

	for (let g = 1; g <= groups; g++) {
		const baseQuantity = g * 1000;

		percentages.forEach((percentage, index) => {
			const color =
				index === 0
					? '#FFFFFF'
					: baseColors[(index - 1) % baseColors.length];

			colours.push(color);
			quantities.push(baseQuantity + percentage);
		});
	}

	return { colours, quantities };
};

describe('multi-band-legend', () => {
	describe('transformColorMapToMultiBandLegend', () => {
		describe('happy path', () => {
			it('transforms real production data (EXAMPLE_COLOR_MAP_3_BANDS)', () => {
				const result = transformColorMapToMultiBandLegend(
					EXAMPLE_COLOR_MAP_3_BANDS
				);

				expect(result.scale).toEqual([40, 50, 60, 70, 80, 90, 100]);
				expect(result.rows).toHaveLength(3);
				expect(result.rows[0].colors).toHaveLength(6);
				expect(result.rows[0].label).toBe('Line 1');
				// Validates the actual color values from the example
				expect(result.rows[0].colors[0]).toBe('#FDD0BB');
				expect(result.rows[2].colors[5]).toBe('#3A9DD2');
			});

			it('transforms standard 3-group data', () => {
				const input = createFixture(3);

				const result = transformColorMapToMultiBandLegend(input);

				expect(result.scale).toEqual([40, 50, 60, 70, 80, 90, 100]);
				expect(result.rows).toHaveLength(3);
				expect(result.rows[0].colors).toHaveLength(6);
				expect(result.rows[0].label).toBe('Line 1');
				expect(result.rows[1].label).toBe('Line 2');
				expect(result.rows[2].label).toBe('Line 3');
			});

			it('handles 2 groups', () => {
				const input = createFixture(2);

				const result = transformColorMapToMultiBandLegend(input);

				expect(result.rows).toHaveLength(2);
				expect(result.scale).toEqual([40, 50, 60, 70, 80, 90, 100]);
				expect(result.rows[0].label).toBe('Line 1');
				expect(result.rows[1].label).toBe('Line 2');
			});

			it('handles single group', () => {
				const input = createFixture(1);

				const result = transformColorMapToMultiBandLegend(input);

				expect(result.rows).toHaveLength(1);
				expect(result.scale).toEqual([40, 50, 60, 70, 80, 90, 100]);
			});

			it('handles non-uniform increments (by 20)', () => {
				const input = createFixture(3, [40, 60, 80, 100]);

				const result = transformColorMapToMultiBandLegend(input);

				expect(result.scale).toEqual([40, 60, 80, 100]);
				expect(result.rows).toHaveLength(3);
				expect(result.rows[0].colors).toHaveLength(3);
				expect(result).toMatchInlineSnapshot(`
					{
					  "rows": [
					    {
					      "colors": [
					        "#FF0000",
					        "#00FF00",
					        "#0000FF",
					      ],
					      "label": "Line 1",
					    },
					    {
					      "colors": [
					        "#FF0000",
					        "#00FF00",
					        "#0000FF",
					      ],
					      "label": "Line 2",
					    },
					    {
					      "colors": [
					        "#FF0000",
					        "#00FF00",
					        "#0000FF",
					      ],
					      "label": "Line 3",
					    },
					  ],
					  "scale": [
					    40,
					    60,
					    80,
					    100,
					  ],
					}
				`);
			});

			it('handles percentages starting at different values', () => {
				const input = createFixture(3, [30, 50, 70, 90]);

				const result = transformColorMapToMultiBandLegend(input);

				expect(result.scale).toEqual([30, 50, 70, 90]);
			});

			it('validates constraint: scale.length === colors.length + 1', () => {
				const input = createFixture(3);

				const result = transformColorMapToMultiBandLegend(input);

				result.rows.forEach((row) => {
					expect(result.scale.length).toBe(row.colors.length + 1);
				});
			});

			it('validates all groups have same color count', () => {
				const input = createFixture(3);

				const result = transformColorMapToMultiBandLegend(input);

				const colorCounts = result.rows.map((row) => row.colors.length);
				const allSame = colorCounts.every(
					(count) => count === colorCounts[0]
				);

				expect(allSame).toBe(true);
			});

			it('skips first color in each group (placeholder)', () => {
				const input = createFixture(3);

				const result = transformColorMapToMultiBandLegend(input);

				// First color (#FFFFFF) should be excluded from each row
				result.rows.forEach((row) => {
					expect(row.colors).not.toContain('#FFFFFF');
				});
			});
		});

		describe('error cases', () => {
			describe('quantity format validation', () => {
				it('throws InvalidQuantityFormatError for 1200 (production typo)', () => {
					const input = createFixture(3);
					input.quantities[6] = 1200;

					expect(() =>
						transformColorMapToMultiBandLegend(input)
					).toThrowError(InvalidQuantityFormatError);
				});

				it('throws for invalid 2nd digit', () => {
					const input = createFixture(3);
					input.quantities[0] = 1340; // because 340% wouldn't make sense.

					expect(() =>
						transformColorMapToMultiBandLegend(input)
					).toThrowError(InvalidQuantityFormatError);
				});
			});

			describe('scale consistency validation', () => {
				it('throws when quantities contain duplicates', () => {
					const input = createFixture(3);
					input.quantities[2] = 1050; // Duplicate (quantities[1] is also 1050)

					expect(() =>
						transformColorMapToMultiBandLegend(input)
					).toThrow(/duplicate quantity.*1050/i);
				});

				it('throws ScaleMismatchError when scales differ', () => {
					const input: TransformColorMapInput = {
						/* prettier-ignore-start */
						colours: [
							// Line 1
							'#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
							// Line 2
							'#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
						],
						quantities: [
							// Line 1
							1040, 1050, 1060, 1070,
							// Line 2
							2040, 2060, 2080, 2100,
						],
						/* prettier-ignore-end */
					};

					expect(() =>
						transformColorMapToMultiBandLegend(input)
					).toThrowError(ScaleMismatchError);
				});
			});
		});
	});
});
