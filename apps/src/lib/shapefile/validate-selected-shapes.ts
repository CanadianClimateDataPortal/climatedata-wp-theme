/**
 * @file
 *
 * Selected-shapes validation — state machine service wrapper.
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
 * @see {@link ./validate-selected-shapes-impl.ts} for the actual logic
 * @see {@link ./pipeline.ts} for the type signature
 */

import type { ValidateSelectedShapes } from './pipeline';
import {
	ProcessingError,
	ShapefileError,
} from './errors';
import { validateSelectedShapesImpl } from './validate-selected-shapes-impl';

/**
 * Validate that the selected shapes are valid.
 *
 * Two validations are performed:
 * - Sums area across all selected shapes and checks against the provided
 *   constraints (default: 100 km² to 500,000 km²).
 * - Sums the number of positions` across all selected shapes and checks against
 *   the provided maximum.
 *
 * @param shapes - Array of DisplayableShape objects representing the selection
 * @param constraints - Constraints to validate against
 *
 * @returns Result with branded `ValidatedShapes` on success,
 *   or `ShapefileError` on failure,
 *   or `ProcessingError` for unexpected errors
 *
 * @example
 * ```typescript
 * const result = validateSelectedShapes(shapes, constraints);
 *
 * if (result.ok) {
 *   // result.value is ValidatedShapes — safe to pass to Finch stage
 * } else if (result.error instanceof ShapefileError) {
 *   console.error(`Shapes validation error [${result.error.code}]: ${result.error.message}`);
 * }
 * ```
 *
 * @see {@link ./pipeline.ts} for the type signature
 */
export const validateSelectedShapes: ValidateSelectedShapes = (
	shapes,
	constraints,
) => {
	try {
		const value = validateSelectedShapesImpl(shapes, constraints);
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
