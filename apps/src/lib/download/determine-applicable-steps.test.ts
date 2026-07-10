import { describe, expect, test } from 'vitest';
import type { ClimateVariableInterface } from '@/types/climate-variable-interface';
import {
	createResolveStepApplicable,
	type StationStepPolicy,
} from './determine-applicable-steps';

/**
 * Create a mock climate variable exposing only the two getters the lookup reads.
 */
const createMockClimateVariable = ({
	class: className,
	id,
}: {
	class: string;
	id: string;
}): ClimateVariableInterface =>
	({
		getClass: () => className,
		getId: () => id,
	}) as unknown as ClimateVariableInterface;

// Synthetic fixtures — deliberately unrelated to the real dataset roster, so
// these tests exercise the lookup MECHANICS, not memorised dataset behaviour.
// The step numbers are arbitrary set members, not real full-flow step numbers.
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
		const climateVariable = createMockClimateVariable({
			class: 'NotAStation',
			id: 'known_id',
		});
		expect(resolve(climateVariable, 2)).toBe(true);
	});

	test('station class, id in the table: the table row decides', () => {
		const climateVariable = createMockClimateVariable({
			class: 'StationLike',
			id: 'known_id',
		});
		// Row is {2, 4}: those steps are skipped, an absent one (3) applies.
		expect(resolve(climateVariable, 2)).toBe(false);
		expect(resolve(climateVariable, 4)).toBe(false);
		expect(resolve(climateVariable, 3)).toBe(true);
	});

	test('station class, id absent from the table: the default set decides', () => {
		const climateVariable = createMockClimateVariable({
			class: 'StationLike',
			id: 'unlisted_id',
		});
		// Default is {7}: only 7 is skipped, everything else applies.
		expect(resolve(climateVariable, 7)).toBe(false);
		expect(resolve(climateVariable, 2)).toBe(true);
	});
});
