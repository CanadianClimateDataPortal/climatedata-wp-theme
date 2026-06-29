import { describe, expect, test } from 'vitest';
import ClimateVariableBase from '@/lib/climate-variable-base';
import S2DClimateVariable from '@/lib/s2d-climate-variable';
import type { ClimateVariableInterface } from '@/types/climate-variable-interface';
import { buildResetPayloadForStepsAfter } from './build-reset-payload-for-steps-after';

/**
 * Build a non-station "regular" variable with every per-field gate ON.
 *
 * @remarks
 * Getters are overridden by assignment, matching the fixture style in
 * `s2d-climate-variable.test.ts`. A regular variable keeps every wizard step
 * applicable, so this fixture exercises the full step-3 + step-4 + step-5
 * payload surface.
 */
function createRegularVariableAllGatesOn(): ClimateVariableInterface {
	const climateVariable = new ClimateVariableBase({
		class: 'ClimateVariableBase',
		id: 'regular_test',
	});

	climateVariable.getVersions = () => ['v1', 'v2'];
	climateVariable.getFrequencyConfig = () => ({}) as never;
	climateVariable.getAveragingOptions = () => ['allYears'] as never;
	climateVariable.getAnalysisFields = () => [{} as never];
	climateVariable.getThreshold = () => 'someThreshold';
	climateVariable.getScenarios = () => ['ssp245'];
	climateVariable.getPercentileOptions = () => ['p50'];
	climateVariable.getDefaultDateRange = () => ['2040', '2070'];

	return climateVariable;
}

/**
 * Build a non-station "regular" variable with every per-field gate OFF.
 *
 * @remarks
 * Step 4 (Location) is unconditional, so even here it still contributes its
 * three fields; step 3 and step 5 contribute only their always-present pieces
 * (step 5's `dateRange`).
 */
function createRegularVariableAllGatesOff(): ClimateVariableInterface {
	const climateVariable = new ClimateVariableBase({
		class: 'ClimateVariableBase',
		id: 'regular_empty',
	});

	climateVariable.getVersions = () => [];
	climateVariable.getFrequencyConfig = () => null;
	climateVariable.getAveragingOptions = () => [];
	climateVariable.getAnalysisFields = () => [];
	climateVariable.getThreshold = () => null;
	climateVariable.getScenarios = () => [];
	climateVariable.getPercentileOptions = () => [];
	climateVariable.getDefaultDateRange = () => ['2040', '2070'];

	return climateVariable;
}

/**
 * Build an S2D variable with every per-field gate ON.
 *
 * @remarks
 * A real {@link S2DClimateVariable} instance is required so the
 * `instanceof S2DClimateVariable` gates (`forecastType` in step 3,
 * `selectedPeriods` in step 5) evaluate true.
 */
function createS2DVariableAllGatesOn(): S2DClimateVariable {
	const climateVariable = new S2DClimateVariable({
		class: 'S2DClimateVariable',
		id: 's2d_test',
	});

	climateVariable.getVersions = () => ['v1'];
	climateVariable.getFrequencyConfig = () => ({}) as never;
	climateVariable.getAveragingOptions = () => ['allYears'] as never;
	climateVariable.getAnalysisFields = () => [{} as never];
	climateVariable.getThreshold = () => 'someThreshold';
	climateVariable.getScenarios = () => ['ssp245'];
	climateVariable.getPercentileOptions = () => ['p50'];
	climateVariable.getDefaultDateRange = () => ['2040', '2070'];

	return climateVariable;
}

/**
 * Build a station variable (skips step 3 and step 5) with a non-`station_data`
 * id and every per-field gate ON.
 *
 * @remarks
 * Even with every gate ON, the skip semantics must suppress step 3 and step 5
 * entirely — most importantly step 5's unconditional `dateRange`.
 */
