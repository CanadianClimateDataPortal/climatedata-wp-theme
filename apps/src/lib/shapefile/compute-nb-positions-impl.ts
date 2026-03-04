/**
 * @file Compute the number of positions in a GeoJSON (multi)polygon — implementation.
 *
 * Convention: `-impl.ts` pattern
 *
 * @see {@link ./compute-nb-positions.ts} for the wrapper
 */
import type { Feature, Polygon, MultiPolygon } from 'geojson';
import { arraySize } from '@/lib/utils';

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
export const computeNbPositionsImpl = (
	feature: Feature<Polygon|MultiPolygon>,
): number => {
	// A 2D position is a pair of coordinates, so we divide by 2 to get the total
	return Math.round(arraySize(feature.geometry.coordinates) / 2);
}
