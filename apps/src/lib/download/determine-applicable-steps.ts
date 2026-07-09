import {
	type ClimateVariableInterface,
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
 * Climate-variable ids for which step 6 (Send Request) is skipped because there
 * is no file format to choose.
 *
 * @remarks
 * These are the "Future Building Design Value Summaries" and "Short-duration
 * Rainfall IDF Data" datasets.
 */
const SEND_REQUEST_SKIP_IDS = new Set<string>([
	'future_building_design_value_summaries',
	'short_duration_rainfall_idf_data',
]);

/**
 * Determine whether a given Download wizard step is applicable (i.e. is NOT
 * skipped) for the supplied climate variable.
 *
 * @remarks
 * Pure and outside of component logic so we can reliably write and
 * manage which steps to "skip" when returning on a past choice using
 * the pencil icon.
 * Functionally, a skipped step must contribute NOTHING to the reset payload.
 * Per-field getter checks alone does NOT achieve that.
 *  — step 5's `dateRange` is unconditional, so a station
 * variable (step 5 skipped) must not contribute a `dateRange` reset. Modelling
 * applicability explicitly preserves that.
 *
 * Skip rules ("station variables" only — all steps apply to non-station
 * variables, and to the `null` variable):
 * - step 3 (Variable Options) is skipped;
 * - step 5 (Additional Details) is skipped unless the id is `station_data`;
 * - step 6 (Send Request) is skipped for the two no-file-format ids.
 *
 * @param climateVariable - The climate-variable instance, or `null` when none
 *   is selected yet (every step is applicable).
 * @param step - The 1-based ordinal step number (see {@link DOWNLOAD_STEPS}).
 * @returns `true` when the step is rendered for this variable, `false` when it
 *   is skipped.
 */
export function determineStepApplicable(
	climateVariable: ClimateVariableInterface | null,
	step: number
): boolean {
	if (!climateVariable) {
		return true;
	}

	const isStationVariable = STATION_VARIABLE_CLASSES.has(
		climateVariable.getClass()
	);
	if (!isStationVariable) {
		return true;
	}

	const variableId = climateVariable.getId();

	if (step === DOWNLOAD_STEPS.variableOptions) {
		return false;
	}

	if (step === DOWNLOAD_STEPS.additionalDetails) {
		return variableId === 'station_data';
	}

	if (step === DOWNLOAD_STEPS.sendRequest) {
		return !SEND_REQUEST_SKIP_IDS.has(variableId);
	}

	return true;
}
