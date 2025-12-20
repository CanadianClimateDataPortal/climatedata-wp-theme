/**
 * Shapefile file loading and extraction utilities.
 *
 * Extracts .shp (binary geometry) and .prj (projection) files from ZIP archives.
 */

import JSZip from 'jszip';
import { introspectFile } from './file-introspection';

/**
 * Extracted shapefile data.
 */
export interface ShapefileData {
  /**
   * Binary shapefile geometry data
   */
  'file.shp': ArrayBuffer;
  /**
   * Projection definition string
   */
  'file.prj': string;
}

/**
 * Custom error for shapefile loading failures.
 */
export class ShapefileLoadError extends Error {
  constructor(
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    // Explicit name - survives minification
    this.name = 'ShapefileLoadError';
  }
}

/**
 * Validates extracted data contains required files
 *
 * @param data - Extracted shapefile data
 * @throws {ShapefileLoadError} If required files are missing
 */
const assertHasRequiredFiles = (
  data: Partial<ShapefileData>,
): asserts data is ShapefileData => {
  if (!data['file.shp'] || !data['file.prj']) {
    throw new ShapefileLoadError(
      'ZIP file must contain both .shp and .prj files',
    );
  }
};

/**
 * Load and extract shapefile data from a ZIP file.
 *
 * Validation steps:
 * 1. Verify file is not empty (native introspection)
 * 2. Verify ZIP magic bytes (native introspection)
 * 3. Extract .shp and .prj files with JSZip
 *
 * A valid shapefile ZIP must contain:
 * - `.shp` file: Binary geometry data
 * - `.prj` file: Projection definition
 *
 * Other files in the ZIP are ignored to minimize data exposure.
 *
 * @param file - ZIP file containing shapefile data
 * @returns Promise resolving to extracted shapefile data
 * @throws {ShapefileLoadError} If file is invalid or missing required files
 *
 * @example
 * ```typescript
 * const fileInput = document.querySelector('input[type="file"]');
 * const file = fileInput.files[0];
 *
 * try {
 *   const data = await loadShapeFile(file);
 *   console.log('Loaded shapefile:', data);
 * } catch (error) {
 *   if (error instanceof ShapefileLoadError) {
 *     console.error('Invalid shapefile:', error.message);
 *   }
 * }
 * ```
 */
export const loadShapeFile = async (
  file: File,
): Promise<ShapefileData> => {
  // Step 1-2: Validate file content (not empty + ZIP magic bytes)
  const inspection = await introspectFile(file);

  if (inspection.isEmpty) {
    throw new ShapefileLoadError(
      'File is empty',
    );
  }

  if (!inspection.isZip) {
    throw new ShapefileLoadError(
      'File is not a valid ZIP archive (invalid magic bytes)',
  if (!inspection.isZip) {
    throw new ShapefileLoadError(
      'File is not a valid ZIP archive (invalid magic bytes)',
    );
  }

  // Step 3: Extract files with JSZip
  try {
    const data: Partial<ShapefileData> = {};
    const promises: Promise<void>[] = [];

    // Extract only .shp and .prj files
    for (const filename in zip.files) {
      const lowerName = filename.toLowerCase();
      const parts = lowerName.split('.');
      const extension = parts.pop();

      if (extension === 'shp') {
        const promise = zip.files[filename]
          .async('arraybuffer')
          .then((buffer) => {
            data['file.shp'] = buffer;
          });
        promises.push(promise);
      } else if (extension === 'prj') {
        const promise = zip.files[filename]
          .async('string')
          .then((content) => {
            data['file.prj'] = content;
          });
        promises.push(promise);
      }
    }

    if (promises.length === 0) {
      throw new ShapefileLoadError(
        'ZIP file does not contain a valid shapefile',
      );
    }

    await Promise.all(promises);
    assertHasRequiredFiles(data);

    return data;
  } catch (error) {
    if (error instanceof ShapefileLoadError) {
      throw error;
    }

    // JSZip or other errors
    if (error instanceof Error) {
      throw new ShapefileLoadError(
        'Failed to read ZIP file',
        { cause: error },
      );
    }

    throw new ShapefileLoadError(
      'An unexpected error occurred while loading shapefile',
    );
  }
};
