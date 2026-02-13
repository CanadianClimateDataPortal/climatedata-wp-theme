/**
 * Shapefile simplification and projection to GeoJSON.
 *
 * Thin wrapper that lazy-loads the implementation via dynamic import.
 * This enables Vite code-splitting — shpjs, @turf, and proj4 are only
 * loaded when this function is first called.
 *
 * @see {@link ./simplify-shapefile-impl.ts} for the actual logic
 * @see {@link ./pipeline.ts} for the type signature
 * @see {@link ./validate-geometry.ts} for the preceding pipeline stage
 */

import type { SimplifyShapefile } from './pipeline';

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
 *   or `ProcessingError` on failure
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
 */
export const simplifyShapefile: SimplifyShapefile = async (
	shapefile,
) => {
	const { simplifyShapefileImpl } = await import('./simplify-shapefile-impl');
	return simplifyShapefileImpl(shapefile);
};
