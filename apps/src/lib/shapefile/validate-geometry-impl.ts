/**
 * @file
 *
 * Shapefile geometry validation -- implementation (reusable outside state machine).
 *
 * Convention: `-impl.ts` pattern
 *
 * This file contains the actual validation logic, separated from the
 * state machine service wrapper (validate-geometry.ts). It throws typed
 * errors on failure instead of returning Result<T, E>, making it usable
 * in any context -- not just the XState pipeline.
 *
 * Zero external dependencies -- uses only `detectShp` from detect-shp.ts.
 * The `-impl` split is kept for structural consistency with
 * simplify-shapefile-impl.ts, not for code-splitting purposes.
 *
 * Reads the .shp binary header to determine geometry type.
 * Only polygon geometries (type 5, 15, 25) are accepted.
 * Non-polygon pairs are filtered out with warnings, not rejected.
 *
 * @see {@link ./validate-geometry.ts} for the state machine wrapper
 * @see {@link ./detect-shp.ts} for the binary header reader
 */

import type {
	ExtractedShapefile,
	GeometryType,
	ShapefilePair,
	SkippedEntry,
	ValidatedShapefile,
} from './contracts';
import {
	InvalidGeometryTypeError,
	ProcessingError,
} from './errors';
import { detectShp } from './detect-shp';

/**
 * Validate that at least one pair in an extracted shapefile contains polygon geometry.
 *
 * For each pair, reads the first 36 bytes of the .shp binary to inspect:
 * 1. File code (must be 9994)
 * 2. Shape type code (must be polygon: 5, 15, or 25)
 * 3. Feature presence (file length > 100 bytes header)
 *
 * Non-polygon pairs are filtered out and added to `skippedEntries` with a warning.
 * Only polygon pairs are kept in the returned `ValidatedShapefile`.
 *
 * @throws {InvalidGeometryTypeError} when zero polygon pairs remain after filtering
 * @throws {ProcessingError} when something else unexpected happens
 *
 * @param shapefile - Previously extracted .shp/.prj pairs
 * @returns branded `ValidatedShapefile` with only polygon pairs and updated skippedEntries
 */
export const validateShapefileGeometryImpl = async (
	shapefile: ExtractedShapefile,
): Promise<ValidatedShapefile> => {
	const polygonPairs: ShapefilePair[] = [];
	const newSkippedEntries: SkippedEntry[] = [];
	let lastNonPolygonType: GeometryType = 'Point';

	for (const pair of shapefile.pairs) {
		const header = await detectShp(pair.shp);

		// 1. Check if it's a valid .shp file
		if (!header.isShp) {
			throw new ProcessingError(
				`Validation Error: ${pair.basename}.shp does not appear to be a .shp file (invalid file code)`,
			);
		}

		// 2. Check if the file contains any features
		if (!header.hasFeatures) {
			throw new ProcessingError(
				`Validation Error: ${pair.basename}.shp contains no features (file is header-only)`,
			);
		}

		// 3. Filter: keep polygons, skip non-polygons with warning
		if (header.isPolygon) {
			polygonPairs.push(pair);
		} else {
			lastNonPolygonType = header.shapeTypeName;
			newSkippedEntries.push({
				basename: pair.basename,
				reason: `${header.shapeTypeName} geometry, only Polygon supported`,
			});
		}
	}

	// 4. Error if zero polygon pairs remain
	if (polygonPairs.length === 0) {
		throw new InvalidGeometryTypeError(lastNonPolygonType);
	}

	// 5. Return branded ValidatedShapefile with only polygon pairs
	const validated = {
		pairs: polygonPairs,
		skippedEntries: [
			...shapefile.skippedEntries,
			...newSkippedEntries,
		],
	} as unknown as ValidatedShapefile;

	return validated;
};
