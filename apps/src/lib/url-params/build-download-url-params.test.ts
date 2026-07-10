import { describe, expect, test } from 'vitest';

import { selectDownloadUrlSearch } from '@/features/download/download-url-sync-slice';
import { buildDownloadUrlParams } from './build-download-url-params';
import {
	downloadScenarioPastStepWithVariable,
	downloadUrlScenarios,
	makeDownloadRootState,
} from './build-download-url-params.examples';

/**
 * Regression tests for the Download URL serializer contract.
 *
 * The switch-language href correctness rests on ONE serialization reaching TWO
 * call sites unchanged: the debounced writer in `use-download-url-sync.ts` and
 * the `selectDownloadUrlSearch` selector. These tests pin the exact output of
 * each and assert the selector can never drift from the builder.
 */
describe('buildDownloadUrlParams', () => {
	/**
	 * Layer 1 — the writer's exact shape: a FRESH `URLSearchParams`, mutated by
	 * the builder, then stringified. This is what the debounced writer emits.
	 */
	test.each(downloadUrlScenarios())(
		'writer path yields the pinned query for: $label',
		({ input, expected }) => {
			const params = new URLSearchParams();

			buildDownloadUrlParams(params, input);

			expect(params.toString()).toBe(expected);
		},
	);

	/**
	 * Layer 2 — the drift guard: the selector must produce the SAME string as the
	 * builder for every scenario. If a future edit changes one call site, this
	 * parity assertion fails.
	 */
	test.each(downloadUrlScenarios())(
		'selectDownloadUrlSearch matches the builder for: $label',
		(scenario) => {
			const state = makeDownloadRootState(scenario);

			expect(selectDownloadUrlSearch(state)).toBe(scenario.expected);
		},
	);
});
