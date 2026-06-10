import type { ClimateVariableInterface } from '@/types/climate-variable-interface';
import type { StepResetPayload } from '@/types/download-form-interface';
import S2DClimateVariable from '@/lib/s2d-climate-variable';
import { determineStepApplicable } from './determine-applicable-steps';
import { DOWNLOAD_STEPS, type ResetPayload } from './types';

/**
 * Build the reset-payload contribution for step 3 (Variable Options).
 *
 * @remarks
 * Mirrors the `getResetPayload` imperative handle in
 * `components/download/step-variable-options.tsx` field-for-field. The
 * `forecastType` field is gated on the S2D predicate (the same
 * `instanceof S2DClimateVariable` check `useS2D` exposes as `isS2DVariable`).
 */
function buildVariableOptionsPayload(
	climateVariable: ClimateVariableInterface
): StepResetPayload {
	const payload: StepResetPayload = {};

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
}

/**
 * Build the reset-payload contribution for step 4 (Location).
 *
 * @remarks
 * Mirrors the `getResetPayload` imperative handle in
 * `components/download/step-location.tsx`. The values are unconditional: step 4
 * is never skipped, so it always contributes these three fields.
 */
function buildLocationPayload(): StepResetPayload {
	return {
		interactiveRegion: null,
		selectedPoints: {},
		selectedRegion: null,
	};
}

/**
 * Build the reset-payload contribution for step 5 (Additional Details).
 *
 * @remarks
 * Mirrors the `getResetPayload` imperative handle in
 * `components/download/step-additional-details.tsx`. Note `dateRange` is
 * UNCONDITIONAL within the step — the only thing that prevents a station
 * variable from resetting `dateRange` is the step being skipped entirely, which
 * {@link determineStepApplicable} models upstream.
 */
function buildAdditionalDetailsPayload(
	climateVariable: ClimateVariableInterface
): StepResetPayload {
	const payload: StepResetPayload = {};

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
}

/**
 * Per-step reset-payload builders, keyed by 1-based ordinal step number.
 *
 * @remarks
 * Only steps that actually contribute a payload appear here:
 * - step 1 (Dataset) is intentionally absent (see LI1 below);
 * - step 2 (Variable), step 6 (Send Request) and step 7 (Result) only ever
 *   ran side-effecting `reset()` and never returned a payload.
 */
const STEP_PAYLOAD_BUILDERS: ReadonlyMap<
	number,
	(climateVariable: ClimateVariableInterface) => StepResetPayload
> = new Map([
	[DOWNLOAD_STEPS.variableOptions, buildVariableOptionsPayload],
	[DOWNLOAD_STEPS.location, () => buildLocationPayload()],
	[DOWNLOAD_STEPS.additionalDetails, buildAdditionalDetailsPayload],
]);

/**
 * Derive the combined reset payload for every Download wizard step AFTER a
 * target step, without depending on which step components are currently
 * mounted.
 *
 * @remarks
 * This is the mount-independent replacement for the former `reduce` over
 * mounted step refs in `resetStepsAfter` (`context/download-provider.tsx`). It
 * walks the applicable steps in ascending ordinal order and shallow-merges each
 * step's contribution, so for keys shared between steps (`frequency` and
 * `averagingType` appear in both step 3 and step 5) the later step wins —
 * exactly matching the legacy ascending `reduce` merge order.
 *
 * Shape-table provenance: the per-step field sets and their gating come from
 * the verified Path A plan, cross-checked against the three step components
 * (`step-variable-options.tsx`, `step-location.tsx`,
 * `step-additional-details.tsx`). The S2D gate uses
 * `instanceof S2DClimateVariable`, the same predicate `useS2D` exposes.
 *
 * Skip semantics: a step that is skipped for the given variable contributes
 * nothing, reproducing the mounted-ref behaviour where a skipped step never
 * registered a ref. {@link determineStepApplicable} is the single source of
 * that logic; per-field getter gating alone would wrongly inject step 5's
 * unconditional `dateRange` for station variables.
 *
 * LI1 exclusion: the legacy step-1 (Dataset) handle returned `dataset: null`,
 * but `dataset` lives in the download slice, not the climate-variable config —
 * dispatching it through `updateClimateVariable` was a latent no-op, harmless
 * only because step 1 is never a reset target. It is deliberately NOT emitted
 * here.
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
export function buildResetPayloadForStepsAfter(
	climateVariable: ClimateVariableInterface | null,
	targetStep: number
): ResetPayload {
	if (!climateVariable) {
		return {};
	}

	const orderedSteps = Array.from(STEP_PAYLOAD_BUILDERS.keys()).sort(
		(stepA, stepB) => stepA - stepB
	);

	const payload: StepResetPayload = {};

	for (const step of orderedSteps) {
		const isAfterTarget = step > targetStep;
		if (!isAfterTarget) {
			continue;
		}

		const isApplicable = determineStepApplicable(climateVariable, step);
		if (!isApplicable) {
			continue;
		}

		const buildStepPayload = STEP_PAYLOAD_BUILDERS.get(step)!;
		const stepPayload = buildStepPayload(climateVariable);
		Object.assign(payload, stepPayload);
	}

	return payload as ResetPayload;
}
