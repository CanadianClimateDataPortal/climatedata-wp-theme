/**
 * @file Compute the number of positions in a GeoJSON (multi)polygon — wrapper.
 *
 * Convention: `-impl.ts` pattern
 *
 * This wrapper re-exports the computation from the impl module.
 * Keeps the state machine file free of external dependencies.
 *
 * @see {@link ./compute-nb-positions-impl.ts} for the actual logic
 * @see {@link ./shapefile-machine.ts} — consumer (runDisplayConversion)
 */
import type { Feature, Polygon, MultiPolygon } from 'geojson';
import { computeNbPositionsImpl } from './compute-nb-positions-impl';

/**
 * Compute the number of positions in a GeoJSON (multi)polygon.
 *
 * Only supports 2D polygons and multi-polygons (i.e.: positions with exactly
 * 2 coordinates).
 *
 * @param feature - GeoJSON Feature with Polygon or MultiPolygon geometry
 * @returns Total number of positions
 *
 * @example
 * ```typescript
 * const nbPositions = computeNbPositions(feature);
 * // 438
 * ```
 */
export const computeNbPositions = (
	feature: Feature<Polygon|MultiPolygon>,
): number => {
	return computeNbPositionsImpl(feature);
}
