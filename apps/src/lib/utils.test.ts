import { describe, expect, test } from 'vitest';
import { findCeilingIndex, generateRange, parseLatLon } from './utils';

describe('findCeilingIndex', () => {
	test('returns exact index for exact value', () => {
		const values = [-5, -1, 0, 1, 8];
		const result = findCeilingIndex(values, 1);
		expect(result).toEqual(3);
	});

	test('returns exact index for exact value in middle', () => {
		const values = [-5, -1, 0, 1, 8];
		const result = findCeilingIndex(values, 0);
		expect(result).toEqual(2);
	});

	test('returns -1 if higher than the maximum', () => {
		const values = [-5, -1, -0.5];
		const result = findCeilingIndex(values, 1);
		expect(result).toEqual(-1);
	});

	test('returns -1 if empty values', () => {
		const values: number[] = [];
		const result = findCeilingIndex(values, 1);
		expect(result).toEqual(-1);
	});

	test('returns the nearest highest index if no exact match', () => {
		const values = [-5, 0.5, 2, 6];
		const result = findCeilingIndex(values, 0.75);
		expect(result).toEqual(2);
	});

	test('returns 0 if lower than the first', () => {
		const values = [10, 20, 30];
		const result = findCeilingIndex(values, -1);
		expect(result).toEqual(0);
	});
});

describe('generateRange', () => {
	test('returns an empty array if n is 0', () => {
		const result = generateRange(1, 3, 0);
		expect(result).toEqual([]);
	});

	test('return A if n is 1', () => {
		const result = generateRange(-1, 3, 1);
		expect(result).toEqual([-1]);
	});

	test('return A and B if n is 2', () => {
		const result = generateRange(-2, 6.1, 2);
		expect(result).toEqual([-2, 6.1]);
	});

	test('return the evenly spaced values if n>2 (n=3)', () => {
		const result = generateRange(-2.4, 6.2, 3);
		expect(result).toEqual([-2.4, 1.9, 6.2]);
	});

	test('return the evenly spaced values if n>2 (n=6)', () => {
		const result = generateRange(12.1, 16.7, 6);
		expect(result).toEqual([12.1, 13.02, 13.94, 14.86, 15.78, 16.7]);
	});

	test('returns all equal values if A=B', () => {
		const result = generateRange(-9.5, -9.5, 4);
		expect(result).toEqual([-9.5, -9.5, -9.5, -9.5]);
	});

	test('returns reverse range if A>B', () => {
		const result = generateRange(5, 3, 3);
		expect(result).toEqual([5, 4, 3]);
	});
});

describe('parseLatLon', () => {
	test.each([
		['4', 4],
		['79', 79],
		['0', 0],
		['34.', 34],
		['37,', 37],
		['37.765', 37.765],
		['0,768', 0.768],
		['3.456,', 3.456],
		['3.456 ,', 3.456],
		['72.90;', 72.9],
		['89,5 ;', 89.5],
		['90', 90],
	])('correctly parses partial (%s)', (text, expectedValue) => {
		let result = parseLatLon(text);
		expect(result).toEqual(
			expect.objectContaining({
				lat: expectedValue,
				lon: Number.NaN,
				isPartial: true,
			})
		);

		// With space before and after
		result = parseLatLon('  ' + text + '  ');
		expect(result).toEqual(
			expect.objectContaining({
				lat: expectedValue,
				lon: Number.NaN,
				isPartial: true,
			})
		);

		// With negative sign
		result = parseLatLon('-' + text);
		expect(result).toEqual(
			expect.objectContaining({
				lat: -1 * expectedValue,
				lon: Number.NaN,
				isPartial: true,
			})
		);
	});

	test('considers minus only as partial', () => {
		let result = parseLatLon('-');
		expect(result).toEqual(
			expect.objectContaining({
				lat: Number.NaN,
				lon: Number.NaN,
				isPartial: true,
			})
		);
		result = parseLatLon(' - ');
		expect(result).toEqual(
			expect.objectContaining({
				lat: Number.NaN,
				lon: Number.NaN,
				isPartial: true,
			})
		);
	});

	test('empty string is not parsed', () => {
		let result = parseLatLon('');
		expect(result).toBeNull();

		result = parseLatLon(' ');
		expect(result).toBeNull();
	});

	test.each([
		['4, 5', 4, 5],
		['79; 82', 79, 82],
		['0 0', 0, 0],
		['34. ; 23.', 34, 23],
		['37, 2', 37, 2],
		['37.765 23.876', 37.765, 23.876],
		['0,768 -3', 0.768, -3],
		['3.456,-34,56', 3.456, -34.56],
		['3.456 ,12,45', 3.456, 12.45],
		['72.90;-65.6', 72.9, -65.6],
		['89,5 ; 89,5', 89.5, 89.5],
		['90 ; 180', 90, 180],
		['-90.0 ; -180.0', -90, -180],
	])('correctly parses complete (%s)', (text, expectedLat, expectedLon) => {
		let result = parseLatLon(text);
		expect(result).toEqual(
			expect.objectContaining({
				lat: expectedLat,
				lon: expectedLon,
				isPartial: false,
			})
		);

		// With space before and after
		result = parseLatLon('  ' + text + '  ');
		expect(result).toEqual(
			expect.objectContaining({
				lat: expectedLat,
				lon: expectedLon,
				isPartial: false,
			})
		);
	});

	test.each(['simple text', '- test', '3 4 5', '-4.45 and other'])(
		'"%s" is not parsed',
		(text) => {
			const result = parseLatLon(text);
			expect(result).toBeNull();
		}
	);

	test.each([
		// Out of range latitude
		[-91, 100],
		[-90.01, 100],
		[91, 100],
		[90.001, 100],
		// Out of range longitude
		[45, -181],
		[45, -180.01],
		[45, -181],
		[45, -180.00001],
	])(
		'returns null for outside valid range (%s)',
		(lat: number, lon: number) => {
			const result = parseLatLon(`${lat}, ${lon}`);
			expect(result).toBeNull();
		}
	);
});
