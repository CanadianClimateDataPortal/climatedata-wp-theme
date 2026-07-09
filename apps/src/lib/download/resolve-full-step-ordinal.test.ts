import { describe, expect, test } from 'vitest';
import { resolveFullStepOrdinal } from './resolve-full-step-ordinal';

/**
 * The full, unfiltered wizard step order, mirroring the `STEPS` tuple in
 * `components/download/config.ts`. Plain strings stand in for the React step
 * components; the helper only relies on reference equality, which string
 * literal interning satisfies here.
 */
const FULL_STEPS = [
	'dataset',
	'variable',
	'variableOptions',
	'location',
	'additionalDetails',
	'sendRequest',
	'result',
] as const;

describe('resolveFullStepOrdinal', () => {
	describe('no skipped steps — the two index spaces coincide', () => {
		// A non-station variable filters nothing, so the filtered list is the
		// full list and every filtered position maps to the same ordinal.
		test.each([
			[1, 1],
			[2, 2],
			[3, 3],
			[4, 4],
			[5, 5],
			[6, 6],
			[7, 7],
		])(
			'filtered position %i maps to full ordinal %i (identity)',
			(filteredPosition, expectedOrdinal) => {
				expect(
					resolveFullStepOrdinal(
						FULL_STEPS,
						FULL_STEPS,
						filteredPosition
					)
				).toBe(expectedOrdinal);
			}
		);
	});

	describe('a step skipped BEFORE the target shifts positions', () => {
		// The AHCCD case: a station variable (not station_data) skips Variable
		// Options and Additional Details, leaving:
		//   [dataset, variable, location, sendRequest, result]
		// Location is filtered position 3 but full ordinal 4. The full-space
		// reset gate must see ordinal 4, not the filtered position 3: with 4 the
		// boundary holds (4 > 4 preserves Location); with 3 it would wipe the
		// Location being navigated to (4 > 3).
		const filtered = [
			'dataset',
			'variable',
			'location',
			'sendRequest',
			'result',
		] as const;

		test('Location at filtered position 3 resolves to full ordinal 4', () => {
			expect(resolveFullStepOrdinal(FULL_STEPS, filtered, 3)).toBe(4);
		});

		test.each([
			[1, 1],
			[2, 2],
			[3, 4],
			[4, 6],
			[5, 7],
		])(
			'filtered position %i resolves to full ordinal %i',
			(filteredPosition, expectedOrdinal) => {
				expect(
					resolveFullStepOrdinal(FULL_STEPS, filtered, filteredPosition)
				).toBe(expectedOrdinal);
			}
		);
	});

	describe('a step skipped FURTHER ALONG shifts only later positions', () => {
		// Skipping only Additional Details (station_data keeps step 5, but this
		// exercises a mid-list skip) leaves:
		//   [dataset, variable, variableOptions, location, sendRequest, result]
		// Positions up to Location are unaffected; Send Request slides from
		// filtered position 5 to full ordinal 6.
		const filtered = [
			'dataset',
			'variable',
			'variableOptions',
			'location',
			'sendRequest',
			'result',
		] as const;

		test('Send Request at filtered position 5 resolves to full ordinal 6', () => {
			expect(resolveFullStepOrdinal(FULL_STEPS, filtered, 5)).toBe(6);
		});

		test('positions before the skip are unchanged', () => {
			expect(resolveFullStepOrdinal(FULL_STEPS, filtered, 4)).toBe(4);
		});
	});

	describe('boundary — the target step maps to itself, never past it', () => {
		// With a skip before it, the target's resolved ordinal must equal its own
		// full ordinal so the strict-greater reset gate preserves it. Here
		// Location (full ordinal 4) is the target: it must resolve to exactly 4,
		// so a `fullOrdinal > target` gate over the full step space leaves
		// Location untouched.
		const filtered = [
			'dataset',
			'variable',
			'location',
			'sendRequest',
			'result',
		] as const;

		test('resolved ordinal equals the target ordinal (4), not the filtered position (3)', () => {
			const resolved = resolveFullStepOrdinal(FULL_STEPS, filtered, 3);
			expect(resolved).toBe(4);
			expect(resolved).not.toBe(3);
			expect(FULL_STEPS[resolved - 1]).toBe('location');
		});
	});
});
