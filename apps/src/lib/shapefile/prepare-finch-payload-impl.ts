/**
 * @file
 *
 * Prepare Finch API payload — implementation (reusable outside state machine).
 *
 * Convention: `-impl.ts` pattern
 *
 * This file contains the actual payload construction logic, separated from
 * the state machine service wrapper (prepare-finch-payload.ts). It accepts
 * a validated shape collection and returns a FinchShapeParameter directly
 * (no Result wrapper), making it usable in any context.
 *
 * Note: Coordinate truncation is deferred to the Finch integration ticket
 * (CLIM-1274). This implementation extracts features as-is.
 *
 * @see {@link ./prepare-finch-payload.ts} for the state machine wrapper
 * @see {@link ./contracts.ts} for ValidatedShapes and FinchShapeParameter types
 * @see {@link ./pipeline.ts} for the PrepareFinchPayload type signature
 */

import type { FinchShapeParameter, ValidatedShapes } from './contracts';

/**
 * Convert validated shapes into a GeoJSON FeatureCollection for the Finch API.
 *
 * Extracts the `.feature` from each `DisplayableShape` in the validated
 * collection and wraps them in a `FinchShapeParameter` FeatureCollection.
 *
 * Note: Coordinate precision truncation is intentionally omitted here.
 * It is deferred to the Finch integration ticket (CLIM-1274, requirement F13).
 *
 * @param shapes - Branded array of shapes that have passed area validation
 * @returns GeoJSON FeatureCollection suitable for the Finch API shape parameter
 *
 * @example
 * ```typescript
 * const payload = prepareFinchPayloadImpl(validatedShapes);
 * // { type: 'FeatureCollection', features: [...] }
 * ```
 *
 * @see {@link ./pipeline.ts} for the PrepareFinchPayload type signature
 */
export const prepareFinchPayloadImpl = (
	shapes: ValidatedShapes,
): FinchShapeParameter => {
	return {
		type: 'FeatureCollection',
		features: shapes.map((shape) => shape.feature),
	};
};
