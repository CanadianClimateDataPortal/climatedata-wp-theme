import { describe, expect, test } from 'vitest';

import {
	skillLevelIndexFor,
	skillLevelIndexOfLabel,
	skillLevelLabelFor,
	type SkillLevel,
} from './skill-level';

interface TestAssertions {
	input: number;
	expectedIndex: number;
	expectedLevel: SkillLevel;
	rationale: string;
}

const INPUT_VALUES_EXPECTATIONS: TestAssertions[] = [
	{
		input: 1000,
		expectedIndex: 3,
		expectedLevel: 'high',
		rationale: 'Large integer',
	},
	{
		input: -1000,
		expectedIndex: 0,
		expectedLevel: 'no skill',
		rationale: 'Large signed integer',
	},
	{
		input: 4.2,
		expectedIndex: 3,
		expectedLevel: 'high',
		rationale: 'Normal float value',
	},
	{
		input: -4.5,
		expectedIndex: 0,
		expectedLevel: 'no skill',
		rationale: 'Signed float',
	},
	{
		input: 0,
		expectedIndex: 0,
		expectedLevel: 'no skill',
		rationale: 'Should be no skill',
	},
	{
		input: -0.1,
		expectedIndex: 0,
		expectedLevel: 'no skill',
		rationale: 'Should be no skill',
	},
	{
		input: 0.3,
		expectedIndex: 1,
		expectedLevel: 'low',
		rationale: 'Should be low skill',
	},
	{
		input: 1,
		expectedIndex: 1,
		expectedLevel: 'low',
		rationale: 'Should be low skill',
	},
	{
		input: 1.1,
		expectedIndex: 2,
		expectedLevel: 'medium',
		rationale: 'Should be medium skill',
	},
	{
		input: 2.5,
		expectedIndex: 3,
		expectedLevel: 'high',
		rationale: 'Should be high skill',
	},
];

describe('convertSkillLevelIndexToValue', () => {
	describe('Happy-Paths', () => {
		test.each(INPUT_VALUES_EXPECTATIONS)(
			'($input) => $expectedLevel:\t\t $rationale',
			({ input, expectedLevel }) => {
				const testSubject = skillLevelLabelFor(input as number);
				expect(testSubject).toBe(expectedLevel);
			}
		);
	});
});

describe.skip('isSkillLevelValue', () => {
	test.todo('Stub');
});

describe('skillLevelIndexFor', () => {
	describe('Happy-Paths', () => {
		test.each(INPUT_VALUES_EXPECTATIONS)(
			'($expectedLevel)\t=> $expectedIndex\t\t $rationale',
			({ input, expectedIndex }) => {
				const testSubject = skillLevelIndexFor(input);
				expect(testSubject).toEqual(expectedIndex);
				expect(testSubject).toBeGreaterThanOrEqual(0);
				expect(testSubject).toBeLessThanOrEqual(3);
			}
		);
	});
});

describe('reverse', () => {
	describe('Happy-Paths', () => {
		test.each([
			...INPUT_VALUES_EXPECTATIONS,
			{
				input: 2.5,
				expectedIndex: 3,
				expectedLevel: 'HIGH',
				rationale: 'Case INSenSiTiVe', // Should we? Probably not. That's a reflex due to my experience with unpredictable backend changes.
			},
		])(
			'($expectedLevel) => $expectedIndex',
			({ expectedLevel, expectedIndex }) => {
				const testSubject = skillLevelIndexOfLabel(expectedLevel);
				expect(testSubject).toBe(expectedIndex);
			}
		);
	});

	describe('Error Cases', () => {
		test('throws on invalid input', () => {
			expect(() => skillLevelIndexOfLabel('invalid')).toThrow();
		});
	});
});
