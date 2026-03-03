/**
 * @file Compute geodesic area of a GeoJSON polygon — wrapper.
 *
 * Convention: `-impl.ts` pattern
 *
 * This wrapper re-exports the computation from the impl module.
 * Keeps the state machine file free of external dependencies.
 *
 * @see {@link ./compute-area-impl.ts} for the actual logic
 * @see {@link ./shapefile-machine.ts} — consumer (runDisplayConversion)
 */

import { computeAreaKm2Impl } from './compute-area-impl';

import {
	type Feature,
	type Polygon,
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
export const computeAreaKm2 = (
	feature: Feature<Polygon>,
): number => {
	return computeAreaKm2Impl(feature);
};
