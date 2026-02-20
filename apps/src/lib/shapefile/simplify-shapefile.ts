/**
 * @file
 *
 * Shapefile simplification — state machine service wrapper.
 *
 * Convention: `-impl.ts` pattern
 *
 * This wrapper file is what the XState state machine calls via its
 * injected services. It maintains the Result<T, E> contract boundary
 * that the machine expects (ok/error discrimination for guard checks).
 *
 * The actual parsing and geometry processing lives in the `-impl`
 * module, which:
 * - Can be used independently of the state machine
 * - Throws typed errors instead of returning Result
 * - Is lazy-loaded via dynamic import() for Vite code-splitting
 * - Contains all external dependencies (shpjs, @turf modules)
 *
 * This separation means the implementation functions are reusable
 * outside the state machine context (e.g., in tests, CLI tools, or
 * other pipelines) without coupling to the Result pattern.
 *
 * Do not reference dependency names in comments or error messages.
 * Describe operations and contracts, not the library that implements them.
 *
 * @see {@link ./simplify-shapefile-impl.ts} for the actual logic
 * @see {@link ./pipeline.ts} for the type signature
 * @see {@link ./validate-geometry.ts} for the preceding pipeline stage
 */

import type { SimplifyShapefile } from './pipeline';
import {
	ProcessingError,
	ShapefileError,
} from './errors';

/**
 * Simplify and project a validated shapefile to GeoJSON.
 *
 * Clean, snap, fix geometry, project to WGS84,
 * and output as GeoJSON FeatureCollection.
 *
 * Legacy equivalent: `simplify_polygons()` in shapefile-upload.js:654-670
 *
 * @param shapefile - Previously validated .shp and .prj data
 *
 * @returns Result with `SimplifiedGeometry` on success,
 *   or `ProcessingError` / `ProjectionError` on failure
 *
 * @example
 * ```typescript
 * const result = await simplifyShapefile(validated);
 *
 * if (result.ok) {
 *   // result.value.featureCollection is a GeoJSON FeatureCollection
 *   console.log(`${result.value.featureCount} features simplified`);
 * }
 * ```
 *
 * @see {@link ./pipeline.ts} for the type signature
 */
export const simplifyShapefile: SimplifyShapefile = async (
	shapefile,
) => {
	try {
		const { simplifyShapefileImpl } = await import('./simplify-shapefile-impl');
		const value = await simplifyShapefileImpl(shapefile);
		return { ok: true, value };
	} catch (err) {
		if (err instanceof ShapefileError) {
			return { ok: false, error: err };
		}
		return {
			ok: false,
			error: new ProcessingError(
				`Simplification Step Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
				{ cause: err instanceof Error ? err : undefined },
			),
		};
	}
};
