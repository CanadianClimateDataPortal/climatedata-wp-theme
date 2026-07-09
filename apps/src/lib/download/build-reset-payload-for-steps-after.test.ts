import { describe, expect, test } from 'vitest';
import ClimateVariableBase from '@/lib/climate-variable-base';
import S2DClimateVariable from '@/lib/s2d-climate-variable';
import type { ClimateVariableInterface } from '@/types/climate-variable-interface';
import {
	buildResetPayloadForStepsAfter,
	createBuildResetPayloadForStepsAfter,
	type StepPayloadBuilders,
} from './build-reset-payload-for-steps-after';
import type { StepResetAccumulator } from './types';

// Mechanics: the walk/merge worker exercised with SYNTHETIC builders and a
// synthetic applicability predicate. No real climate variables and no real step
// ordinals — the step numbers here are arbitrary builder keys.
describe('createBuildResetPayloadForStepsAfter — walk/merge mechanics (synthetic)', () => {
	const variable = {} as ClimateVariableInterface;
	const applicableAlways = (): boolean => true;

	const buildersByStep: StepPayloadBuilders = new Map([
		[2, (): StepResetAccumulator => ({ fromStep2: true })],
		[4, (): StepResetAccumulator => ({ fromStep4: true })],
		[6, (): StepResetAccumulator => ({ fromStep6: true })],
	]);

	test('only steps strictly after the target contribute', () => {
		const build = createBuildResetPayloadForStepsAfter(
			buildersByStep,
			applicableAlways,
		);
		expect(build(variable, 4)).toEqual({ fromStep6: true });
	});

	test('ascending merge: a later step wins on a shared key', () => {
		const sharedKey: StepPayloadBuilders = new Map([
			[2, (): StepResetAccumulator => ({ shared: 'early' })],
			[4, (): StepResetAccumulator => ({ shared: 'late' })],
		]);
		const build = createBuildResetPayloadForStepsAfter(
			sharedKey,
			applicableAlways,
		);
		expect(build(variable, 0)).toEqual({ shared: 'late' });
	});

	test('a step the predicate rejects contributes nothing', () => {
		const onlyStep6 = (
			_climateVariable: ClimateVariableInterface | null,
			step: number,
		): boolean => step === 6;
		const build = createBuildResetPayloadForStepsAfter(
			buildersByStep,
			onlyStep6,
		);
		expect(build(variable, 0)).toEqual({ fromStep6: true });
	});

	test('no applicable steps → empty payload', () => {
		const build = createBuildResetPayloadForStepsAfter(
			buildersByStep,
			(): boolean => false,
		);
		expect(build(variable, 0)).toEqual({});
	});

	test('null variable → empty payload', () => {
		const build = createBuildResetPayloadForStepsAfter(
			buildersByStep,
			applicableAlways,
		);
		expect(build(null, 0)).toEqual({});
	});
});

/**
 * Mock full {@link STEP_PAYLOAD_BUILDERS} in isolation.
 */
const withGatesOn = <T extends ClimateVariableInterface>(variable: T): T => {
	variable.getVersions = () => ['v1'];
	variable.getFrequencyConfig = () => ({}) as never;
	variable.getAveragingOptions = () => ['allYears'] as never;
	variable.getAnalysisFields = () => [{} as never];
	variable.getThreshold = () => 'someThreshold';
	variable.getScenarios = () => ['ssp245'];
	variable.getPercentileOptions = () => ['p50'];
	variable.getDefaultDateRange = () => ['2040', '2070'];
	return variable;
};

const regularVariable = (): ClimateVariableInterface =>
	withGatesOn(
		new ClimateVariableBase({ class: 'ClimateVariableBase', id: 'regular' }),
	);

describe('buildResetPayloadForStepsAfter — real-constants smoke', () => {
	test('S2D forecastType (step 3) is gated by instanceof S2DClimateVariable', () => {
		const s2d = withGatesOn(
			new S2DClimateVariable({ class: 'S2DClimateVariable', id: 's2d_test' }),
		);
		expect(buildResetPayloadForStepsAfter(s2d, 1)).toHaveProperty(
			'forecastType',
			null,
		);
		expect(
			buildResetPayloadForStepsAfter(regularVariable(), 1),
		).not.toHaveProperty('forecastType');
	});

	test('station_data keeps Additional Details (dateRange); a generic station variable does not', () => {
		const stationData = withGatesOn(
			new ClimateVariableBase({
				class: 'StationClimateVariable',
				id: 'station_data',
			}),
		);
		expect(buildResetPayloadForStepsAfter(stationData, 1)).toHaveProperty(
			'dateRange',
		);

		const genericStation = withGatesOn(
			new ClimateVariableBase({ class: 'StationClimateVariable', id: 'ahccd' }),
		);
		expect(
			buildResetPayloadForStepsAfter(genericStation, 1),
		).not.toHaveProperty('dateRange');
	});

	test('shared keys merge with the later step winning (frequency/averagingType from step 5)', () => {
		// Target step 4 leaves only step 5 reachable, so these keys come from it.
		expect(buildResetPayloadForStepsAfter(regularVariable(), 4)).toMatchObject({
			averagingType: null,
			frequency: null,
		});
	});

	test('step 1 (dataset) is never emitted', () => {
		expect(
			buildResetPayloadForStepsAfter(regularVariable(), 1),
		).not.toHaveProperty('dataset');
	});
});
