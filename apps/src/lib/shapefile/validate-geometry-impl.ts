/**
 * @file
 *
 * Shapefile geometry validation — implementation (reusable outside state machine).
 *
 * Convention: `-impl.ts` pattern
 *
 * This file contains the actual validation logic, separated from the
 * state machine service wrapper (validate-geometry.ts). It throws typed
 * errors on failure instead of returning Result<T, E>, making it usable
 * in any context — not just the XState pipeline.
 *
 * Zero external dependencies — uses only `detectShp` from detect-shp.ts.
 * The `-impl` split is kept for structural consistency with
 * simplify-shapefile-impl.ts, not for code-splitting purposes.
 *
 * Reads the .shp binary header to determine geometry type.
 * Only polygon geometries (type 5, 15, 25) are accepted.
 *
 * @see {@link ./validate-geometry.ts} for the state machine wrapper
 * @see {@link ./detect-shp.ts} for the binary header reader
 */

import type { ExtractedShapefile, GeometryType, ValidatedShapefile } from './contracts';
import {
	InvalidGeometryTypeError,
	ProcessingError,
	ShapefileError,
} from './errors';
import { detectShp } from './detect-shp';

/**
 * Validate that all pairs in an extracted shapefile contain polygon geometry.
 *
 * For each pair, reads the first 36 bytes of the .shp binary to inspect:
 * 1. File code (must be 9994)
 * 2. Shape type code (must be polygon: 5, 15, or 25)
 * 3. Feature presence (file length > 100 bytes header)
 *
 * Cross-pair consistency: all pairs must share the same geometry type.
 * Mixed types (e.g., one Polygon + one Point) produce a dedicated error.
 *
 * @throws {InvalidGeometryTypeError} when all pairs share a non-polygon type
 * @throws {ShapefileError} with code `validation/mixed-geometry-types` when pairs differ
 * @throws {ProcessingError} when something else unexpected happens
 *
 * @param shapefile - Previously extracted .shp/.prj pairs
 * @returns branded `ValidatedShapefile` on success
 */
export const validateShapefileGeometryImpl = async (
	shapefile: ExtractedShapefile,
): Promise<ValidatedShapefile> => {
	const geometryTypes: GeometryType[] = [];

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

		geometryTypes.push(header.shapeTypeName);
	}

	// 3. Check geometry type consistency across all pairs
	const uniqueTypes = [...new Set(geometryTypes)];

	if (uniqueTypes.length > 1) {
		throw new ShapefileError(
			`Mixed geometry types across shapefiles: ${uniqueTypes.join(', ')}. All files must contain the same geometry type.`,
			{ code: 'validation/mixed-geometry-types' },
		);
	}

	// 4. Check that the shared geometry type is Polygon
	const sharedType = uniqueTypes[0];
	if (sharedType !== 'Polygon') {
		throw new InvalidGeometryTypeError(sharedType);
	}

	// 5. Return branded ValidatedShapefile
	const validated = shapefile as unknown as ValidatedShapefile;
	return {
		...validated,
	};
};
