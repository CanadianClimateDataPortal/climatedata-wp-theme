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

describe('createBuildResetPayloadForStepsAfter — walk/merge mechanics (synthetic)', () => {
	const climateVariable = {} as ClimateVariableInterface;
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
		expect(build(climateVariable, 4)).toEqual({ fromStep6: true });
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
		expect(build(climateVariable, 0)).toEqual({ shared: 'late' });
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
		expect(build(climateVariable, 0)).toEqual({ fromStep6: true });
	});

	test('no applicable steps → empty payload', () => {
		const build = createBuildResetPayloadForStepsAfter(
			buildersByStep,
			(): boolean => false,
		);
		expect(build(climateVariable, 0)).toEqual({});
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
 * Create a mock climate variable — a real instance (so `instanceof` gates hold)
 * with every per-field gate getter ON, so the real {@link STEP_PAYLOAD_BUILDERS}
 * all contribute in the smoke tests below.
 */
const createMockClimateVariable = ({
	class: className,
	id,
}: {
	class: string;
	id: string;
}): ClimateVariableInterface => {
	const climateVariable =
		className === 'S2DClimateVariable'
			? new S2DClimateVariable({ class: className, id })
			: new ClimateVariableBase({ class: className, id });
	climateVariable.getVersions = () => ['v1'];
	climateVariable.getFrequencyConfig = () => ({}) as never;
	climateVariable.getAveragingOptions = () => ['allYears'] as never;
	climateVariable.getAnalysisFields = () => [{} as never];
	climateVariable.getThreshold = () => 'someThreshold';
	climateVariable.getScenarios = () => ['ssp245'];
	climateVariable.getPercentileOptions = () => ['p50'];
	climateVariable.getDefaultDateRange = () => ['2040', '2070'];
	return climateVariable;
};

describe('buildResetPayloadForStepsAfter — real-constants smoke', () => {
	test('S2D forecastType (step 3) is gated by instanceof S2DClimateVariable', () => {
		const climateVariable = createMockClimateVariable({
			class: 'S2DClimateVariable',
			id: 's2d_test',
		});
		expect(buildResetPayloadForStepsAfter(climateVariable, 1)).toHaveProperty(
			'forecastType',
			null,
		);
		expect(
			buildResetPayloadForStepsAfter(
				createMockClimateVariable({
					class: 'ClimateVariableBase',
					id: 'regular',
				}),
				1,
			),
		).not.toHaveProperty('forecastType');
	});

	test('station_data keeps Additional Details (dateRange); a generic station variable does not', () => {
		const climateVariable = createMockClimateVariable({
			class: 'StationClimateVariable',
			id: 'station_data',
		});
		expect(buildResetPayloadForStepsAfter(climateVariable, 1)).toHaveProperty(
			'dateRange',
		);
		expect(
			buildResetPayloadForStepsAfter(
				createMockClimateVariable({
					class: 'StationClimateVariable',
					id: 'ahccd',
				}),
				1,
			),
		).not.toHaveProperty('dateRange');
	});

	test('shared keys merge with the later step winning (frequency/averagingType from step 5)', () => {
		const climateVariable = createMockClimateVariable({
			class: 'ClimateVariableBase',
			id: 'regular',
		});
		// Target step 4 leaves only step 5 reachable, so these keys come from it.
		expect(buildResetPayloadForStepsAfter(climateVariable, 4)).toMatchObject({
			averagingType: null,
			frequency: null,
		});
	});

	test('step 1 (dataset) is never emitted', () => {
		const climateVariable = createMockClimateVariable({
			class: 'ClimateVariableBase',
			id: 'regular',
		});
		expect(
			buildResetPayloadForStepsAfter(climateVariable, 1),
		).not.toHaveProperty('dataset');
	});
});
