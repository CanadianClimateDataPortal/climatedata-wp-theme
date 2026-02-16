/**
 * @file
 *
 * Shapefile simplification — implementation (reusable outside state machine).
 *
 * Convention: `-impl.ts` pattern
 *
 * This file contains the actual simplification logic, separated from the
 * state machine service wrapper (simplify-shapefile.ts). It throws typed
 * errors on failure instead of returning Result<T, E>, making it usable
 * in any context — not just the XState pipeline.
 *
 * All external dependencies for this pipeline stage live here:
 * shpjs parses .shp + .prj → GeoJSON with proj4 reprojection,
 * then @turf modules clean and simplify the geometry.
 * Vite code-splits this file into a separate chunk, loaded on demand.
 *
 * @todo
 * - Make this file (and the other -impl.ts) to be loaded with their
 *   dependencies once, and next time called to re-use what's already loaded.
 *
 * @see {@link ./simplify-shapefile.ts} for the state machine wrapper
 * @see {@link ./validate-geometry-impl.ts} for the preceding impl stage
 */

import type { Feature, FeatureCollection, Geometry } from 'geojson';

// @ts-expect-error — shpjs has no type declarations
import { parseShp, combine } from 'shpjs';
import simplify from '@turf/simplify';
import truncate from '@turf/truncate';
import cleanCoords from '@turf/clean-coords';
import rewind from '@turf/rewind';

import {
	ProcessingError,
	ProjectionError,
} from './errors';
import {
	type ValidatedShapefile,
	type SimplifiedGeometry,
} from './contracts';

/**
 * Check if a GeoJSON geometry type is a polygon variant.
 */
const isPolygonGeometry = (type: string): boolean =>
	type === 'Polygon' || type === 'MultiPolygon';

/**
 * Minimum number of coordinates for a valid polygon ring.
 * A polygon ring needs at least 4 positions (3 unique + closing point).
 */
const MIN_POLYGON_RING_COORDS = 4;

/**
 * Check if a polygon geometry still has valid rings after processing.
 *
 * A Polygon needs at least one ring with >= 4 coordinates.
 * A MultiPolygon needs at least one polygon with a valid ring.
 */
const hasValidRings = (geometry: Geometry): boolean => {
	if (geometry.type === 'Polygon') {
		return geometry.coordinates.every(
			(ring) => ring.length >= MIN_POLYGON_RING_COORDS,
		);
	}
	if (geometry.type === 'MultiPolygon') {
		return geometry.coordinates.some((polygon) =>
			polygon.every(
				(ring) => ring.length >= MIN_POLYGON_RING_COORDS,
			),
		);
	}
	return false;
};

/**
 * Process a single GeoJSON feature through the @turf pipeline.
 *
 * Returns null if the feature degenerates (collapses below minimum
 * polygon size after coordinate truncation/simplification). This
 * happens with very small polygons whose vertices merge on the
 * truncation grid.
 *
 * Order: cleanCoords → truncate → (validity check) → rewind → simplify
 */
const processFeature = (feature: Feature): Feature | null => {
	try {
		let processed = feature;

		// Remove redundant coordinates
		processed = cleanCoords(processed, { mutate: false }) as Feature;

		// Truncate coordinate precision (3 decimal places ≈ ~111m grid)
		processed = truncate(processed, {
			precision: 3,
			coordinates: 2,
			mutate: false,
		}) as Feature;

		// After truncation, nearby vertices may have merged.
		// Drop features that no longer form valid polygon rings.
		if (processed.geometry && !hasValidRings(processed.geometry)) {
			return null;
		}

		// Enforce RFC 7946 winding order (outer CCW, inner CW)
		processed = rewind(processed, { mutate: false }) as Feature;

		// Simplify geometry (Visvalingam–Whyatt via simplify-js)
		processed = simplify(processed, {
			tolerance: 0.001,
			highQuality: true,
			mutate: false,
		}) as Feature;

		// Post-simplification validity check
		if (processed.geometry && !hasValidRings(processed.geometry)) {
			return null;
		}

		return processed;
	} catch {
		// Feature degenerated during processing — skip it
		return null;
	}
};

/**
 * Parse a validated shapefile and produce simplified GeoJSON.
 *
 * Pipeline:
 * 1. Parse .shp binary + .prj projection string via shpjs (includes proj4 reprojection)
 * 2. Build FeatureCollection via shpjs combine()
 * 3. Filter: keep only Polygon/MultiPolygon features
 * 4. Process each feature through @turf pipeline
 * 5. Return simplified FeatureCollection with feature count
 *
 * @throws {ProjectionError} when received format doesn't match supported shp projection
 * @throws {ProcessingError} when something else unexpected happen
 *
 * @param shapefile - Received files from earlier step {@link ValidateShapefileGeometry} .shp and .prj
 * @returns SimplifiedGeometry on success
 */
export const simplifyShapefileImpl = async (
	shapefile: ValidatedShapefile,
): Promise<SimplifiedGeometry> => {

	// 1. Parse .shp + .prj with shpjs
	let geometries: Geometry[];
	try {
		geometries = parseShp(shapefile['file.shp'], shapefile['file.prj']);
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Unknown error';

		// shpjs uses proj4 internally — projection failures surface here
		if (message.includes('proj4') || message.includes('projection')) {
			throw new ProjectionError(
				shapefile['file.prj'].slice(0, 100),
				{ cause: err instanceof Error ? err : undefined },
			);
		}

		throw new ProcessingError(
			`Failed to parse shapefile: ${message}`,
			{ cause: err instanceof Error ? err : undefined },
		);
	}

	// 2. Build FeatureCollection
	// Second argument is .dbf attributes — undefined because our extraction
	// only provides .shp + .prj. Features will have empty properties: {}.
	let featureCollection: FeatureCollection;
	try {
		featureCollection = combine([geometries, undefined]);
	} catch (err) {
		throw new ProcessingError(
			`Failed to build feature collection: ${err instanceof Error ? err.message : 'Unknown error'}`,
			{ cause: err instanceof Error ? err : undefined },
		);
	}

	// 3. Filter: keep only polygon features
	const polygonFeatures = featureCollection.features.filter(
		(f) => f.geometry && isPolygonGeometry(f.geometry.type),
	);

	if (polygonFeatures.length === 0) {
		throw new ProcessingError(
			'No polygon features found after parsing shapefile',
		);
	}

	// 4. Process each feature through @turf pipeline
	// Features that degenerate (collapse below valid polygon size) are dropped.
	const processedFeatures = polygonFeatures
		.map(processFeature)
		.filter((f): f is Feature => f !== null);

	if (processedFeatures.length === 0) {
		throw new ProcessingError(
			'All polygon features degenerated during simplification (none remained valid)',
		);
	}

	// 5. Build final FeatureCollection
	const simplified: FeatureCollection = {
		type: 'FeatureCollection',
		features: processedFeatures,
	};

	return {
		featureCollection: simplified,
		featureCount: processedFeatures.length,
	};
};
