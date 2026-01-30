/**
 * Experiments made before working on CLIM-1324.
 * THIS FILE WILL BE GROSSLY SIMPLIFIED BEFORE MERGING.
 *
 * Shapefile file loading and extraction utilities.
 *
 * Extracts .shp (binary geometry) and .prj (projection) files from ZIP archives.
 */

import JSZip from 'jszip';

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
 * Validates file extension is .zip
 *
 * @param file - File to validate
 * @throws {ShapefileLoadError} If file extension is not .zip
 */
const assertIsZipFile = (
  file: File,
): void => {
  const fileName = file.name.toLowerCase();
  const parts = fileName.split('.');
  const extension = parts.pop();

  if (extension !== 'zip') {
    throw new ShapefileLoadError(
      'Shapefile must be a ZIP file containing at least .shp and .prj files',
    );
  }
};

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
  assertIsZipFile(file);

  try {
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

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