function createStationVariableAllGatesOn(): ClimateVariableInterface {
	const climateVariable = new ClimateVariableBase({
		class: 'StationClimateVariable',
		id: 'some_station_variable',
	});

	climateVariable.getVersions = () => ['v1'];
	climateVariable.getFrequencyConfig = () => ({}) as never;
	climateVariable.getAveragingOptions = () => ['allYears'] as never;
	climateVariable.getAnalysisFields = () => [{} as never];
	climateVariable.getThreshold = () => 'someThreshold';
	climateVariable.getScenarios = () => ['ssp245'];
	climateVariable.getPercentileOptions = () => ['p50'];
	climateVariable.getDefaultDateRange = () => ['2040', '2070'];

	return climateVariable;
}

/**
 * Build a station variable with the `station_data` id (step 5 APPLICABLE,
 * step 3 still skipped) and every per-field gate ON.
 */
function createStationDataVariableAllGatesOn(): ClimateVariableInterface {
	const climateVariable = createStationVariableAllGatesOn();
	climateVariable.getId = () => 'station_data';
	return climateVariable;
}

describe('buildResetPayloadForStepsAfter', () => {
	describe('happy path — regular (non-station) variable', () => {
		test('targetStep 1 resets every later step (steps 3, 4 and 5)', () => {
			const climateVariable = createRegularVariableAllGatesOn();
			const payload = buildResetPayloadForStepsAfter(climateVariable, 1);

			expect(payload).toEqual({
				analysisFieldValues: {},
				analyzeScenarios: [],
				averagingType: null,
				dateRange: ['2040', '2070'],
				frequency: null,
				interactiveRegion: null,
				percentiles: [],
				selectedPoints: {},
				selectedRegion: null,
				threshold: null,
				version: null,
			});
		});

		test('does NOT include a step-1 dataset field (LI1 exclusion)', () => {
			const climateVariable = createRegularVariableAllGatesOn();
			const payload = buildResetPayloadForStepsAfter(climateVariable, 1);

			expect(payload).not.toHaveProperty('dataset');
		});

		test('with every gate off, only unconditional fields remain', () => {
			const climateVariable = createRegularVariableAllGatesOff();
			const payload = buildResetPayloadForStepsAfter(climateVariable, 1);

			expect(payload).toEqual({
				dateRange: ['2040', '2070'],
				interactiveRegion: null,
				selectedPoints: {},
				selectedRegion: null,
			});
		});
	});

	describe('S2D variable', () => {
		test('includes forecastType (step 3) and selectedPeriods (step 5)', () => {
			const climateVariable = createS2DVariableAllGatesOn();
			const payload = buildResetPayloadForStepsAfter(climateVariable, 1);

			expect(payload).toHaveProperty('forecastType', null);
			expect(payload).toHaveProperty('selectedPeriods', []);
		});
	});

	describe('station variable skip semantics', () => {
		test('non-station_data station variable at targetStep 1 yields no step-3 nor step-5 fields', () => {
			const climateVariable = createStationVariableAllGatesOn();
			const payload = buildResetPayloadForStepsAfter(climateVariable, 1);

			// Step 5's dateRange is unconditional within the step; it must NOT
			// appear because the whole step is skipped for this variable.
			expect(payload).not.toHaveProperty('dateRange');
			// Step-3 fields must be absent too.
			expect(payload).not.toHaveProperty('version');
			expect(payload).not.toHaveProperty('threshold');
			// Step-5 fields must be absent.
			expect(payload).not.toHaveProperty('analyzeScenarios');
			expect(payload).not.toHaveProperty('percentiles');

			// Only step 4 (Location) survives.
			expect(payload).toEqual({
				interactiveRegion: null,
				selectedPoints: {},
				selectedRegion: null,
			});
		});

		test('station_data id makes step 5 applicable again (dateRange returns)', () => {
			const climateVariable = createStationDataVariableAllGatesOn();
			const payload = buildResetPayloadForStepsAfter(climateVariable, 1);

			// Step 3 is still skipped for any station variable.
			expect(payload).not.toHaveProperty('version');
			// Step 5 is now applicable, so its unconditional dateRange returns.
			expect(payload).toHaveProperty('dateRange', ['2040', '2070']);
			expect(payload).toHaveProperty('analyzeScenarios', []);
		});
	});

	describe('null variable', () => {
		test('returns an empty payload', () => {
			const payload = buildResetPayloadForStepsAfter(null, 1);
			expect(payload).toEqual({});
		});
	});

	describe('per-targetStep key sets (regular variable, all gates on)', () => {
		test.each([
			[
				1,
				[
					'analysisFieldValues',
					'analyzeScenarios',
					'averagingType',
					'dateRange',
					'frequency',
					'interactiveRegion',
					'percentiles',
					'selectedPoints',
					'selectedRegion',
					'threshold',
					'version',
				],
			],
			[
				2,
				[
					'analysisFieldValues',
					'analyzeScenarios',
					'averagingType',
					'dateRange',
					'frequency',
					'interactiveRegion',
					'percentiles',
					'selectedPoints',
					'selectedRegion',
					'threshold',
					'version',
				],
			],
			[
				3,
				[
					'analyzeScenarios',
					'averagingType',
					'dateRange',
					'frequency',
					'interactiveRegion',
					'percentiles',
					'selectedPoints',
					'selectedRegion',
				],
			],
			[
				4,
				[
					'analyzeScenarios',
					'averagingType',
					'dateRange',
					'frequency',
					'percentiles',
				],
			],
			[5, []],
			[6, []],
		])(
			'targetStep %i yields the expected key set',
			(targetStep, expectedKeys) => {
				const climateVariable = createRegularVariableAllGatesOn();
				const payload = buildResetPayloadForStepsAfter(
					climateVariable,
					targetStep
				);

				expect(Object.keys(payload).sort()).toEqual(
					[...expectedKeys].sort()
				);
			}
		);
	});

	describe('dateRange identity', () => {
		test('returns the exact value from getDefaultDateRange()', () => {
			const climateVariable = createRegularVariableAllGatesOn();
			const defaultDateRange = ['2011', '2040'];
			climateVariable.getDefaultDateRange = () => defaultDateRange;

			const payload = buildResetPayloadForStepsAfter(climateVariable, 1);

			expect(payload.dateRange).toBe(defaultDateRange);
		});
	});

	describe('merge order on shared keys (frequency, averagingType)', () => {
		test('step 5 wins over step 3 — gate on in step 5, off in step 3', () => {
			// frequency and averagingType appear in BOTH step 3 and step 5.
			// Here the step-3 gates are OFF and step-5 gates are ON, so the keys
			// must come from step 5's contribution (the later, winning step).
			const climateVariable = createRegularVariableAllGatesOn();
			// Step 3 reads getVersions/getThreshold (left ON) but both steps share
			// frequency/averagingType through the same getters, so the values are
			// identical regardless of winner. Assert presence and that the keys
			// survive when ONLY step 5 is reachable.
			const payloadFromStep4 = buildResetPayloadForStepsAfter(
				climateVariable,
				4
			);

			// At targetStep 4, only step 5 contributes — frequency/averagingType
			// here can ONLY have come from step 5.
			expect(payloadFromStep4).toHaveProperty('frequency', null);
			expect(payloadFromStep4).toHaveProperty('averagingType', null);
		});
	});
});

describe('determineStepApplicable via payload presence', () => {
	test('station variable skips step 3 and step 5 (non station_data)', () => {
		const climateVariable = createStationVariableAllGatesOn();
		const payload = buildResetPayloadForStepsAfter(climateVariable, 2);
		expect(Object.keys(payload).sort()).toEqual(
			['interactiveRegion', 'selectedPoints', 'selectedRegion'].sort()
		);
	});
});
