import { describe, expect, test } from 'vitest';
import { resolveFullStepOrdinal } from './resolve-full-step-ordinal';

// resolveFullStepOrdinal maps a position in a FILTERED subsequence back to its
// ordinal in the FULL sequence.
//
// The download wizard hides steps that don't apply, so the user walks a
// shortened flow. A "position" is an element's 1-based rank in what the user
// SEES; an "ordinal" is that same element's 1-based rank in the FULL flow — the
// value the edit-pencil reset gate compares. Feed a raw visible position into
// that gate and it acts on the wrong element; this conversion prevents that bug.
//
// The whole behaviour is one rule:
//     ordinal = position + (steps hidden BEFORE the visible element)
// Each describe block below pins one term of that rule: nothing hidden, a step
// hidden-before (which raises the ordinal), a step hidden-after (which cannot),
// and two hidden-before (which raise it twice — proof the shift is a count).
//
// Fixtures are abstract 'a'–'g'; a commented-out entry (e.g. /* 'c', */) is a
// hidden step. Every case also round-trips — the resolved ordinal must point
// back to the exact element the user saw — so a resolution landing on the wrong
// element fails even when the number alone looks plausible.
const FULL_SEQUENCE = ['a', 'b', 'c', 'd', 'e', 'f', 'g'] as const;

describe('resolveFullStepOrdinal', () => {
	describe('nothing hidden — each visible position already equals its full ordinal', () => {
		test.each<[number, string]>([
			[1, 'a'],
			[3, 'c'],
			[5, 'e'],
			[7, 'g'],
		])('position %i (%s) resolves to the identical ordinal', (position, element) => {
			const ordinal = resolveFullStepOrdinal(FULL_SEQUENCE, FULL_SEQUENCE, position);
			expect(ordinal).toBe(position);
			expect(FULL_SEQUENCE[ordinal - 1]).toBe(element);
		});
	});

	describe('a step hidden before the visible one raises its ordinal by one; a position ahead of the gap is untouched', () => {
		// Hide the 3rd full step → [a, b, _, d, e, f, g]. The gap sits after
		// position 2 and before positions 3+, so it is the pivot between the two
		// halves this block asserts.
		const subsequence = ['a', 'b', /* 'c', */ 'd', 'e', 'f', 'g'] as const;

		test('a position ahead of the gap keeps its ordinal', () => {
			const ordinal = resolveFullStepOrdinal(FULL_SEQUENCE, subsequence, 2);
			expect(ordinal).toBe(2);
			expect(FULL_SEQUENCE[ordinal - 1]).toBe('b');
		});

		test.each<[number, string]>([
			[3, 'd'],
			[4, 'e'],
			[5, 'f'],
			[6, 'g'],
		])('position %i (%s) sits past the gap — ordinal rises by one', (position, element) => {
			const ordinal = resolveFullStepOrdinal(FULL_SEQUENCE, subsequence, position);
			expect(ordinal).toBe(position + 1);
			expect(FULL_SEQUENCE[ordinal - 1]).toBe(element);
		});
	});

	describe('a step hidden after the visible one cannot move it — the ordinal still equals the position', () => {
		// Hide the 5th full step → [a, b, c, d, _, f, g]. Every position queried
		// here is upstream of that gap, so the removal is irrelevant to each.
		const subsequence = ['a', 'b', 'c', 'd', /* 'e', */ 'f', 'g'] as const;
		test.each<[number, string]>([
			[1, 'a'],
			[2, 'b'],
			[3, 'c'],
			[4, 'd'],
		])('position %i (%s) precedes the gap — ordinal unchanged', (position, element) => {
			const ordinal = resolveFullStepOrdinal(FULL_SEQUENCE, subsequence, position);
			expect(ordinal).toBe(position);
			expect(FULL_SEQUENCE[ordinal - 1]).toBe(element);
		});
	});

	describe('two steps hidden before the visible one raise its ordinal by two — the shift counts hidden steps, it is not a fixed +1', () => {
		// Hide the 2nd and 4th full steps → [a, c, e, f, g]. Both gaps precede
		// every position queried here, so each ordinal gains the full count of
		// two — the behaviour a single-gap fixture can never tell apart from +1.
		const subsequence = ['a', /* 'b', */ 'c', /* 'd', */ 'e', 'f', 'g'] as const;
		test.each<[number, string]>([
			[3, 'e'],
			[4, 'f'],
			[5, 'g'],
		])('position %i (%s) sits past both gaps — ordinal rises by two', (position, element) => {
			const ordinal = resolveFullStepOrdinal(FULL_SEQUENCE, subsequence, position);
			expect(ordinal).toBe(position + 2);
			expect(FULL_SEQUENCE[ordinal - 1]).toBe(element);
		});
	});
});
