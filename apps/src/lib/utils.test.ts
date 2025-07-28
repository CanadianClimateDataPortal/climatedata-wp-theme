import { describe, expect, test } from 'vitest';
import { findCeilingIndex, generateRange } from './utils';

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
		expect(result).toEqual([12.1 , 13.02, 13.94, 14.86, 15.78, 16.7]);
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
