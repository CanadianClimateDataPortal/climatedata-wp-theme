import { describe, expect, test } from 'vitest';
import { findCeilingIndex } from './utils';

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
