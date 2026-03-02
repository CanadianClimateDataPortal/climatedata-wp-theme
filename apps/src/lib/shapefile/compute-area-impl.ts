/**
 * @file Compute geodesic area of a GeoJSON polygon — implementation.
 *
 * Convention: `-impl.ts` pattern
 *
 * Pure computation wrapping @turf/area. Separated from the wrapper
 * for structural consistency with other pipeline stages and to keep
 * the heavy @turf/area dependency (576KB) isolatable.
 *
 * @see {@link ./compute-area.ts} for the wrapper
 */

import area from '@turf/area';

import {
	type Feature,
	type Polygon,
} from 'geojson';

/**
 * Compute the geodesic area of a polygon in square kilometers.
 *
 * @param feature - GeoJSON Feature with Polygon geometry
 * @returns Area in km² (geodesic, WGS84 ellipsoid)
 */
export const computeAreaKm2Impl = (
	feature: Feature<Polygon>,
): number => {
	return area(feature) / 1_000_000;
};
