/**
 * Translate a position in the VISIBLE step list into its ordinal in the FULL
 * step list.
 *
 * @remarks
 * The Download wizard keeps step numbers in two different 1-based index spaces
 * that only coincide when no steps are hidden:
 *
 * - The FULL space is the fixed {@link STEPS} tuple in
 *   {@link ../../components/download/config.ts} (always 7 entries). The reset
 *   gating in `context/download-provider.tsx` — and the ordinal constants in
 *   {@link ./types.ts} — are expressed in this space, so ordinal 4 always means
 *   "Location" regardless of the selected variable.
 * - The VISIBLE space is the `steps` state the provider derives by hiding the
 *   steps that do not apply to the current variable (station variables hide
 *   Variable Options and Additional Details, and two ids also hide Send
 *   Request). The wizard renders from this list and the step-summary edit
 *   pencils emit `goToStep(index + 1)`, where `index` is a position WITHIN this
 *   shorter list.
 *
 * For a variable with no hidden steps the two spaces are identical, so a
 * visible position needs no translation. For a station variable they diverge:
 * e.g. with the visible list `[Dataset, Variable, Location, Send Request,
 * Result]`, Location sits at visible position 3 but full ordinal 4. Feeding the
 * visible position straight into the full-space reset gates makes them reset
 * the very step being navigated to (`4 > 3` is true, so Location gets wiped).
 * Converting to the full ordinal first restores the intended boundary
 * (`4 > 4` is false, so Location is preserved).
 *
 * The provider's `steps` list is `STEPS.filter(...)`, so each visible entry is
 * the SAME object reference as its counterpart in the full tuple. That is why
 * the ordinal can be recovered with a reference-equality `indexOf` rather than a
 * value comparison. The helper stays generic and takes both arrays as arguments
 * so it depends on neither the config nor the provider (respecting the
 * lib -> components layering).
 *
 * @typeParam T - The element type shared by both lists (the wizard passes React
 *   step-component references).
 * @param fullSteps - The complete, ordered list of steps — none hidden.
 * @param visibleSteps - The list actually rendered after the variable hides its
 *   inapplicable steps; every entry must be a reference into `fullSteps`.
 * @param visiblePosition - The 1-based position within `visibleSteps`.
 * @returns The 1-based ordinal of that step within `fullSteps`. Falls back to
 *   `visiblePosition` unchanged when the referenced step is absent from
 *   `fullSteps` (e.g. an out-of-range position); in the wizard this branch is
 *   unreachable because the visible list is always a subsequence of the full
 *   list by reference.
 */
export const resolveFullStepOrdinal = <T>(
	fullSteps: readonly T[],
	visibleSteps: readonly T[],
	visiblePosition: number,
): number => {
	const visibleIndex = visiblePosition - 1;
	const step = visibleSteps[visibleIndex];
	const fullIndex = fullSteps.indexOf(step);

	if (fullIndex === -1) {
		return visiblePosition;
	}

	return fullIndex + 1;
};
