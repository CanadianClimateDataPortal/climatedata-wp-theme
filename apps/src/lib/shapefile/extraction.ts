/**
 * Shapefile extraction from ZIP archives.
 *
 * Extracts .shp (binary geometry) and .prj (projection) files from ZIP.
 * Returns Result type for explicit error handling.
 */

import { unzipSync } from 'fflate';
import { detectZip } from './detect-zip';
import { ShapefileError } from './errors';
import type { ExtractedShapefile } from './contracts';
import type { Result } from './result';
import type { ExtractShapefileFromZip } from './pipeline';

/**
 * Extract shapefile data from a ZIP archive.
 *
 * A valid shapefile ZIP must contain:
 * - `.shp` file: Binary geometry data
 * - `.prj` file: Projection definition
 *
 * Other files in the ZIP (e.g., .dbf, .shx) are ignored.
 *
 * @param file - ZIP file containing shapefile data
 * @returns Result with extracted data or typed error
 *
 * @example
 * ```typescript
 * const result = await extractShapefileFromZip(file);
 *
 * if (result.ok) {
 *   const { 'file.shp': shpBuffer, 'file.prj': prjContent } = result.value;
 *   // Process shapefile data
 * } else {
 *   switch (result.error.code) {
 *     case 'extraction/not-a-zip':
 *       // Handle invalid file type
 *       break;
 *     case 'extraction/missing-shp':
 *       // Handle missing .shp file
 *       break;
 *   }
 * }
 * ```
 */
export const extractShapefileFromZip: ExtractShapefileFromZip = async (
	file,
): Promise<Result<ExtractedShapefile, ShapefileError>> => {
	// 1. Detect if file is a valid ZIP
	const detection = await detectZip(file);

	if (detection.isEmpty) {
		return {
			ok: false,
			error: new ShapefileError('File is empty (zero bytes)', {
				code: 'extraction/empty-file',
			}),
		};
	}

	if (!detection.isZip) {
		return {
			ok: false,
			error: new ShapefileError(
				`File is not a ZIP archive (first bytes: ${detection.firstBytes})`,
				{ code: 'extraction/not-a-zip' },
			),
		};
	}

	// 2. Parse ZIP with fflate
	let unzipped: Record<string, Uint8Array>;
	try {
		const arrayBuffer = await file.arrayBuffer();
		unzipped = unzipSync(new Uint8Array(arrayBuffer));
	} catch (err) {
		return {
			ok: false,
			error: new ShapefileError(
				`Failed to parse ZIP: ${err instanceof Error ? err.message : 'Unknown error'}`,
				{
					code: 'extraction/zip-parse-failed',
					cause: err instanceof Error ? err : undefined,
				},
			),
		};
	}

	// 3. Find and extract .shp and .prj files
	let shpBuffer: ArrayBuffer | null = null;
	let prjContent: string | null = null;

	for (const filename of Object.keys(unzipped)) {
		const lowerName = filename.toLowerCase();
		const ext = lowerName.split('.').pop();

		if (ext === 'shp') {
			// .slice() creates a copy with its own ArrayBuffer
			shpBuffer = unzipped[filename].slice().buffer;
		} else if (ext === 'prj') {
			prjContent = new TextDecoder().decode(unzipped[filename]);
		}
	}

	// 4. Validate required files exist
	if (!shpBuffer) {
		return {
			ok: false,
			error: new ShapefileError('ZIP does not contain a .shp file', {
				code: 'extraction/missing-shp',
			}),
		};
	}

	if (prjContent === null) {
		return {
			ok: false,
			error: new ShapefileError('ZIP does not contain a .prj file', {
				code: 'extraction/missing-prj',
			}),
		};
	}

	// 5. Return success
	const extracted: ExtractedShapefile = {
		'file.shp': shpBuffer,
		'file.prj': prjContent,
	};

	return { ok: true, value: extracted };
};
