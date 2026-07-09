import { describe, expect, test } from 'vitest';
import { resolveFullStepOrdinal } from './resolve-full-step-ordinal';

// resolveFullStepOrdinal maps a position in a FILTERED subsequence back to its
// ordinal in the FULL sequence.
//
// This emulates the download wizard hiding steps that don't apply: the user sees
// a shortened flow. A "position" is an element's 1-based rank in what the user
// SEES (the filtered subsequence); an "ordinal" is the same element's 1-based
// number in the FULL flow — the value the edit-pencil reset gate compares. A raw
// visible position would act on the wrong element; that's the bug this conversion
// prevents.
//
// Each test.each row is [visible position, the element the user sees there]; the
// test asserts the resolved ordinal AND that the element sits at that ordinal in
// FULL_SEQUENCE. Commented-out entries (e.g. /* 'c', */) mark removed elements.
const FULL_SEQUENCE = ['a', 'b', 'c', 'd', 'e', 'f', 'g'] as const;

describe('resolveFullStepOrdinal', () => {
	describe('nothing filtered — every position is its own ordinal (identity)', () => {
		test.each<[number, string]>([
			[1, 'a'],
			[3, 'c'],
			[5, 'e'],
			[7, 'g'],
		])('visible position %i is %s — resolves to the same ordinal', (position, element) => {
			const ordinal = resolveFullStepOrdinal(FULL_SEQUENCE, FULL_SEQUENCE, position);
			expect(ordinal).toBe(position);
			expect(FULL_SEQUENCE[ordinal - 1]).toBe(element);
		});
	});

	describe('an element removed BEFORE a position shifts that position up', () => {
		// Drop the element at (ordinal) 3rd position → [a, b, d, e, f, g].
		const subsequence = ['a', 'b', /* 'c', */ 'd', 'e', 'f', 'g'] as const;

		test('a position before the gap keeps its ordinal', () => {
			// The removed element sits after position 2, so it is unshifted.
			const ordinal = resolveFullStepOrdinal(FULL_SEQUENCE, subsequence, 2);
			expect(ordinal).toBe(2);
			expect(FULL_SEQUENCE[ordinal - 1]).toBe('b');
		});

		test.each<[number, string]>([
			[3, 'd'],
			[4, 'e'],
			[5, 'f'],
			[6, 'g'],
		])('visible position %i is %s — shifts up one ordinal', (position, element) => {
			const ordinal = resolveFullStepOrdinal(FULL_SEQUENCE, subsequence, position);
			expect(ordinal).toBe(position + 1);
			expect(FULL_SEQUENCE[ordinal - 1]).toBe(element);
		});
	});

	describe('an element removed AFTER a position leaves that position unchanged', () => {
		// Drop the element at (ordinal) 5th position → [a, b, c, d, f, g].
		const subsequence = ['a', 'b', 'c', 'd', /* 'e', */ 'f', 'g'] as const;
		test.each<[number, string]>([
			[1, 'a'],
			[2, 'b'],
			[3, 'c'],
			[4, 'd'],
		])('visible position %i is %s — ordinal unchanged', (position, element) => {
			const ordinal = resolveFullStepOrdinal(FULL_SEQUENCE, subsequence, position);
			expect(ordinal).toBe(position);
			expect(FULL_SEQUENCE[ordinal - 1]).toBe(element);
		});
	});

	describe('boundary — a position resolves to its own element, never past it', () => {
		// Drop the element at (ordinal) 3rd position → [a, b, d, e, f, g].
		// Filtered position 3 holds 'd' (full ordinal 4). The resolver must return 4 — the
		// element's own ordinal — and never the raw filtered position 3, so a
		// strict-greater full-space gate leaves the queried element untouched.
		const subsequence = ['a', 'b', /* 'c', */ 'd', 'e', 'f', 'g'] as const;
		test('visible position 3 ("d") resolves to ordinal 4 and round-trips to the same element', () => {
			const resolved = resolveFullStepOrdinal(FULL_SEQUENCE, subsequence, 3);
			expect(resolved).toBe(4);
			expect(resolved).not.toBe(3);
			expect(FULL_SEQUENCE[resolved - 1]).toBe(subsequence[3 - 1]);
		});
	});
});
