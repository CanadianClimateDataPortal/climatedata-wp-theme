/**
 * @file
 *
 * Prepare Finch API payload — state machine service wrapper.
 *
 * Convention: `-impl.ts` pattern
 *
 * This wrapper re-exports the computation from the impl module.
 * Maintains structural consistency with the other pipeline wrappers
 * (e.g., compute-area.ts) — a thin synchronous pass-through.
 *
 * Unlike async pipeline stages, this function is synchronous and returns
 * FinchShapeParameter directly (no Result wrapper), as defined by the
 * PrepareFinchPayload type in pipeline.ts.
 *
 * @see {@link ./prepare-finch-payload-impl.ts} for the actual logic
 * @see {@link ./pipeline.ts} for the PrepareFinchPayload type signature
 * @see {@link ./contracts.ts} for ValidatedShapes and FinchShapeParameter types
 */

import type { PrepareFinchPayload } from './pipeline';
import { prepareFinchPayloadImpl } from './prepare-finch-payload-impl';

/**
 * Convert validated shapes into a GeoJSON FeatureCollection for the Finch API.
 *
 * Synchronous pass-through to the impl module. Returns a FinchShapeParameter
 * directly — no Result wrapping, no error handling needed at this stage.
 *
 * @param shapes - Branded array of shapes that have passed area validation
 * @returns GeoJSON FeatureCollection suitable for the Finch API shape parameter
 *
 * @example
 * ```typescript
 * const payload = prepareFinchPayload(validatedShapes);
 * // { type: 'FeatureCollection', features: [...] }
 * ```
 *
 * @see {@link ./pipeline.ts} for the PrepareFinchPayload type signature
 */
export const prepareFinchPayload: PrepareFinchPayload = (
	shapes,
) => {
	return prepareFinchPayloadImpl(shapes);
};
