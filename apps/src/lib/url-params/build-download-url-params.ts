import { URL_PARAMS } from './param-names';

/**
 * The slice values the Download URL query is serialized from.
 *
 * Mirrors what the Download url-sync hook reads. Passing them in keeps this a
 * pure function so both url-sync and the language switcher share one
 * serialization. The step-1 reset side effect is intentionally NOT here — it
 * stays in the hook (see `use-download-url-sync.ts`).
 */
export interface DownloadUrlParamsInput {
	/**
	 * The wizard step — a serialization gate, not a URL param (never written to
	 * the query).
	 * @see {@link buildDownloadUrlParams} — the step-1 emit/clear gate below.
	 * @see {@link selectDownloadUrlSearch} — switcher reader on the same gate.
	 */
	currentStep: number;
	/**
	 * @see {@link URL_PARAMS.DATASET} for the mapping of this value to the URL query param `?dataset=`.
	 */
	datasetTermId: number | null | undefined;
	/**
	 * @see {@link URL_PARAMS.VARIABLE_ID} for the mapping of this value to the URL query param `?var=`.
	 */
	climateVariableId: string | null | undefined;
}

/**
 * Serialize the Download state into a URL parameter list, in place.
 *
 * Past step 1, the selected dataset (and, once chosen, the variable) are added.
 * On step 1 both are removed — the Download page only ever carries `dataset`
 * and `var`, so a step-1 switch lands on the dataset-choice step (accepted, see
 * ticket DI2).
 *
 * @param params - URL parameters to mutate (existing unrelated params are kept).
 * @param input - Download slice values to serialize.
 */
export const buildDownloadUrlParams = (
	params: URLSearchParams,
	input: DownloadUrlParamsInput,
): void => {
	const {
		currentStep,
		datasetTermId,
		climateVariableId,
	} = input;

	// Only include parameters if we're past step 1
	if (currentStep > 1) {
		if (datasetTermId) {
			params.set(URL_PARAMS.DATASET, datasetTermId.toString());

			// Only include variable if we have a selected variable
			if (climateVariableId) {
				params.set(URL_PARAMS.VARIABLE_ID, climateVariableId);
			}
		}
	} else {
		// Clear params when on step 1
		params.delete(URL_PARAMS.VARIABLE_ID);
		params.delete(URL_PARAMS.DATASET);
	}
};
