import type { ClimateVariableInterface } from '@/types/climate-variable-interface';
import { determineStepApplicable } from './determine-applicable-steps';

const FIRST_DOWNLOAD_STEP = 1;
const NO_TRAVEL_DIRECTION = 0;

interface ResolvePopstateStepParams {
	climateVariable: ClimateVariableInterface | null;
	currentStep: number;
	historyState: unknown;
	stepCount: number;
}

/**
 * Extract the Download wizard step from browser history state.
 *
 * @remarks
 * The Download SPA writes browser entries as `{ step: N }`. Foreign or initial
 * browser states can be `null`, primitives, or unrelated objects; those are
 * intentionally ignored so the browser's normal Back/Forward navigation is not
 * disrupted by a forced local step change.
 *
 * @param historyState - The raw `event.state` value from `popstate`.
 * @returns The requested 1-based step when the state shape is recognized, or
 *   `null` for foreign state.
 */
export function readPopstateStep(historyState: unknown): number | null {
	const isObjectState =
		typeof historyState === 'object' &&
		historyState !== null &&
		!Array.isArray(historyState);
	if (!isObjectState) {
		return null;
	}

	const maybeState = historyState as { step?: unknown };
	const requestedStep = maybeState.step;
	const isNumericStep =
		typeof requestedStep === 'number' &&
		Number.isFinite(requestedStep);
	if (!isNumericStep) {
		return null;
	}

	return requestedStep;
}

/**
 * Resolve a browser `popstate` target into the non-destructive Download step.
 *
 * @remarks
 * T7's guard is structural only: clamp the `{ step: N }` history state into the
 * live wizard range and normalize skipped steps with
 * {@link determineStepApplicable}. Content-level revalidation of an otherwise
 * structurally valid step is deferred to ticket task T10 / Path B because the
 * necessary slice-side validation selectors do not exist yet.
 *
 * @param params - Current wizard state and the raw browser history state.
 * @returns A safe local step, or `null` when the history state is foreign.
 */
export function resolvePopstateStep({
	climateVariable,
	currentStep,
	historyState,
	stepCount,
}: ResolvePopstateStepParams): number | null {
	const requestedStep = readPopstateStep(historyState);
	if (requestedStep === null) {
		return null;
	}

	const clampedStep = clampStep(requestedStep, stepCount);
	if (determineStepApplicable(climateVariable, clampedStep)) {
		return clampedStep;
	}

	const travelDirection = getTravelDirection(requestedStep, currentStep);
	const applicableStep = findNearestApplicableStep({
		climateVariable,
		startStep: clampedStep,
		stepCount,
		travelDirection,
	});
	if (applicableStep !== null) {
		return applicableStep;
	}

	return clampedStep;
}

function clampStep(step: number, stepCount: number): number {
	const lastStep = Math.max(FIRST_DOWNLOAD_STEP, Math.floor(stepCount));
	const integerStep = Math.trunc(step);
	return Math.min(Math.max(integerStep, FIRST_DOWNLOAD_STEP), lastStep);
}

function getTravelDirection(requestedStep: number, currentStep: number): number {
	if (requestedStep > currentStep) {
		return 1;
	}

	if (requestedStep < currentStep) {
		return -1;
	}

	return NO_TRAVEL_DIRECTION;
}

interface FindNearestApplicableStepParams {
	climateVariable: ClimateVariableInterface | null;
	startStep: number;
	stepCount: number;
	travelDirection: number;
}

function findNearestApplicableStep({
	climateVariable,
	startStep,
	stepCount,
	travelDirection,
}: FindNearestApplicableStepParams): number | null {
	const searchDirections =
		travelDirection === NO_TRAVEL_DIRECTION
			? [1, -1]
			: [travelDirection, travelDirection * -1];

	for (const direction of searchDirections) {
		const applicableStep = findApplicableStepInDirection({
			climateVariable,
			direction,
			startStep,
			stepCount,
		});
		if (applicableStep !== null) {
			return applicableStep;
		}
	}

	return null;
}

interface FindApplicableStepInDirectionParams {
	climateVariable: ClimateVariableInterface | null;
	direction: number;
	startStep: number;
	stepCount: number;
}

function findApplicableStepInDirection({
	climateVariable,
	direction,
	startStep,
	stepCount,
}: FindApplicableStepInDirectionParams): number | null {
	const lastStep = Math.max(FIRST_DOWNLOAD_STEP, Math.floor(stepCount));
	let candidateStep = startStep + direction;

	while (
		candidateStep >= FIRST_DOWNLOAD_STEP &&
		candidateStep <= lastStep
	) {
		if (determineStepApplicable(climateVariable, candidateStep)) {
			return candidateStep;
		}

		candidateStep += direction;
	}

	return null;
}
