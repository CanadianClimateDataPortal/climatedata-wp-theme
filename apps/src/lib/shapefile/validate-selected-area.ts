/**
 * @file
 *
 * Selected-area validation — state machine service wrapper.
 *
 * Convention: `-impl.ts` pattern
 *
 * This wrapper file is what the XState state machine calls via its
 * injected services. It maintains the Result<T, E> contract boundary
 * that the machine expects (ok/error discrimination for guard checks).
 *
 * The actual validation logic lives in the `-impl` module, which:
 * - Can be used independently of the state machine
 * - Throws typed errors instead of returning Result
 * - Is imported statically (this stage is synchronous — no code-splitting)
 *
 * This separation means the implementation functions are reusable
 * outside the state machine context (e.g., in tests, CLI tools, or
 * other pipelines) without coupling to the Result pattern.
 *
 * @see {@link ./validate-selected-area-impl.ts} for the actual logic
 * @see {@link ./pipeline.ts} for the type signature
 */

import type { ValidateSelectedArea } from './pipeline';
import {
	ProcessingError,
	ShapefileError,
} from './errors';
import { validateSelectedAreaImpl } from './validate-selected-area-impl';

/**
 * Validate that the selected region's total area is within the allowed range.
 *
 * Sums area across all selected shapes and checks against the provided
 * constraints (default: 100 km² to 500,000 km²).
 *
 * @param shapes - Array of DisplayableShape objects representing the selection
 * @param constraints - Min/max area constraints to validate against
 *
 * @returns Result with branded `ValidatedShapes` on success,
 *   or `ShapefileError` (area/too-large, area/too-small) on failure,
 *   or `ProcessingError` for unexpected errors
 *
 * @example
 * ```typescript
 * const result = validateSelectedArea(shapes, constraints);
 *
 * if (result.ok) {
 *   // result.value is ValidatedShapes — safe to pass to Finch stage
 * } else if (result.error instanceof ShapefileError) {
 *   console.error(`Area error [${result.error.code}]: ${result.error.message}`);
 * }
 * ```
 *
 * @see {@link ./pipeline.ts} for the type signature
 */
export const validateSelectedArea: ValidateSelectedArea = (
	shapes,
	constraints,
) => {
	try {
		const value = validateSelectedAreaImpl(shapes, constraints);
		return { ok: true, value };
	} catch (err) {
		if (err instanceof ShapefileError) {
			return { ok: false, error: err };
		}
		return {
			ok: false,
			error: new ProcessingError(
				`Validation Step Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
				{ cause: err instanceof Error ? err : undefined },
			),
		};
	}
};
