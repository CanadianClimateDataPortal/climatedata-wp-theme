import type { ClimateVariableInterface } from '@/types/climate-variable-interface';

import S2DClimateVariable from '@/lib/s2d-climate-variable';
import { determineStepApplicable } from './determine-applicable-steps';
import {
	DOWNLOAD_STEPS,
	type ResetPayload,
	type StepResetAccumulator,
} from './types';

/**
 * Build the reset-payload contribution for step 3 ({@link DOWNLOAD_STEPS.variableOptions}).
 *
 * @remarks
 * This field set must track what the {@link StepVariableOptions} component
 * collects — the two ends of the same step must stay in sync.
 *
 * Resets the Variable Options fields, each only when the variable exposes it.
 * `forecastType` is S2D-only, gated on `instanceof S2DClimateVariable`.
 */
const buildVariableOptionsPayload = (
	climateVariable: ClimateVariableInterface,
): StepResetAccumulator => {
	const payload: StepResetAccumulator = {};

	if (climateVariable.getVersions()?.length) {
		payload.version = null;
	}

	if (climateVariable.getFrequencyConfig()) {
		payload.frequency = null;
	}

	if (climateVariable.getAveragingOptions()?.length) {
		payload.averagingType = null;
	}

	if (climateVariable.getAnalysisFields()?.length) {
		payload.analysisFieldValues = {};
	}

	if (climateVariable.getThreshold() != null) {
		payload.threshold = null;
	}

	if (climateVariable instanceof S2DClimateVariable) {
		payload.forecastType = null;
	}

	return payload;
};

/**
 * Build the reset-payload contribution for step 4 ({@link DOWNLOAD_STEPS.location}).
 *
 * @remarks
 * This field set must track what the {@link StepLocation} component collects.
 *
 * The three Location fields are unconditional: step 4 is never skipped, so it
 * always contributes them.
 */
const buildLocationPayload = (): StepResetAccumulator => {
	return {
		interactiveRegion: null,
		selectedPoints: {},
		selectedRegion: null,
	};
};

/**
 * Build the reset-payload contribution for step 5 ({@link DOWNLOAD_STEPS.additionalDetails}).
 *
 * @remarks
 * This field set must track what the {@link StepAdditionalDetails} component
 * collects.
 *
 * `dateRange` is UNCONDITIONAL within the step — the only thing that prevents a
 * station variable from resetting it is the step being skipped entirely, which
 * {@link determineStepApplicable} models upstream.
 */
const buildAdditionalDetailsPayload = (
	climateVariable: ClimateVariableInterface,
): StepResetAccumulator => {
	const payload: StepResetAccumulator = {};

	if (climateVariable instanceof S2DClimateVariable) {
		payload.selectedPeriods = [];
	}

	if (climateVariable.getFrequencyConfig()) {
		payload.frequency = null;
	}

	if (climateVariable.getAveragingOptions()?.length) {
		payload.averagingType = null;
	}

	payload.dateRange = climateVariable.getDefaultDateRange();

	if (climateVariable.getScenarios()?.length) {
		payload.analyzeScenarios = [];
	}

	if (climateVariable.getPercentileOptions()?.length) {
		payload.percentiles = [];
	}

	return payload;
};

/**
 * The shape of a per-step reset-payload builder map: 1-based step ordinal → a
 * function producing that step's reset fragment. Exported so tests can build a
 * worker from hypothetical builders.
 */
export type StepPayloadBuilders = ReadonlyMap<
	number,
	(climateVariable: ClimateVariableInterface) => StepResetAccumulator
>;

/**
 * Per-step reset-payload builders, keyed by 1-based ordinal step number.
 *
 * @remarks
 * Only steps 3–5 contribute reset fields. Step 1
 * ({@link DOWNLOAD_STEPS.dataset}) is intentionally absent — see the step-1
 * exclusion note on {@link buildResetPayloadForStepsAfter}. Steps 2, 6 and 7
 * carry no resettable climate-variable fields.
 */
const STEP_PAYLOAD_BUILDERS: StepPayloadBuilders = new Map([
	[DOWNLOAD_STEPS.variableOptions, buildVariableOptionsPayload],
	[DOWNLOAD_STEPS.location, () => buildLocationPayload()],
	[DOWNLOAD_STEPS.additionalDetails, buildAdditionalDetailsPayload],
]);

/**
 * Build a reset-payload worker bound to a set of per-step builders and a step
 * applicability predicate — a factory so tests can exercise the walk/merge
 * mechanics with synthetic builders and predicates.
 */
export const createBuildResetPayloadForStepsAfter = (
	stepPayloadBuilders: StepPayloadBuilders,
	isStepApplicable: (
		climateVariable: ClimateVariableInterface | null,
		step: number,
	) => boolean,
) => (
	climateVariable: ClimateVariableInterface | null,
	targetStep: number,
): ResetPayload => {
	if (!climateVariable) {
		return {};
	}

	const orderedSteps = Array.from(stepPayloadBuilders.keys()).sort(
		(stepA, stepB) => stepA - stepB,
	);

	const payload: StepResetAccumulator = {};

	for (const step of orderedSteps) {
		const isAfterTarget = step > targetStep;
		if (!isAfterTarget) {
			continue;
		}

		if (!isStepApplicable(climateVariable, step)) {
			continue;
		}

		const buildStepPayload = stepPayloadBuilders.get(step)!;
		const stepPayload = buildStepPayload(climateVariable);
		Object.assign(payload, stepPayload);
	}

	return payload as ResetPayload;
};

/**
 * Derive the combined reset payload for every Download wizard step AFTER a
 * target step, without depending on which step components are currently
 * mounted.
 *
 * @remarks
 * Walks the applicable steps in ascending ordinal order and shallow-merges each
 * step's contribution, so for keys shared between steps (`frequency` and
 * `averagingType`, the latter of type {@link AveragingType}, appear in both
 * step 3 and step 5) the later step wins.
 *
 * Skip semantics: a step that is skipped for the given variable contributes
 * nothing. {@link determineStepApplicable} is the single source of that logic;
 * per-field getter gating alone would wrongly inject step 5's unconditional
 * `dateRange` for station variables.
 *
 * Step-1 exclusion: `dataset` ({@link DOWNLOAD_STEPS.dataset}) lives in the
 * download slice, not the climate-variable config, so merging it through
 * `updateClimateVariable` would be a no-op. It is deliberately NOT emitted here.
 *
 * @param climateVariable - The climate-variable instance, or `null` when none
 *   is selected (yields `{}`).
 * @param targetStep - The 1-based step being navigated back to; only steps
 *   strictly greater than this contribute.
 * @returns A partial climate-variable config to shallow-merge via
 *   `updateClimateVariable`. Empty when there is nothing to reset.
 *
 * @example
 * // Navigating back to step 1 with a regular variable resets all later steps.
 * buildResetPayloadForStepsAfter(regularVariable, 1);
 *
 * @see {@link determineStepApplicable}
 * @see {@link DOWNLOAD_STEPS}
 */
export const buildResetPayloadForStepsAfter = createBuildResetPayloadForStepsAfter(
	STEP_PAYLOAD_BUILDERS,
	determineStepApplicable,
);
