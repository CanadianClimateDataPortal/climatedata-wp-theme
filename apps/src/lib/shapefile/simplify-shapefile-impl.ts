/**
 * @file
 *
 * Shapefile geometry processing — implementation (reusable outside state machine).
 *
 * Convention: `-impl.ts` pattern
 *
 * This file contains the geometry cleaning logic, separated from the
 * state machine service wrapper (simplify-shapefile.ts). It throws typed
 * errors on failure instead of returning Result<T, E>, making it usable
 * in any context — not just the XState pipeline.
 *
 * All external dependencies for this pipeline stage live here:
 * shpjs parses .shp + .prj → GeoJSON with proj4 reprojection,
 * then @turf modules clean coordinates and enforce winding order.
 * Vite code-splits this file into a separate chunk, loaded on demand.
 *
 * Pipeline: cleanCoords → truncate (precision 6, ~0.11m) → rewind
 *
 * No vertex-removal simplification is applied — this matches the legacy
 * mapshaper pipeline which only cleaned, snapped, and projected without
 * a `-simplify` step. Sensors are spaced by kilometres; sub-metre
 * coordinate noise is the only thing removed here.
 *
 * @see {@link ./simplify-shapefile.ts} for the state machine wrapper
 * @see {@link ./validate-geometry-impl.ts} for the preceding impl stage
 */

import type { Feature, FeatureCollection, Geometry } from 'geojson';

// @ts-expect-error — shpjs has no type declarations
import { parseShp, combine } from 'shpjs';
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
 * Process a single GeoJSON feature through the @turf pipeline.
 *
 * Cleans redundant coordinates, truncates floating-point noise to
 * 5 decimal places (~1.1m m), and enforces RFC 7946 winding order.
 *
 * Order: cleanCoords → truncate (precision 6) → rewind
 */
const processFeature = (feature: Feature): Feature => {
	let processed = feature;

	// Remove redundant coordinates
	processed = cleanCoords(processed, { mutate: false }) as Feature;

	// Preserve shape, but reduce coordinate noise
	processed = truncate(processed, {
		/* precision is about decimal places. */
		precision: 5,
		coordinates: 2,
		mutate: false,
	}) as Feature;

	// Enforce RFC 7946 winding order (outer CCW, inner CW)
	processed = rewind(processed, { mutate: false }) as Feature;

	return processed;
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
				shapefile['file.prj'],
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
	// Clean coordinates, truncate float noise, enforce winding order.
	const processedFeatures = polygonFeatures.map(processFeature);

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
