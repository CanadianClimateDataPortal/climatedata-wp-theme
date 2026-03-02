/**
 * @file Compute geodesic area of a GeoJSON polygon.
 *
 * Wraps @turf/area to return area in square kilometers.
 * Keeps the state machine file free of external dependencies.
 *
 * @see {@link ./shapefile-machine.ts} — consumer (runDisplayConversion)
 */

import area from '@turf/area';

import type {
	Feature,
	Polygon,
} from 'geojson';

/**
 * Compute the geodesic area of a polygon in square kilometers.
 *
 * @param feature - GeoJSON Feature with Polygon geometry
 * @returns Area in km² (geodesic, WGS84 ellipsoid)
 *
 * @example
 * ```typescript
 * const areaKm2 = computeAreaKm2(feature);
 * // 5123.45
 * ```
 *
 * @see {@link https://turfjs.org/docs/api/area @turf/area}
 */
export function computeAreaKm2(
	feature: Feature<Polygon>,
): number {
	return area(feature) / 1_000_000;
}
