/**
 * ZIP file detection utilities.
 *
 * Validates file type using magic bytes before attempting extraction.
 * No external libraries required — uses only native File API.
 */

/**
 * ZIP file magic bytes (PKZip signature).
 *
 * "PK" = Phil Katz, creator of PKZIP format.
 * 0x03 0x04 = Local file header signature.
 */
export const ZIP_MAGIC_BYTES = [0x50, 0x4b, 0x03, 0x04] as const;

/**
 * Format magic bytes as space-separated hex string.
 *
 * @example formatMagicBytes([0x50, 0x4b, 0x03, 0x04]) → "50 4b 03 04"
 */
export const formatMagicBytes = (bytes: readonly number[]): string =>
	bytes.map((b) => b.toString(16).padStart(2, '0')).join(' ');

/**
 * Result of ZIP file detection.
 */
export interface ZipDetectionResult {
	/**
	 * Whether file has valid ZIP magic bytes (50 4B 03 04)
	 */
	isZip: boolean;

	/**
	 * Whether file is empty (zero bytes)
	 */
	isEmpty: boolean;

	/**
	 * First 16 bytes as hex string (for diagnostics in error messages)
	 */
	firstBytes: string;
}

/**
 * Detect if a file is a valid ZIP archive.
 *
 * Checks:
 * - ZIP magic bytes (50 4B 03 04 = "PK.." for Phil Katz, creator of PKZIP)
 * - Empty files (zero bytes)
 *
 * Use this for initial validation before passing to JSZip for extraction.
 *
 * @param file - File to check
 * @returns Detection result with validation status
 *
 * @example
 * ```typescript
 * const file = fileInput.files[0];
 * const result = await detectZip(file);
 *
 * if (result.isEmpty) {
 *   // Handle empty file
 * }
 *
 * if (!result.isZip) {
 *   // Handle non-ZIP file, use result.firstBytes for diagnostics
 * }
 * ```
 */
export const detectZip = async (file: File): Promise<ZipDetectionResult> => {
	const arrayBuffer = await file.arrayBuffer();
	const bytes = new Uint8Array(arrayBuffer);

	// Check if file is empty
	const isEmpty = bytes.length === 0;

	// Read first 16 bytes for magic byte detection
	const headerBytes = bytes.slice(0, 16);
	const firstBytes = Array.from(headerBytes)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join(' ');

	// Check ZIP magic bytes
	const isZip =
		bytes.length >= ZIP_MAGIC_BYTES.length &&
		ZIP_MAGIC_BYTES.every((byte, i) => bytes[i] === byte);

	return {
		isZip,
		isEmpty,
		firstBytes,
	};
};
