import { describe, expect, test } from 'vitest';
import ClimateVariableBase from '@/lib/climate-variable-base';
import type { ClimateVariableInterface } from '@/types/climate-variable-interface';
import {
	readPopstateStep,
	resolvePopstateStep,
} from './resolve-popstate-step';

/**
 * Build a regular non-station variable.
 *
 * @remarks
 * Non-station variables keep every wizard step applicable, so these fixtures
 * isolate the range-clamp behavior from skip normalization.
 */
function createRegularVariable(): ClimateVariableInterface {
	return new ClimateVariableBase({
		class: 'ClimateVariableBase',
		id: 'regular_test',
	});
}

/**
 * Build a station variable whose structural skips are step 3 and step 5.
 */
function createStationVariable(): ClimateVariableInterface {
	return new ClimateVariableBase({
		class: 'StationClimateVariable',
		id: 'some_station_variable',
	});
}

describe('readPopstateStep', () => {
	test.each([
		null,
		undefined,
		'3',
		3,
		[],
		{},
		{ step: '3' },
		{ step: Number.NaN },
	])('returns null for foreign history state %#', (historyState) => {
		expect(readPopstateStep(historyState)).toBeNull();
	});

	test('returns the numeric step from recognized Download history state', () => {
		expect(readPopstateStep({ step: 3 })).toBe(3);
	});
});

describe('resolvePopstateStep', () => {
	test('returns null for foreign history state', () => {
		const climateVariable = createRegularVariable();
		const resolvedStep = resolvePopstateStep({
			climateVariable,
			currentStep: 2,
			historyState: { unrelated: 3 },
			stepCount: 7,
		});

		expect(resolvedStep).toBeNull();
	});

	test('clamps below the first step', () => {
		const climateVariable = createRegularVariable();
		const resolvedStep = resolvePopstateStep({
			climateVariable,
			currentStep: 2,
			historyState: { step: -4 },
			stepCount: 7,
		});

		expect(resolvedStep).toBe(1);
	});

	test('clamps above the live step count', () => {
		const climateVariable = createRegularVariable();
		const resolvedStep = resolvePopstateStep({
			climateVariable,
			currentStep: 4,
			historyState: { step: 12 },
			stepCount: 5,
		});

		expect(resolvedStep).toBe(5);
	});

	test('normalizes a skipped step forward when browser travel is forward', () => {
		const climateVariable = createStationVariable();
		const resolvedStep = resolvePopstateStep({
			climateVariable,
			currentStep: 2,
			historyState: { step: 3 },
			stepCount: 5,
		});

		expect(resolvedStep).toBe(4);
	});

	test('normalizes a skipped step backward when browser travel is backward', () => {
		const climateVariable = createStationVariable();
		const resolvedStep = resolvePopstateStep({
			climateVariable,
			currentStep: 4,
			historyState: { step: 3 },
			stepCount: 5,
		});

		expect(resolvedStep).toBe(2);
	});

	test('falls back to the opposite direction if no applicable step exists ahead', () => {
		const climateVariable = createStationVariable();
		const resolvedStep = resolvePopstateStep({
			climateVariable,
			currentStep: 4,
			historyState: { step: 5 },
			stepCount: 5,
		});

		expect(resolvedStep).toBe(4);
	});
});
