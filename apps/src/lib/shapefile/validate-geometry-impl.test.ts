/**
 * Tests for shapefile geometry validation implementation.
 *
 * Tests verify filtering of non-polygon pairs, accumulation of
 * skippedEntries, and error handling for invalid/empty shapefiles.
 */

import { describe, it, expect } from 'vitest';

import { validateShapefileGeometryImpl } from './validate-geometry-impl';
import { InvalidGeometryTypeError, ProcessingError } from './errors';
import type { ExtractedShapefile } from './contracts';
import { SHP_FILE_CODE, SHP_HEADER_SIZE } from './detect-shp';

/**
 * Build a minimal valid SHP header buffer.
 *
 * @param shapeType - Shape type code (little-endian at offset 32)
 * @param fileLengthWords - File length in 16-bit words (big-endian at offset 24).
 *   Default 58 = 116 bytes (header + one small record), indicating features exist.
 */
const buildShpHeader = (shapeType: number, fileLengthWords = 58): ArrayBuffer => {
	const buffer = new ArrayBuffer(SHP_HEADER_SIZE);
	const view = new DataView(buffer);
	view.setInt32(0, SHP_FILE_CODE, false);
	view.setInt32(24, fileLengthWords, false);
	view.setInt32(32, shapeType, true);
	return buffer;
};

/**
 * Create an ExtractedShapefile with the given pairs.
 * Convenience factory — pre-fills skippedEntries as empty.
 */
const createExtracted = (
	pairs: Array<{ basename: string; shapeType: number }>,
	skippedEntries: ExtractedShapefile['skippedEntries'] = [],
): ExtractedShapefile => ({
	pairs: pairs.map(({ basename, shapeType }) => ({
		shp: buildShpHeader(shapeType),
		prj: 'GEOGCS["GCS_WGS_1984"]',
		basename,
	})),
	skippedEntries,
});

describe('validateShapefileGeometryImpl', () => {
	it('should pass all polygon pairs through', async () => {
		const input = createExtracted([
			{ basename: 'region_s', shapeType: 5 },
			{ basename: 'munic_s', shapeType: 5 },
		]);

		const result = await validateShapefileGeometryImpl(input);

		expect(result.pairs).toHaveLength(2);
		expect(result.skippedEntries).toHaveLength(0);
	});

	it('should keep polygon and skip polyline with warning', async () => {
		const input = createExtracted([
			{ basename: 'region_s', shapeType: 5 },  // Polygon
			{ basename: 'region_l', shapeType: 3 },  // Polyline
		]);

		const result = await validateShapefileGeometryImpl(input);

		expect(result.pairs).toHaveLength(1);
		expect(result.pairs[0].basename).toBe('region_s');
		expect(result.skippedEntries).toHaveLength(1);
		expect(result.skippedEntries[0].basename).toBe('region_l');
		expect(result.skippedEntries[0].reason).toContain('Polyline');
	});

	it('should throw InvalidGeometryTypeError when zero polygon pairs remain', async () => {
		const input = createExtracted([
			{ basename: 'lines_l', shapeType: 3 },  // Polyline
			{ basename: 'points', shapeType: 1 },    // Point
		]);

		await expect(
			validateShapefileGeometryImpl(input),
		).rejects.toThrow(InvalidGeometryTypeError);
	});

	it('should throw ProcessingError for invalid .shp file code', async () => {
		const input: ExtractedShapefile = {
			pairs: [{
				shp: new ArrayBuffer(100),  // All zeros — wrong file code
				prj: 'GEOGCS["GCS_WGS_1984"]',
				basename: 'bad',
			}],
			skippedEntries: [],
		};

		await expect(
			validateShapefileGeometryImpl(input),
		).rejects.toThrow(ProcessingError);
	});

	it('should accumulate skippedEntries from extraction and validation', async () => {
		const input = createExtracted(
			[
				{ basename: 'region_s', shapeType: 5 },  // Polygon — kept
				{ basename: 'region_l', shapeType: 3 },  // Polyline — skipped by validation
			],
			// Pre-existing skipped entry from extraction phase
			[{ basename: 'orphan', reason: 'No matching .prj file found' }],
		);

		const result = await validateShapefileGeometryImpl(input);

		expect(result.pairs).toHaveLength(1);
		// 1 from extraction + 1 from validation = 2
		expect(result.skippedEntries).toHaveLength(2);
		expect(result.skippedEntries[0].basename).toBe('orphan');
		expect(result.skippedEntries[1].basename).toBe('region_l');
	});
});
