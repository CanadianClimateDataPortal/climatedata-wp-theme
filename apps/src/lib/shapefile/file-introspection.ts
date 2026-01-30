/**
 * Experiments made before working on CLIM-1324.
 * THIS FILE WILL BE GROSSLY SIMPLIFIED BEFORE MERGING.
 *
 * Native file introspection utilities.
 *
 * Validates file type and basic properties using only native File API.
 * No external libraries required.
 */

/**
 * Results from native file introspection.
 */
export interface FileIntrospection {
  /**
   * Whether file has valid ZIP magic bytes (50 4B 03 04)
   */
  isZip: boolean;

  /**
   * Whether file is empty (zero bytes)
   */
  isEmpty: boolean;

  /**
   * First 16 bytes as hex string (for diagnostics)
   */
  firstBytes: string;

  /**
   * Raw data preview (first 100 bytes, escaped)
   */
  rawDataPreview: string;
}

/**
 * Introspect file using only native File API.
 *
 * This function performs basic validation without external libraries:
 * - Checks ZIP magic bytes (50 4B 03 04 = "PK..")
 * - Detects empty files
 * - Provides diagnostic data for debugging
 *
 * Use this for initial file type validation before passing to
 * libraries like JSZip for actual extraction.
 *
 * @param file - File to introspect
 * @returns Introspection results with validation status
 *
 * @example
 * ```typescript
 * const file = fileInput.files[0];
 * const info = await introspectFile(file);
 *
 * if (!info.isZip) {
 *   throw new Error('File must be a ZIP archive');
 * }
 *
 * if (info.isEmpty) {
 *   throw new Error('File is empty');
 * }
 * ```
 */
export const introspectFile = async (
  file: File,
): Promise<FileIntrospection> => {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  // Check if file is empty
  const isEmpty = bytes.length === 0;

  // Read first 16 bytes for magic byte detection
  const headerBytes = bytes.slice(0, 16);
  const firstBytes = Array.from(headerBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join(' ');

  // ZIP magic bytes: 50 4B 03 04 ("PK" for Phil Katz, creator of PKZIP)
  const isZip =
    bytes.length >= 4 &&
    bytes[0] === 0x50 &&
    bytes[1] === 0x4b &&
    bytes[2] === 0x03 &&
    bytes[3] === 0x04;

  // Raw data preview for visualization - escape non-printable characters
  const decoder = new TextDecoder('utf-8', { fatal: false });
  const previewBytes = bytes.slice(0, 100);
  const textPreview = decoder.decode(previewBytes);
  const rawDataPreview = textPreview
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0);
      // Non-printable characters (below space or above tilde)
      return code < 32 || code > 126
        ? `\\x${code.toString(16).padStart(2, '0')}`
        : char;
    })
    .join('');

  return {
    isZip,
    isEmpty,
    firstBytes,
    rawDataPreview,
  };
};
