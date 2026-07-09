import { describe, expect, test } from 'vitest';
import type { ClimateVariableInterface } from '@/types/climate-variable-interface';
import { determineStepApplicable } from './determine-applicable-steps';
import { DOWNLOAD_STEPS } from './types';

/**
 * Build a minimal climate-variable stand-in exposing only the two methods the
 * predicate reads — `getClass()` and `getId()`.
 *
 * @remarks
 * Cast through `unknown` because the real interface has many more members that
 * {@link determineStepApplicable} never touches; modelling only the two getters
 * keeps this characterization test pinned to the predicate's actual inputs.
 */
function createVariableMock(
	className: string,
	id: string
): ClimateVariableInterface {
	return {
		getClass: () => className,
		getId: () => id,
	} as unknown as ClimateVariableInterface;
}

/**
 * A non-station variable — no skip rules apply, so every wizard step is
 * rendered.
 */
function createNonStationVariable(): ClimateVariableInterface {
	return createVariableMock('ClimateVariableBase', 'regular_test');
}

/**
 * A station variable with the given id — drives the station-only skip rules
 * (step 3 always, step 5 unless `station_data`, step 6 for the two
 * no-file-format ids).
 */
function createStationVariable(id: string): ClimateVariableInterface {
	return createVariableMock('StationClimateVariable', id);
}

/**
 * The full set of 1-based wizard ordinals, mirroring the `STEPS` tuple in
 * `components/download/config.ts`.
 */
const ALL_STEP_ORDINALS = [
	DOWNLOAD_STEPS.dataset,
	DOWNLOAD_STEPS.variable,
	DOWNLOAD_STEPS.variableOptions,
	DOWNLOAD_STEPS.location,
	DOWNLOAD_STEPS.additionalDetails,
	DOWNLOAD_STEPS.sendRequest,
	DOWNLOAD_STEPS.result,
] as const;

/**
 * The rendered-step set the provider computes: every ordinal the predicate
 * marks applicable for this variable. Equivalent to the provider's
 * `STEPS.filter((_, index) => determineStepApplicable(variable, index + 1))`.
 */
function applicableOrdinals(
	climateVariable: ClimateVariableInterface | null
): number[] {
	return ALL_STEP_ORDINALS.filter((step) =>
		determineStepApplicable(climateVariable, step)
	);
}

describe('determineStepApplicable', () => {
	describe('the rendered-step set matches the truth table', () => {
		test('null variable — none selected yet — every step applies', () => {
			expect(applicableOrdinals(null)).toEqual([
				DOWNLOAD_STEPS.dataset,
				DOWNLOAD_STEPS.variable,
				DOWNLOAD_STEPS.variableOptions,
				DOWNLOAD_STEPS.location,
				DOWNLOAD_STEPS.additionalDetails,
				DOWNLOAD_STEPS.sendRequest,
				DOWNLOAD_STEPS.result,
			]);
		});

		test('non-station variable — every step applies', () => {
			expect(applicableOrdinals(createNonStationVariable())).toEqual([
				DOWNLOAD_STEPS.dataset,
				DOWNLOAD_STEPS.variable,
				DOWNLOAD_STEPS.variableOptions,
				DOWNLOAD_STEPS.location,
				DOWNLOAD_STEPS.additionalDetails,
				DOWNLOAD_STEPS.sendRequest,
				DOWNLOAD_STEPS.result,
			]);
		});

		test('station "station_data" — skips step 3 only', () => {
			const climateVariable = createStationVariable('station_data');
			expect(applicableOrdinals(climateVariable)).toEqual([
				DOWNLOAD_STEPS.dataset,
				DOWNLOAD_STEPS.variable,
				DOWNLOAD_STEPS.location,
				DOWNLOAD_STEPS.additionalDetails,
				DOWNLOAD_STEPS.sendRequest,
				DOWNLOAD_STEPS.result,
			]);
		});

		test('station "ahccd" — skips steps 3 and 5', () => {
			const climateVariable = createStationVariable('ahccd');
			expect(applicableOrdinals(climateVariable)).toEqual([
				DOWNLOAD_STEPS.dataset,
				DOWNLOAD_STEPS.variable,
				DOWNLOAD_STEPS.location,
				DOWNLOAD_STEPS.sendRequest,
				DOWNLOAD_STEPS.result,
			]);
		});

		test('station "future_building_design_value_summaries" — skips steps 3, 5 and 6', () => {
			const climateVariable = createStationVariable(
				'future_building_design_value_summaries'
			);
			expect(applicableOrdinals(climateVariable)).toEqual([
				DOWNLOAD_STEPS.dataset,
				DOWNLOAD_STEPS.variable,
				DOWNLOAD_STEPS.location,
				DOWNLOAD_STEPS.result,
			]);
		});

		test('station "short_duration_rainfall_idf_data" — skips steps 3, 5 and 6', () => {
			const climateVariable = createStationVariable(
				'short_duration_rainfall_idf_data'
			);
			expect(applicableOrdinals(climateVariable)).toEqual([
				DOWNLOAD_STEPS.dataset,
				DOWNLOAD_STEPS.variable,
				DOWNLOAD_STEPS.location,
				DOWNLOAD_STEPS.result,
			]);
		});
	});

	describe('both station class names trigger the station skip rules', () => {
		// The predicate treats StationClimateVariable and
		// StationDataClimateVariable identically; a generic (non-station_data)
		// station id skips step 3 and step 5 for both.
		test.each(['StationClimateVariable', 'StationDataClimateVariable'])(
			'class %s with a generic id skips steps 3 and 5',
			(className) => {
				const climateVariable = createVariableMock(className, 'ahccd');
				expect(applicableOrdinals(climateVariable)).toEqual([
					DOWNLOAD_STEPS.dataset,
					DOWNLOAD_STEPS.variable,
					DOWNLOAD_STEPS.location,
					DOWNLOAD_STEPS.sendRequest,
					DOWNLOAD_STEPS.result,
				]);
			}
		);
	});
});
