import { describe, expect, test } from 'vitest';
import { resolveStepNumberInFullFlow } from './resolve-step-number-in-full-flow';

// resolveStepNumberInFullFlow maps a step view's on-screen NUMBER in the VISIBLE
// flow back to its number in the FULL flow.
//
// A "step view" is what the wizard renders at a given step (an abstract 'a'–'g'
// letter here models one). The download wizard hides steps that don't apply, so
// the user walks a shortened flow: a step view's ON-SCREEN number is its 1-based
// rank in what the user SEES, while its FULL-FLOW number is that same view's
// rank in the FULL flow — the value the edit-pencil reset gate compares, and
// what the helper returns as `stepNumberInFullFlow`. Passing a raw on-screen
// number to that gate would act on the wrong step view; this conversion prevents
// that bug.
//
// A commented-out entry in a fixture (/* 'c', */) marks a hidden step.
const FULL_SEQUENCE = ['a', 'b', 'c', 'd', 'e', 'f', 'g'] as const;

describe('resolveStepNumberInFullFlow', () => {
	describe('nothing hidden — every step view is the same step counted either way', () => {
		test.each<[number, string]>([
			[1, 'a'],
			[3, 'c'],
			[5, 'e'],
			[7, 'g'],
		])('step view %i (%s) is the same step counted either way', (stepViewNumber, stepView) => {
			const stepNumberInFullFlow = resolveStepNumberInFullFlow(FULL_SEQUENCE, FULL_SEQUENCE, stepViewNumber);
			const stepViewAtStepNumberInFullFlow = FULL_SEQUENCE[stepNumberInFullFlow - 1];
			expect(stepNumberInFullFlow).toBe(stepViewNumber);
			expect(stepViewAtStepNumberInFullFlow).toBe(stepView);
		});
	});

	describe('a step hidden after a step view cannot move it — its full-flow number is unchanged', () => {
		const withFifthStepHidden = ['a', 'b', 'c', 'd', /* 'e', */ 'f', 'g'] as const;
		test.each<[number, string]>([
			[1, 'a'],
			[2, 'b'],
			[3, 'c'],
			[4, 'd'],
		])('step view %i (%s) precedes the gap — its full-flow number is unchanged', (stepViewNumber, stepView) => {
			const stepNumberInFullFlow = resolveStepNumberInFullFlow(FULL_SEQUENCE, withFifthStepHidden, stepViewNumber);
			const stepViewAtStepNumberInFullFlow = FULL_SEQUENCE[stepNumberInFullFlow - 1];
			expect(stepNumberInFullFlow).toBe(stepViewNumber);
			expect(stepViewAtStepNumberInFullFlow).toBe(stepView);
		});
	});

	describe('a step hidden before a step view raises its full-flow number by one; a step view ahead of the gap is untouched', () => {
		const withThirdStepHidden = ['a', 'b', /* 'c', */ 'd', 'e', 'f', 'g'] as const;

		test('a step view ahead of the gap keeps its full-flow number', () => {
			const stepNumberInFullFlow = resolveStepNumberInFullFlow(FULL_SEQUENCE, withThirdStepHidden, 2);
			const stepViewAtStepNumberInFullFlow = FULL_SEQUENCE[stepNumberInFullFlow - 1];
			expect(stepNumberInFullFlow).toBe(2);
			expect(stepViewAtStepNumberInFullFlow).toBe('b');
		});

		test.each<[number, string]>([
			[3, 'd'],
			[4, 'e'],
			[5, 'f'],
			[6, 'g'],
		])('step view %i (%s) sits past the gap — its full-flow number rises by one', (stepViewNumber, stepView) => {
			const stepNumberInFullFlow = resolveStepNumberInFullFlow(FULL_SEQUENCE, withThirdStepHidden, stepViewNumber);
			const stepViewAtStepNumberInFullFlow = FULL_SEQUENCE[stepNumberInFullFlow - 1];
			expect(stepNumberInFullFlow).toBe(stepViewNumber + 1);
			expect(stepViewAtStepNumberInFullFlow).toBe(stepView);
		});
	});

	describe('two steps hidden before a step view raise its full-flow number by two — the shift counts hidden steps, it is not a fixed +1', () => {
		const withSecondAndFourthStepsHidden = ['a', /* 'b', */ 'c', /* 'd', */ 'e', 'f', 'g'] as const;
		test.each<[number, string]>([
			[3, 'e'],
			[4, 'f'],
			[5, 'g'],
		])('step view %i (%s) sits past both gaps — its full-flow number rises by two', (stepViewNumber, stepView) => {
			const stepNumberInFullFlow = resolveStepNumberInFullFlow(FULL_SEQUENCE, withSecondAndFourthStepsHidden, stepViewNumber);
			const stepViewAtStepNumberInFullFlow = FULL_SEQUENCE[stepNumberInFullFlow - 1];
			expect(stepNumberInFullFlow).toBe(stepViewNumber + 2);
			expect(stepViewAtStepNumberInFullFlow).toBe(stepView);
		});
	});
});
