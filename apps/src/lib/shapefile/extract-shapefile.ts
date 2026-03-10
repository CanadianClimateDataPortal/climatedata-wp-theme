/**
 * Shapefile extraction from ZIP archives.
 *
 * Extracts .shp (binary geometry) and .prj (projection) files from ZIP.
 * Returns Result type for explicit error handling.
 */

import { unzipSync } from 'fflate';

import { detectZip } from './detect-zip';
import { ShapefileError } from './errors';
import type { ExtractedShapefile, ShapefilePair, SkippedEntry } from './contracts';
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

	// 3. Find all .shp entries
	const shpEntries = Object.keys(unzipped).filter(
		(name) => name.toLowerCase().endsWith('.shp'),
	);

	if (shpEntries.length === 0) {
		return {
			ok: false,
			error: new ShapefileError('ZIP does not contain a .shp file', {
				code: 'extraction/missing-shp',
			}),
		};
	}

	// 4. Match each .shp with its .prj by replacing the extension on the full path
	const pairs: ShapefilePair[] = [];
	const skippedEntries: SkippedEntry[] = [];
	const decoder = new TextDecoder();

	for (const shpName of shpEntries) {
		const basename = shpName.replace(/\.shp$/i, '');
		const prjName = Object.keys(unzipped).find(
			(name) => name.toLowerCase() === `${basename}.prj`.toLowerCase(),
		);

		if (!prjName) {
			skippedEntries.push({
				basename,
				reason: 'No matching .prj file found',
			});
			continue;
		}

		// .slice() creates a copy with its own ArrayBuffer
		pairs.push({
			shp: unzipped[shpName].slice().buffer,
			prj: decoder.decode(unzipped[prjName]),
			basename,
		});
	}

	// 5. Error if no valid pairs remain after filtering orphans
	if (pairs.length === 0) {
		return {
			ok: false,
			error: new ShapefileError(
				'ZIP contains .shp files but none have a matching .prj file',
				{ code: 'extraction/missing-prj' },
			),
		};
	}

	// 6. Return success
	const extracted: ExtractedShapefile = { pairs, skippedEntries };

	return { ok: true, value: extracted };
};
