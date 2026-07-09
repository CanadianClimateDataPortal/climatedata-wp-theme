import { describe, expect, test } from 'vitest';
import { resolveFullStepOrdinal } from './resolve-full-step-ordinal';

// resolveFullStepOrdinal maps a step view's NUMBER in the VISIBLE flow back to
// its ORDINAL in the FULL flow.
//
// A "step view" is what the wizard renders at a given step (an abstract 'a'–'g'
// letter here models one). The download wizard hides steps that don't apply, so
// the user walks a shortened flow: a step view's NUMBER is its 1-based rank in
// what the user SEES, while its ORDINAL is that same view's rank in the FULL
// flow — the value the edit-pencil reset gate compares. Passing a raw visible
// number to that gate would act on the wrong step view; this conversion prevents
// that bug.
//
// A commented-out entry in a fixture (/* 'c', */) marks a hidden step.
const FULL_SEQUENCE = ['a', 'b', 'c', 'd', 'e', 'f', 'g'] as const;

describe('resolveFullStepOrdinal', () => {
	describe('nothing hidden — each step view number already equals its full ordinal', () => {
		test.each<[number, string]>([
			[1, 'a'],
			[3, 'c'],
			[5, 'e'],
			[7, 'g'],
		])('step view %i (%s) resolves to the identical ordinal', (stepViewNumber, stepView) => {
			const ordinal = resolveFullStepOrdinal(FULL_SEQUENCE, FULL_SEQUENCE, stepViewNumber);
			const stepViewAtOrdinal = FULL_SEQUENCE[ordinal - 1];
			expect(ordinal).toBe(stepViewNumber);
			expect(stepViewAtOrdinal).toBe(stepView);
		});
	});

	describe('a step hidden after a step view cannot move it — its ordinal still equals its step view number', () => {
		const withFifthStepHidden = ['a', 'b', 'c', 'd', /* 'e', */ 'f', 'g'] as const;
		test.each<[number, string]>([
			[1, 'a'],
			[2, 'b'],
			[3, 'c'],
			[4, 'd'],
		])('step view %i (%s) precedes the gap — ordinal unchanged', (stepViewNumber, stepView) => {
			const ordinal = resolveFullStepOrdinal(FULL_SEQUENCE, withFifthStepHidden, stepViewNumber);
			const stepViewAtOrdinal = FULL_SEQUENCE[ordinal - 1];
			expect(ordinal).toBe(stepViewNumber);
			expect(stepViewAtOrdinal).toBe(stepView);
		});
	});

	describe('a step hidden before a step view raises its ordinal by one; a step view ahead of the gap is untouched', () => {
		const withThirdStepHidden = ['a', 'b', /* 'c', */ 'd', 'e', 'f', 'g'] as const;

		test('a step view ahead of the gap keeps its ordinal', () => {
			const ordinal = resolveFullStepOrdinal(FULL_SEQUENCE, withThirdStepHidden, 2);
			const stepViewAtOrdinal = FULL_SEQUENCE[ordinal - 1];
			expect(ordinal).toBe(2);
			expect(stepViewAtOrdinal).toBe('b');
		});

		test.each<[number, string]>([
			[3, 'd'],
			[4, 'e'],
			[5, 'f'],
			[6, 'g'],
		])('step view %i (%s) sits past the gap — ordinal rises by one', (stepViewNumber, stepView) => {
			const ordinal = resolveFullStepOrdinal(FULL_SEQUENCE, withThirdStepHidden, stepViewNumber);
			const stepViewAtOrdinal = FULL_SEQUENCE[ordinal - 1];
			expect(ordinal).toBe(stepViewNumber + 1);
			expect(stepViewAtOrdinal).toBe(stepView);
		});
	});

	describe('two steps hidden before a step view raise its ordinal by two — the shift counts hidden steps, it is not a fixed +1', () => {
		const withSecondAndFourthStepsHidden = ['a', /* 'b', */ 'c', /* 'd', */ 'e', 'f', 'g'] as const;
		test.each<[number, string]>([
			[3, 'e'],
			[4, 'f'],
			[5, 'g'],
		])('step view %i (%s) sits past both gaps — ordinal rises by two', (stepViewNumber, stepView) => {
			const ordinal = resolveFullStepOrdinal(FULL_SEQUENCE, withSecondAndFourthStepsHidden, stepViewNumber);
			const stepViewAtOrdinal = FULL_SEQUENCE[ordinal - 1];
			expect(ordinal).toBe(stepViewNumber + 2);
			expect(stepViewAtOrdinal).toBe(stepView);
		});
	});
});
