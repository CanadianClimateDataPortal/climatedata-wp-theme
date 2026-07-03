import { describe, expect, test } from 'vitest';

import { selectMapUrlSearch } from '@/features/url-sync/url-sync-slice';
import { buildMapUrlParams } from './build-map-url-params';
import {
	makeMapRootState,
	mapUrlScenarios,
} from './build-map-url-params.examples';

/**
 * Regression tests for the Map URL serializer contract.
 *
 * Mirrors the Download tests: ONE serialization (`buildMapUrlParams`, the
 * writer's reference pattern) must reach the `selectMapUrlSearch` selector
 * unchanged. These tests pin the builder's exact output and assert the selector
 * can never drift from it.
 */
describe('buildMapUrlParams', () => {
	/**
	 * Layer 1 — the builder's exact output. Only scenarios with a climate
	 * variable reach the builder; the no-variable case is a selector-only guard
	 * covered below.
	 */
	test.each(mapUrlScenarios().filter((scenario) => scenario.input !== null))(
		'builder yields the pinned query for: $label',
		({ input, expected }) => {
			// The filter guarantees a non-null input for these rows.
			const params = buildMapUrlParams(input!);

			expect(params.toString()).toBe(expected);
		},
	);

	/**
	 * Layer 2 — the drift guard: the selector must produce the SAME string as the
	 * builder for every scenario, including the no-variable case where the
	 * selector short-circuits to `''` before the builder is called.
	 */
	test.each(mapUrlScenarios())(
		'selectMapUrlSearch matches the builder for: $label',
		(scenario) => {
			const state = makeMapRootState(scenario);

			expect(selectMapUrlSearch(state)).toBe(scenario.expected);
		},
	);
});
