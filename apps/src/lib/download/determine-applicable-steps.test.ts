import { describe, expect, test } from 'vitest';
import type { ClimateVariableInterface } from '@/types/climate-variable-interface';
import {
	createResolveStepApplicable,
	determineStepApplicable,
	type StationStepPolicy,
} from './determine-applicable-steps';
import { DOWNLOAD_STEPS } from './types';

/**
 * Skeleton variable exposing only the two getters the lookup reads.
 */
const makeVariable = (
	className: string,
	id: string,
): ClimateVariableInterface =>
	({
		getClass: () => className,
		getId: () => id,
	}) as unknown as ClimateVariableInterface;

// Synthetic fixtures — deliberately unrelated to the real dataset roster, so
// these tests exercise the lookup MECHANICS, not memorised dataset behaviour.
// The step numbers are arbitrary set members, not real ordinals.
const STATION_CLASSES: ReadonlySet<string> = new Set(['StationLike']);
const POLICY: StationStepPolicy = {
	byId: new Map([['known_id', new Set([2, 4])]]),
	default: new Set([7]),
};

const resolve = createResolveStepApplicable(POLICY, STATION_CLASSES);

describe('createResolveStepApplicable — lookup mechanics (synthetic fixtures)', () => {
	test('null variable: every step applies', () => {
		expect(resolve(null, 2)).toBe(true);
		expect(resolve(null, 7)).toBe(true);
	});

	test('class not in the station set: every step applies', () => {
		const variable = makeVariable('NotAStation', 'known_id');
		expect(resolve(variable, 2)).toBe(true);
	});

	test('station class, id in the table: the table row decides', () => {
		const variable = makeVariable('StationLike', 'known_id');
		// Row is {2, 4}: those steps are skipped, an absent one (3) applies.
		expect(resolve(variable, 2)).toBe(false);
		expect(resolve(variable, 4)).toBe(false);
		expect(resolve(variable, 3)).toBe(true);
	});

	test('station class, id absent from the table: the default set decides', () => {
		const variable = makeVariable('StationLike', 'unlisted_id');
		// Default is {7}: only 7 is skipped, everything else applies.
		expect(resolve(variable, 7)).toBe(false);
		expect(resolve(variable, 2)).toBe(true);
	});
});

// Minimal real-constants smoke: determineStepApplicable is
// createResolveStepApplicable bound to the real constants, so this only pins
// the two load-bearing
// behaviours the reviewer flagged. Full mechanics are covered above.
// TRIM ME if judged redundant with the synthetic suite.
describe('determineStepApplicable — real-constants smoke', () => {
	test('station_data keeps Additional Details', () => {
		const variable = makeVariable('StationClimateVariable', 'station_data');
		expect(
			determineStepApplicable(variable, DOWNLOAD_STEPS.additionalDetails),
		).toBe(true);
	});

	test('a no-file-format dataset also skips Send Request', () => {
		const variable = makeVariable(
			'StationClimateVariable',
			'future_building_design_value_summaries',
		);
		expect(
			determineStepApplicable(variable, DOWNLOAD_STEPS.sendRequest),
		).toBe(false);
	});
});
