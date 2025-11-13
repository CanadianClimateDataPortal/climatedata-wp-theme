import { describe, test, expect } from 'vitest';
import { getLuminance, hexToRgb, bestContrastingColor } from './colors';

describe('getLuminance', () => {
	test('returns 0 for black', () => {
		expect(getLuminance(0, 0, 0)).toBe(0);
	});

	test('returns ~1 for white', () => {
		expect(getLuminance(255, 255, 255)).toBeCloseTo(1, 5);
	});

	test.each([
		['673ab7', 0.0932857408],
		['ffeb3b', 0.809924285],
		['8bc34a', 0.4501359332],
	])(
		'returns (near) correct luminance for %s',
		(hexColor, expectedLuminance) => {
			const rgb = hexToRgb(hexColor);
			expect(getLuminance(...rgb)).toBeCloseTo(expectedLuminance, 5);
		}
	);

	test('returns coherent WCAG luminance for pure RGB', () => {
		const red = getLuminance(255, 0, 0);
		const green = getLuminance(0, 255, 0);
		const blue = getLuminance(0, 0, 255);
		// A pure red should have a luminance < a pure green
		expect(red).toBeGreaterThan(blue);
		expect(green).toBeGreaterThan(red);
	});
});

describe('hexToRgb', () => {
	test('correctly convers a 6-digit code with #', () => {
		expect(hexToRgb('#ff6b35')).toEqual([255, 107, 53]);
	});

	test('correctly convers a 6-digit code without #', () => {
		expect(hexToRgb('8f345d')).toEqual([143, 52, 93]);
	});

	test('correctly convers a 3-digit code with #', () => {
		expect(hexToRgb('#3dF')).toEqual([51, 221, 255]);
	});

	test('correctly convers a 3-digit code without #', () => {
		expect(hexToRgb('3Ca')).toEqual([51, 204, 170]);
	});

	test.each([
		'', // incorrect length
		'AF', // incorrect length
		'1234567', // incorrect length
		'z00', // Not hexadecimal
		'K23456', // Not hexadecimal
	])('raises if invalid input', (input) => {
		const fn = () => hexToRgb(input);
		expect(fn).toThrowError();
	});
});

describe('bestContrastingColor', () => {
	test.each(['#fff', '64ff3b'])(
		'return dark color for light base (%s)',
		(baseColor) => {
			expect(bestContrastingColor(baseColor)).toBe('#000');
		}
	);

	test.each(['#000', '3f51b5'])(
		'return light color for dark base (%s)',
		(baseColor) => {
			expect(bestContrastingColor(baseColor)).toBe('#FFF');
		}
	);

	test('return custom light color', () => {
		const light = '#123456';
		const dark = '#ABCDEF';
		expect(bestContrastingColor('#000000', dark, light)).toBe(light);
	});

	test('return custom dark color', () => {
		const light = '#123456';
		const dark = '#ABCDEF';
		expect(bestContrastingColor('#FFFFFF', dark, light)).toBe(dark);
	});

	test('use the custom luminance threshold', () => {
		// #808080 has a low luminance (~0.2159), so without a custom threshold,
		// it would return the dark color. With a low custom threshold, we
		// expect it to return the light color.
		expect(
			bestContrastingColor('#808080', '#111111', '#EEEEEE', 0.2)
		).toBe('#111111');
	});
});
