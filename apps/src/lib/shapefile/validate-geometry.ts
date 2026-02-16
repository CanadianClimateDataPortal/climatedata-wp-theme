/**
 * @file
 *
 * Shapefile geometry type validation — state machine service wrapper.
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
 * - Is lazy-loaded via dynamic import() for Vite code-splitting
 *
 * This separation means the implementation functions are reusable
 * outside the state machine context (e.g., in tests, CLI tools, or
 * other pipelines) without coupling to the Result pattern.
 *
 * Note: validate-geometry-impl.ts has zero external dependencies.
 * The `-impl` split is kept for structural consistency with
 * simplify-shapefile-impl.ts (which does have heavy deps to
 * code-split) and to maintain the same pattern across the pipeline.
 *
 * @see {@link ./validate-geometry-impl.ts} for the actual logic
 * @see {@link ./pipeline.ts} for the type signature
 * @see {@link ./extraction.ts} for the preceding pipeline stage
 */

import type { ValidateShapefileGeometry } from './pipeline';
import {
	ProcessingError,
	ShapefileError,
} from './errors';

/**
 * Validate that an extracted shapefile contains polygon geometry.
 *
 * Rejects non-polygon geometry types (Point, Polyline, MultiPoint, etc.)
 * with an `InvalidGeometryTypeError`.
 *
 * @param shapefile - Previously extracted .shp and .prj data
 *
 * @returns Result with branded `ValidatedShapefile` on success,
 *   or `InvalidGeometryTypeError` / `ProcessingError` on failure
 *
 * @example
 * ```typescript
 * const result = await validateShapefileGeometry(extracted);
 *
 * if (result.ok) {
 *   // result.value is ValidatedShapefile — safe to transform
 * } else if (result.error instanceof InvalidGeometryTypeError) {
 *   console.error(`Wrong type: ${result.error.geometryType}`);
 * }
 * ```
 *
 * @see {@link ./pipeline.ts} for the type signature
 */
export const validateShapefileGeometry: ValidateShapefileGeometry = async (
	shapefile,
) => {
	try {
		const { validateShapefileGeometryImpl } = await import('./validate-geometry-impl');
		const value = await validateShapefileGeometryImpl(shapefile);
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
