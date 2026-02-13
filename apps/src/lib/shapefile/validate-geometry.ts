/**
 * Shapefile geometry type validation.
 *
 * Thin wrapper that lazy-loads the implementation via dynamic import.
 * This enables Vite code-splitting — the impl file and its dependencies
 * are only loaded when this function is first called.
 *
 * @see {@link ./validate-geometry-impl.ts} for the actual logic
 * @see {@link ./pipeline.ts} for the type signature
 * @see {@link ./extraction.ts} for the preceding pipeline stage
 */

import type { ValidateShapefileGeometry } from './pipeline';

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
	const { validateShapefileGeometryImpl } = await import('./validate-geometry-impl');
	return validateShapefileGeometryImpl(shapefile);
};
