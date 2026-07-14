/**
 * @file Download URL Serialization — Shared Scenario Fixtures
 *
 * Slim, named scenario factories for the Download query serializer. Each factory
 * builds one `DownloadUrlScenario`: the slice values the builder receives plus
 * the exact query string BOTH call sites must emit. Tests read these as data,
 * not setup.
 *
 * The drift guard these fixtures exist for: `buildDownloadUrlParams` is the one
 * serializer, called from two places that must never disagree —
 * - the writer in `use-download-url-sync.ts` (fresh `URLSearchParams` -> builder
 *   -> `.toString()`), and
 * - the `selectDownloadUrlSearch` selector (same fresh-then-build shape).
 *
 * `makeDownloadRootState` maps a scenario onto the minimal Redux state slices the
 * selector reads (`download.currentStep`, `download.dataset.term_id`,
 * `climateVariable.data.id`), so one scenario drives both the direct-builder
 * assertion and the selector parity assertion.
 *
 * @see {@link ./build-download-url-params.ts} — the serializer under test
 * @see {@link ../../features/download/download-url-sync-slice.ts} — selectDownloadUrlSearch
 * @see {@link ../../hooks/use-download-url-sync.ts} — the debounced writer call site
 */

import type { RootState } from '@/app/store';
import type { TaxonomyData } from '@/types/types';
import type { DownloadUrlParamsInput } from './build-download-url-params';

/**
 * One named Download serialization scenario.
 *
 * `input` is what the pure builder receives; `expected` is the exact query
 * string (no leading `?`) that both the writer and `selectDownloadUrlSearch`
 * must produce for that state.
 */
export interface DownloadUrlScenario {
	readonly label: string;
	readonly input: DownloadUrlParamsInput;
	readonly expected: string;
}

/**
 * Fixture identifiers. Values are arbitrary but fixed so the expected query
 * strings below are deterministic and easy to eyeball.
 */
const DOWNLOAD_FIXTURE_DATASET_TERM_ID = 42;
const DOWNLOAD_FIXTURE_VARIABLE_ID = 'tx_max';

/**
 * Step 1, no variable set — the gate emits nothing.
 *
 * @returns Scenario expecting the empty query string.
 */
export const downloadScenarioStepOneNoVariable = (): DownloadUrlScenario => ({
	label: 'step 1, nothing selected',
	input: {
		currentStep: 1,
		datasetTermId: null,
		climateVariableId: null,
	},
	expected: '',
});

/**
 * Step 1, dataset already in state — the step-1 gate clears both keys, so the
 * dataset must NOT leak into the query.
 *
 * @returns Scenario expecting the empty query string despite a dataset in state.
 */
export const downloadScenarioStepOneWithDataset = (): DownloadUrlScenario => ({
	label: 'step 1, dataset in state (gate clears both)',
	input: {
		currentStep: 1,
		datasetTermId: DOWNLOAD_FIXTURE_DATASET_TERM_ID,
		climateVariableId: null,
	},
	expected: '',
});

/**
 * Past step 1, dataset and variable both set — the full Download query, keys in
 * deterministic order (`dataset` then `var`).
 *
 * @returns Scenario expecting `dataset=<termId>&var=<variableId>`.
 */
export const downloadScenarioPastStepWithVariable = (): DownloadUrlScenario => ({
	label: 'step > 1, dataset and variable set',
	input: {
		currentStep: 2,
		datasetTermId: DOWNLOAD_FIXTURE_DATASET_TERM_ID,
		climateVariableId: DOWNLOAD_FIXTURE_VARIABLE_ID,
	},
	expected: `dataset=${DOWNLOAD_FIXTURE_DATASET_TERM_ID}&var=${DOWNLOAD_FIXTURE_VARIABLE_ID}`,
});

/**
 * Past step 1, dataset set but no variable yet — only the dataset key is
 * emitted.
 *
 * @returns Scenario expecting `dataset=<termId>`.
 */
export const downloadScenarioPastStepDatasetOnly = (): DownloadUrlScenario => ({
	label: 'step > 1, dataset only',
	input: {
		currentStep: 2,
		datasetTermId: DOWNLOAD_FIXTURE_DATASET_TERM_ID,
		climateVariableId: null,
	},
	expected: `dataset=${DOWNLOAD_FIXTURE_DATASET_TERM_ID}`,
});

/**
 * Every Download scenario, in table order. Fed straight into `test.each`.
 *
 * @returns The four pinned-contract scenarios.
 */
export const downloadUrlScenarios = (): readonly DownloadUrlScenario[] => [
	downloadScenarioStepOneNoVariable(),
	downloadScenarioStepOneWithDataset(),
	downloadScenarioPastStepWithVariable(),
	downloadScenarioPastStepDatasetOnly(),
];

/**
 * Build the minimal `RootState` the `selectDownloadUrlSearch` selector reads for
 * a scenario. Only the three fields the selector consumes are populated; the
 * rest of the store is intentionally absent and the object is cast once, because
 * wiring a full store would test the reducers, not the serializer parity.
 *
 * @param scenario - The scenario whose `input` drives the mock slices.
 * @returns A `RootState` carrying only `download` and `climateVariable`.
 */
export const makeDownloadRootState = (
	scenario: DownloadUrlScenario,
): RootState => {
	const { input } = scenario;

	const dataset: TaxonomyData | null = input.datasetTermId != null
		? {
			term_id: input.datasetTermId,
			title: { en: 'Fixture dataset' },
		}
		: null;

	const climateVariableData = input.climateVariableId != null
		? { id: input.climateVariableId, class: 'temperature' }
		: null;

	return {
		download: {
			currentStep: input.currentStep,
			dataset,
		},
		climateVariable: {
			data: climateVariableData,
		},
	} as unknown as RootState;
};
