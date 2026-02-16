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

import type { ExtractedShapefile, ValidatedShapefile } from './contracts';
import {
	InvalidGeometryTypeError,
	ProcessingError,
} from './errors';
import { detectShp } from './detect-shp';

/**
 * Validate that an extracted shapefile contains polygon geometry.
 *
 * Reads the first 36 bytes of the .shp binary to inspect:
 * 1. File code (must be 9994)
 * 2. Shape type code (must be polygon: 5, 15, or 25)
 * 3. Feature presence (file length > 100 bytes header)
 *
 * @throws {InvalidGeometryTypeError} when unexpected shapes are found
 * @throws {ProcessingError} when something else unexpected happen
 *
 * @param shapefile - Previously extracted .shp and .prj data
 * @returns branded `ValidatedShapefile` on success
 */
export const validateShapefileGeometryImpl = async (
	shapefile: ExtractedShapefile,
): Promise<ValidatedShapefile> => {
	const header = await detectShp(shapefile['file.shp']);

	// 1. Check if it's a valid .shp file
	if (!header.isShp) {
		throw new ProcessingError(
			'Validation Error: File does not appear to be a .shp file (invalid file code)',
		);
	}

	// 2. Check if the file contains any features
	if (!header.hasFeatures) {
		throw new ProcessingError(
			'Validation Error: Shapefile contains no features (file is header-only)',
		);
	}

	// 3. Check geometry type — only Polygon is accepted
	if (!header.isPolygon) {
		throw new InvalidGeometryTypeError(header.shapeTypeName);
	}

	// 4. Return branded ValidatedShapefile
	const validated = shapefile as unknown as ValidatedShapefile;
	return {
		...validated,
	};
};
