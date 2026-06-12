import type { ClimateVariableConfigInterface } from '@/types/climate-variable-interface';

/**
 * Ordinal (1-based) step numbers for the Download wizard.
 *
 * @remarks
 * Mirrors the positional order of the `STEPS` tuple in
 * {@link ../../components/download/config.ts}. The wizard tracks `currentStep`
 * 1-based (`download-provider.tsx`), so the derivation logic here is keyed on
 * the same 1-based ordinals rather than the 0-based array indexes. There is
 * intentionally NO `Step` enum in the codebase; these are the shared literal
 * constants used in its place.
 */
export const DOWNLOAD_STEPS = {
	additionalDetails: 5,
	dataset: 1,
	location: 4,
	result: 7,
	sendRequest: 6,
	variable: 2,
	variableOptions: 3,
} as const;

/**
 * The reset-payload object merged into the climate-variable config when the
 * Download wizard navigates backwards.
 *
 * @remarks
 * Typed as a partial of {@link ClimateVariableConfigInterface} because the
 * payload is shallow-merged into `state.data` by the `updateClimateVariable`
 * reducer. A few legacy reset values are intentionally looser than the strict
 * field types (e.g. `interactiveRegion: null` where the field is
 * `InteractiveRegionOption | undefined`); those are reproduced verbatim to keep
 * behavior byte-identical with the former mounted-ref derivation.
 */
export type ResetPayload = Partial<ClimateVariableConfigInterface>;

/**
 * Internal accumulator for assembling a step's reset contribution.
 *
 * @remarks
 * Deliberately loose: a few legacy reset values do not satisfy the strict
 * config field types (e.g. `interactiveRegion: null` where the field is
 * `InteractiveRegionOption | undefined`) and are reproduced verbatim to keep
 * behavior identical with the former mounted-ref derivation. Tightening these
 * to the strict field types is a follow-up that requires loosening the
 * corresponding {@link ClimateVariableConfigInterface} fields to accept the
 * reset sentinels. Not exported from the barrel — internal to this namespace.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type StepResetAccumulator = { [key: string]: any };
