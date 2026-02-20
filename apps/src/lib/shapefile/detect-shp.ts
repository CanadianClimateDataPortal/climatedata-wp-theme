/**
 * SHP file detection utilities.
 *
 * Validates file type using magic bytes before attempting extraction.
 * No external libraries required.
 * Binary format detection via raw byte reading.
 *
 * SHP file header inspection (file code, shape type, feature presence) using
 * fixed-size headers.
 *
 * @see https://www.loc.gov/preservation/digital/formats/fdd/fdd000280.shtml
 * @see https://en.wikipedia.org/wiki/Shapefile#Shapefile_shape_format_.28.shp.29
 */

import type { GeometryType } from './contracts';

// ============================================================================
// SHP HEADER READING
// ============================================================================

/**
 * SHP file code — big-endian int32 at offset 0.
 * Always 9994 (0x0000270A) for valid .shp files.
 */
export const SHP_FILE_CODE = 9994;

/**
 * Minimum SHP header size in bytes.
 * The fixed-length header is exactly 100 bytes.
 */
export const SHP_HEADER_SIZE = 100 as const;

/**
 * Shape type codes that represent polygon geometry.
 *
 * - 5: Polygon (2D)
 * - 15: PolygonZ (3D with Z + optional M)
 * - 25: PolygonM (2D with M)
 *
 * @see https://en.wikipedia.org/wiki/Shapefile#Shapefile_shape_format_.28.shp.29
 */
export const SHP_POLYGON_TYPES = [5, 15, 25] as const;

/**
 * Map from SHP shape type code to human-readable GeometryType name.
 *
 * Used for error messages when rejecting non-polygon shapefiles.
 */
export const SHP_SHAPE_TYPE_NAMES: Record<number, GeometryType> = {
	 0: 'Point',      // Null Shape — treat as unknown/Point for error messaging
	 1: 'Point',
	 3: 'Polyline',
	 5: 'Polygon',
	 8: 'MultiPoint',
	11: 'Point',      // PointZ
	13: 'Polyline',   // PolylineZ
	15: 'Polygon',    // PolygonZ
	21: 'Point',      // PointM
	23: 'Polyline',   // PolylineM
	25: 'Polygon',    // PolygonM
	31: 'MultiPatch',
};

/**
 * Result of reading a .shp file header.
 */
export interface ShpDetectionResult {
	/** Whether the buffer has valid .shp magic number (file code 9994) */
	isShp: boolean;
	/** File length in bytes (derived from 16-bit word count in header) */
	fileLength: number;
	/** Whether file has at least one feature record (fileLength > 100 bytes) */
	hasFeatures: boolean;
	/** Shape type code from header (e.g., 5 = Polygon) */
	shapeTypeCode: number;
	/** Whether shape type is a polygon variant (5, 15, or 25) */
	isPolygon: boolean;
	/** Human-readable shape type name for error messages */
	shapeTypeName: GeometryType;
}

/**
 * Read and inspect the fixed-length header of a .shp file.
 *
 * The SHP header is exactly 100 bytes with a fixed structure:
 * - Offset 0, 4 bytes, big-endian: File code (must be 9994)
 * - Offset 24, 4 bytes, big-endian: File length in 16-bit words
 * - Offset 32, 4 bytes, little-endian: Shape type code
 *
 * This reads only the first 36 bytes — no parsing of geometry records.
 *
 * @param buffer - ArrayBuffer containing .shp file data
 * @returns Header inspection result, or a result with `isShp: false` if invalid
 *
 * @example
 * ```typescript
 * const result = await detectShp(shpArrayBuffer);
 *
 * if (!result.isShp) {
 *   // Not a valid .shp file
 * }
 *
 * if (!result.isPolygon) {
 *   // Wrong geometry type — result.shapeTypeName has the type
 * }
 * ```
 */
export const detectShp = async (
	buffer: ArrayBuffer
): Promise<ShpDetectionResult> => {
	await Promise.resolve(); // Preserving same contract as detectZip()

	// Need at least 36 bytes to read file code + file length + shape type
	if (buffer.byteLength < 36) {
		return {
			isShp: false,
			fileLength: 0,
			hasFeatures: false,
			shapeTypeCode: -1,
			isPolygon: false,
			shapeTypeName: 'Point',
		};
	}

	const view = new DataView(buffer);

	// Offset 0: File code (big-endian int32, must be 9994)
	const fileCode = view.getInt32(0, false);
	if (fileCode !== SHP_FILE_CODE) {
		return {
			isShp: false,
			fileLength: 0,
			hasFeatures: false,
			shapeTypeCode: -1,
			isPolygon: false,
			shapeTypeName: 'Point',
		};
	}

	// Offset 24: File length in 16-bit words (big-endian int32)
	const fileLengthWords = view.getInt32(24, false);
	const fileLength = fileLengthWords * 2;

	// Offset 32: Shape type (little-endian int32)
	const shapeTypeCode = view.getInt32(32, true);

	const isPolygon = (SHP_POLYGON_TYPES as readonly number[]).includes(
		shapeTypeCode
	);
	const shapeTypeName = SHP_SHAPE_TYPE_NAMES[shapeTypeCode] ?? 'Point';

	// Features exist if file is longer than the 100-byte header
	const hasFeatures = fileLength > SHP_HEADER_SIZE;

	return {
		isShp: true,
		fileLength,
		hasFeatures,
		shapeTypeCode,
		isPolygon,
		shapeTypeName,
	};
};
