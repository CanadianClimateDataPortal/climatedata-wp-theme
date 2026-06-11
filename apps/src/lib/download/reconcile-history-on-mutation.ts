/**
 * Pure decision for reconciling the browser-history stack when Download wizard
 * step state mutates BELOW the stack top (CLIM-1410 T13, design D6
 * push-on-mutation).
 *
 * @remarks
 * Two trigger sites invalidate the forward tail of the history stack and must
 * be reconciled so the contract holds: after reconciliation (a) browser Forward
 * has nowhere to go (the stale forward tail is dead) and (b) browser Back moves
 * to the entry below the current step (or exits the SPA at the floor, per D4a).
 *
 * - **Edit-pencil jump** (`goToStep` downward): the UI is at the stack top
 *   (e.g. `{step:5}`) and jumps DOWN to an earlier target (e.g. step 2). A naive
 *   `pushState({step:2})` from the top appends `[…,5,2]`, sandwiching the stale
 *   `[3,4,5]` below the new top — Back would still land `{5}`. So the plan first
 *   walks the stack back to the target's existing entry with `history.go(delta)`
 *   (`delta = target − top`, negative), THEN `pushState({step: target})` to run
 *   WHATWG's "clear the forward session history" and discard the tail.
 *
 * - **Mutate-after-Back** (first step-state mutation after a browser Back): the
 *   history position is already AT the current step mid-stack, with a genuine
 *   forward tail. A plain `pushState({step: current})` from that position
 *   truncates the tail by construction. No `go` is needed (`delta = 0`).
 *
 * The mechanism is keyed on the live `history.state.step` versus the wizard's
 * `targetStep` — never on DOM events or snapshot diffs. The distinction between
 * the two sites falls out of that comparison: a history step ABOVE the target
 * means we are at/above the top after an Edit jump and must `go` down first; a
 * history step EQUAL to the target means we are already positioned and only push.
 *
 * Spec grounding: a `pushState` whose `entryToReplace` is null runs "Clear the
 * forward session history" — "Remove every session history entry … that has a
 * step greater than step" — so the stale tail is pruned natively (WHATWG HTML,
 * read live 2026-06-11). `replaceState` is rejected (it never clears the tail);
 * a bare `history.go` is rejected (it clears nothing and re-enters popstate).
 *
 * Accepted cost (per D6a): the truncating push leaves one same-step duplicate
 * entry below the new top. Landing on it via Back is an idempotent no-op (the
 * resolver returns the unchanged current step), so Back is never WRONG — it may
 * cost one extra press to move below the current step. This is the documented
 * D6a trade and is pinned by the colocated tests.
 */

/**
 * One step in the imperative history reconciliation, in execution order.
 *
 * @remarks
 * `go` carries a non-zero signed delta to traverse the stack to the target's
 * existing entry before truncation; it is omitted when the position is already
 * correct (the mutate-after-Back site). `push` always carries the absolute
 * target step to write the new top and run native forward-tail truncation.
 */
export interface HistoryReconciliationPlan {
	go: number | null;
	push: number;
}

interface ReconcileHistoryParams {
	currentHistoryStep: number | null;
	targetStep: number;
}

/**
 * Decide how to reconcile the history stack for a step-state mutation that
 * invalidates the forward tail.
 *
 * @param params.currentHistoryStep - The `step` read from `history.state` at the
 *   moment of mutation, or `null` when the state is foreign/untagged (treated as
 *   already positioned — push only, matching the mutate-after-Back site).
 * @param params.targetStep - The wizard step the UI is settling on.
 * @returns The plan: an optional `go` delta to reposition onto the target's
 *   existing entry, then a `push` of the target step to truncate the stale tail.
 *   Returns `null` when no reconciliation is needed (the history step already
 *   equals the target AND there is provably nothing to truncate is NOT knowable
 *   here, so a push is still emitted — see remarks).
 */
export function reconcileHistoryOnMutation({
	currentHistoryStep,
	targetStep,
}: ReconcileHistoryParams): HistoryReconciliationPlan {
	// History step ABOVE the target ⇒ Edit-pencil downward jump from at/above the
	// stack top. Walk back to the target's existing entry first, THEN push to
	// truncate the sandwiched tail. The delta is negative (we move backward).
	const isDownwardEditJump =
		currentHistoryStep !== null && currentHistoryStep > targetStep;
	if (isDownwardEditJump) {
		const delta = targetStep - currentHistoryStep;
		return {
			go: delta,
			push: targetStep,
		};
	}

	// History step EQUAL to the target (or foreign/untagged) ⇒ already positioned
	// mid-stack (mutate-after-Back) or at the floor. A plain push truncates the
	// forward tail by construction; no traversal needed.
	return {
		go: null,
		push: targetStep,
	};
}
