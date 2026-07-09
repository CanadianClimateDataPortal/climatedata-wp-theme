import {
	type ClimateVariableInterface,
	StationVariableIds,
} from '@/types/climate-variable-interface';
import { DOWNLOAD_STEPS } from './types';

/**
 * Class names whose variables are treated as "station" variables by the
 * Download wizard's step-skipping logic.
 *
 * @remarks
 * Kept as a private `Set` so the membership test reads as a single predicate.
 */
const STATION_VARIABLE_CLASSES = new Set<string>([
	'StationClimateVariable',
	'StationDataClimateVariable',
]);

/**
 * A station-variable skip policy. `byId` maps a known station id → the set of
 * {@link DOWNLOAD_STEPS} ordinals that id removes; `default` is the open-set
 * safety net applied to a station-class variable whose id is not in `byId`.
 * Exported so the lookup can be exercised with hypothetical policies in tests.
 */
export type StationStepPolicy = {
	byId: ReadonlyMap<string, ReadonlySet<number>>;
	default: ReadonlySet<number>;
};

/**
 * The real station-variable skip policy.
 *
 * @remarks
 * `byId` rows differ deliberately: `station_data` keeps Additional Details (only
 * Variable Options is skipped), while the building-design and IDF datasets also
 * skip Send Request — they have no file format to choose. `default` is the
 * open-set safety net: membership is by class, so a station-class variable whose
 * id has not been added to `byId` yet still skips Variable Options and
 * Additional Details.
 */
const STATION_STEP_POLICY: StationStepPolicy = {
	byId: new Map([
		[
			StationVariableIds.MSC_CLIMATE_NORMALS,
			new Set([
				DOWNLOAD_STEPS.variableOptions,
				DOWNLOAD_STEPS.additionalDetails,
			]),
		],
		[
			StationVariableIds.DAILY_AHCCD_TEMPERATURE_AND_PRECIPITATION,
			new Set([
				DOWNLOAD_STEPS.variableOptions,
				DOWNLOAD_STEPS.additionalDetails,
			]),
		],
		[
			StationVariableIds.STATION_DATA,
			new Set([
				DOWNLOAD_STEPS.variableOptions,
			]),
		],
		[
			StationVariableIds.FUTURE_BUILDING_DESIGN_VALUE_SUMMARIES,
			new Set([
				DOWNLOAD_STEPS.variableOptions,
				DOWNLOAD_STEPS.additionalDetails,
				DOWNLOAD_STEPS.sendRequest,
			]),
		],
		[
			StationVariableIds.SHORT_DURATION_RAINFALL_IDF_DATA,
			new Set([
				DOWNLOAD_STEPS.variableOptions,
				DOWNLOAD_STEPS.additionalDetails,
				DOWNLOAD_STEPS.sendRequest,
			]),
		],
	]),
	default: new Set([
		DOWNLOAD_STEPS.variableOptions,
		DOWNLOAD_STEPS.additionalDetails,
	]),
};

/**
 * Build a step-applicability resolver bound to a policy and station-class set —
 * a factory (a function that returns a function) so tests can build a resolver
 * from hypothetical policies, class names and skeleton variables.
 */
export const createResolveStepApplicable = (
	policy: StationStepPolicy,
	stationClasses: ReadonlySet<string>,
) => (
	climateVariable: ClimateVariableInterface | null,
	step: number,
): boolean => {
	if (!climateVariable) {
		return true;
	}

	if (!stationClasses.has(climateVariable.getClass())) {
		return true;
	}

	const skippedSteps =
		policy.byId.get(climateVariable.getId()) ?? policy.default;

	return !skippedSteps.has(step);
};

/**
 * Whether a given Download wizard step is applicable (i.e. NOT skipped) for the
 * supplied climate variable.
 *
 * The public entry point: {@link createResolveStepApplicable} bound to the real
 * constants.
 *
 * @remarks
 * This file is THE place for "station variable" step semantics. Membership is
 * by CLASS ({@link STATION_VARIABLE_CLASSES}) — an open set, so a station-class
 * variable whose id is not (yet) in {@link STATION_STEP_POLICY}'s `byId` still
 * gets its `default` treatment. Non-station variables and the `null` variable
 * keep every step.
 *
 * Pure and outside component logic so the same skip decision drives both the
 * rendered step list and the reset payload. A skipped step must contribute
 * NOTHING to the reset payload; per-field getter checks alone do NOT achieve
 * that — step 5's `dateRange` is unconditional, so a station variable with step
 * 5 skipped must not reset `dateRange`. Modelling applicability explicitly
 * preserves that.
 *
 * @param climateVariable - The climate-variable instance, or `null` when none
 *   is selected yet (every step is applicable).
 * @param step - The 1-based ordinal step number (see {@link DOWNLOAD_STEPS}).
 * @returns `true` when the step is rendered for this variable, `false` when it
 *   is skipped.
 */
export const determineStepApplicable = createResolveStepApplicable(
	STATION_STEP_POLICY,
	STATION_VARIABLE_CLASSES,
);
