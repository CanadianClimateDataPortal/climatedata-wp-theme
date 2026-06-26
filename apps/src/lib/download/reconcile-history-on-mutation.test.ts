import { describe, expect, test } from 'vitest';
import { reconcileHistoryOnMutation } from './reconcile-history-on-mutation';

/**
 * Contract pinned here (CLIM-1410 T13 / D6 push-on-mutation):
 *
 * After reconciliation at either trigger site, the browser Forward tail is dead
 * and Back moves toward the floor. The pure decision below produces the
 * imperative plan (`go` then `push`); the provider applies it against
 * `window.history`.
 *
 * - Downward Edit-jump: history is ABOVE the target (at/above the stack top), so
 *   the plan walks back with a negative `go` delta to the target's existing
 *   entry, then pushes the target to truncate the sandwiched tail.
 * - Mutate-after-Back: history already EQUALS the target mid-stack, so the plan
 *   pushes the target with no traversal — the push truncates the forward tail.
 * - Floor / foreign state: no traversal, push only.
 */
describe('reconcileHistoryOnMutation', () => {
	test('downward Edit-jump walks back to the target then pushes to truncate', () => {
		// UI on step 5 (stack top {5}); Edit-pencil jumps down to step 2.
		const plan = reconcileHistoryOnMutation({
			currentHistoryStep: 5,
			targetStep: 2,
		});

		// go(-3) repositions onto the existing {2} entry, then push({2})
		// clears the sandwiched [3,4,5] forward tail.
		expect(plan.go).toBe(-3);
		expect(plan.push).toBe(2);
	});

	test('mutate-after-Back pushes the current step with no traversal', () => {
		// Back to step 3 (history positioned at {3}); first field mutation on
		// step 3 invalidates the live [4,5,6] forward tail.
		const plan = reconcileHistoryOnMutation({
			currentHistoryStep: 3,
			targetStep: 3,
		});

		expect(plan.go).toBeNull();
		expect(plan.push).toBe(3);
	});

	test('foreign or untagged history state is treated as already positioned', () => {
		// `history.state` not yet tagged with a step ⇒ push only, no traversal.
		const plan = reconcileHistoryOnMutation({
			currentHistoryStep: null,
			targetStep: 4,
		});

		expect(plan.go).toBeNull();
		expect(plan.push).toBe(4);
	});

	test('floor target from a higher position walks back then pushes', () => {
		// Edit-pencil down to step 1 from step 4.
		const plan = reconcileHistoryOnMutation({
			currentHistoryStep: 4,
			targetStep: 1,
		});

		expect(plan.go).toBe(-3);
		expect(plan.push).toBe(1);
	});

	test('a never-negative go delta is never produced for an equal history step', () => {
		// Guards the once-guard contract: repeated mutate-after-Back keystrokes
		// land here with currentHistoryStep === targetStep and must never walk.
		const plan = reconcileHistoryOnMutation({
			currentHistoryStep: 6,
			targetStep: 6,
		});

		expect(plan.go).toBeNull();
		expect(plan.push).toBe(6);
	});
});
