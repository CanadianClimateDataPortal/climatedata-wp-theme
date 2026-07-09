/**
 * Translate a position in the variable-FILTERED step list into its ordinal in
 * the FULL step list.
 *
 * @remarks
 * The Download wizard keeps step numbers in two different 1-based index spaces
 * that only coincide when no steps are skipped:
 *
 * - The FULL space is the fixed {@link STEPS} tuple in
 *   {@link ../../components/download/config.ts} (always 7 entries). The reset
 *   gating in `context/download-provider.tsx` — and the ordinal constants in
 *   {@link ./types.ts} — are expressed in this space, so ordinal 4 always means
 *   "Location" regardless of the selected variable.
 * - The FILTERED space is the `steps` state the provider derives by dropping the
 *   steps that do not apply to the current variable (station variables skip
 *   Variable Options and Additional Details, and two ids also skip Send
 *   Request). The wizard renders from this list and the step-summary edit
 *   pencils emit `goToStep(index + 1)`, where `index` is a position WITHIN this
 *   shorter list.
 *
 * For a variable with no skipped steps the two spaces are identical, so a
 * filtered position needs no translation. For a station variable they diverge:
 * e.g. with the filtered list `[Dataset, Variable, Location, Send Request,
 * Result]`, Location sits at filtered position 3 but full ordinal 4. Feeding the
 * filtered position straight into the full-space reset gates makes them reset
 * the very step being navigated to (`4 > 3` is true, so Location gets wiped).
 * Converting to the full ordinal first restores the intended boundary
 * (`4 > 4` is false, so Location is preserved).
 *
 * The provider's `steps` list is `STEPS.filter(...)`, so each filtered entry is
 * the SAME object reference as its counterpart in the full tuple. That is why
 * the ordinal can be recovered with a reference-equality `indexOf` rather than a
 * value comparison. The helper stays generic and takes both arrays as arguments
 * so it depends on neither the config nor the provider (respecting the
 * lib -> components layering).
 *
 * @typeParam T - The element type shared by both lists (the wizard passes React
 *   step-component references).
 * @param fullSteps - The complete, unfiltered ordered list of steps.
 * @param filteredSteps - The variable-filtered list actually rendered; every
 *   entry must be a reference into `fullSteps`.
 * @param filteredPosition - The 1-based position within `filteredSteps`.
 * @returns The 1-based ordinal of that step within `fullSteps`. Falls back to
 *   `filteredPosition` unchanged when the referenced step is absent from
 *   `fullSteps` (e.g. an out-of-range position); in the wizard this branch is
 *   unreachable because the filtered list is always a subsequence of the full
 *   list by reference.
 */
export const resolveFullStepOrdinal = <T>(
	fullSteps: readonly T[],
	filteredSteps: readonly T[],
	filteredPosition: number,
): number => {
	const filteredIndex = filteredPosition - 1;
	const step = filteredSteps[filteredIndex];
	const fullIndex = fullSteps.indexOf(step);

	if (fullIndex === -1) {
		return filteredPosition;
	}

	return fullIndex + 1;
};
