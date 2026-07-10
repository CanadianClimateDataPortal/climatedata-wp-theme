import type { ClimateVariableConfigInterface } from '@/types/climate-variable-interface';

/**
 * 1-based step numbers in the full flow for the Download wizard.
 *
 * @remarks
 * Mirrors the positional order of the {@link STEPS} tuple in
 * {@link ../../components/download/config.ts}. The wizard tracks `currentStep`
 * 1-based (`download-provider.tsx`), so the derivation logic here is keyed on
 * the same 1-based full-flow step numbers rather than the 0-based array indexes. There is
 * intentionally NO `Step` enum in the codebase; these are the shared literal
 * constants used in its place.
 */
export const DOWNLOAD_STEPS = {
	dataset: 1,
	variable: 2,
	variableOptions: 3,
	location: 4,
	additionalDetails: 5,
	sendRequest: 6,
	result: 7,
} as const;

/**
 * The reset-payload object merged into the climate-variable config when the
 * Download wizard navigates backwards.
 *
 * @remarks
 * A partial of {@link ClimateVariableConfigInterface} because the payload is
 * shallow-merged into `state.data` by the `updateClimateVariable` reducer. Some
 * reset sentinels are intentionally looser than the strict field types (e.g.
 * `interactiveRegion: null` where the field is `InteractiveRegionOption |
 * undefined`): these are the exact values `updateClimateVariable` shallow-merges
 * to clear a step, so they stay as-is until the matching
 * {@link ClimateVariableConfigInterface} fields are loosened in lockstep.
 */
export type ResetPayload = Partial<ClimateVariableConfigInterface>;

/**
 * Internal accumulator for assembling a step's reset contribution.
 *
 * @remarks
 * Deliberately loose: a few reset sentinels do not satisfy the strict config
 * field types (e.g. `interactiveRegion: null` where the field is
 * `InteractiveRegionOption | undefined`). They are the exact values
 * `updateClimateVariable` shallow-merges to clear a step; tightening them to the
 * strict field types is a follow-up that must loosen the corresponding
 * {@link ClimateVariableConfigInterface} fields in lockstep to accept the reset
 * sentinels. Not exported from the barrel — internal to this namespace.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type StepResetAccumulator = { [key: string]: any };
