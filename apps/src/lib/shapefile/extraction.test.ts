/**
 * Tests for shapefile extraction from ZIP archives.
 *
 * Tests verify extraction logic and error handling via Result type.
 * We mock File.arrayBuffer() to test behavior with controlled inputs.
 */

import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { extractShapefileFromZip } from '@/lib/shapefile/extraction';
import { ShapefileError } from '@/lib/shapefile/errors';
import { createMockFile } from '@/lib/shapefile/test-utils';

/**
 * Create a valid ZIP file containing .shp and .prj files.
 */
const createValidShapefileZip = async (): Promise<File> => {
	const zip = new JSZip();

	// Mock binary .shp file (shapefile header starts with file code)
	const shpData = new Uint8Array([
		0x00, 0x00, 0x27, 0x0a, // File code
		0x00, 0x00, 0x00, 0x00, // Unused
	]);
	zip.file('test.shp', shpData);

	// Mock .prj file (WGS84 projection)
	const prjData = 'GEOGCS["WGS 84",DATUM["WGS_1984"]]';
	zip.file('test.prj', prjData);

	const zipBlob = await zip.generateAsync({ type: 'arraybuffer' });
	return createMockFile('test.zip', zipBlob);
};

describe('extractShapefileFromZip', () => {
	describe('successful extraction', () => {
		it('should extract .shp and .prj files from valid ZIP', async () => {
			const file = await createValidShapefileZip();
			const result = await extractShapefileFromZip(file);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toHaveProperty('file.shp');
				expect(result.value).toHaveProperty('file.prj');
				expect(result.value['file.shp']).toBeInstanceOf(ArrayBuffer);
				expect(typeof result.value['file.prj']).toBe('string');
			}
		});

		it('should ignore other files in ZIP (dbf, shx, etc)', async () => {
			const zip = new JSZip();
			zip.file('test.shp', new Uint8Array([0x00]));
			zip.file('test.prj', 'GEOGCS["WGS 84"]');
			zip.file('test.dbf', 'ignored data');
			zip.file('test.shx', 'ignored data');
			zip.file('readme.txt', 'ignored data');

			const zipBlob = await zip.generateAsync({ type: 'arraybuffer' });
			const file = createMockFile('test.zip', zipBlob);

			const result = await extractShapefileFromZip(file);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(Object.keys(result.value)).toHaveLength(2);
				expect(result.value).toHaveProperty('file.shp');
				expect(result.value).toHaveProperty('file.prj');
			}
		});

		it('should handle case-insensitive file extensions', async () => {
			const zip = new JSZip();
			zip.file('TEST.SHP', new Uint8Array([0x00]));
			zip.file('TEST.PRJ', 'GEOGCS["WGS 84"]');

			const zipBlob = await zip.generateAsync({ type: 'arraybuffer' });
			const file = createMockFile('test.zip', zipBlob);

			const result = await extractShapefileFromZip(file);

			expect(result.ok).toBe(true);
		});
	});

	describe('error: empty file', () => {
		it('should return error for empty files', async () => {
			const file = createMockFile('empty.zip', new Uint8Array([]));
			const result = await extractShapefileFromZip(file);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toBeInstanceOf(ShapefileError);
				expect(result.error.code).toBe('extraction/empty-file');
			}
		});
	});

	describe('error: not a ZIP', () => {
		it('should return error for non-ZIP files', async () => {
			const file = createMockFile('test.txt', 'plain text', 'text/plain');
			const result = await extractShapefileFromZip(file);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toBeInstanceOf(ShapefileError);
				expect(result.error.code).toBe('extraction/not-a-zip');
				expect(result.error.message).toContain('first bytes');
			}
		});

		it('should return error for files with wrong extension but valid-looking content', async () => {
			const file = createMockFile('fake.zip', 'not a zip', 'application/zip');
			const result = await extractShapefileFromZip(file);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.code).toBe('extraction/not-a-zip');
			}
		});
	});

	describe('error: missing required files', () => {
		it('should return error for ZIP without .shp file', async () => {
			const zip = new JSZip();
			zip.file('test.prj', 'GEOGCS["WGS 84"]');
			zip.file('readme.txt', 'data');

			const zipBlob = await zip.generateAsync({ type: 'arraybuffer' });
			const file = createMockFile('test.zip', zipBlob);

			const result = await extractShapefileFromZip(file);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toBeInstanceOf(ShapefileError);
				expect(result.error.code).toBe('extraction/missing-shp');
			}
		});

		it('should return error for ZIP without .prj file', async () => {
			const zip = new JSZip();
			zip.file('test.shp', new Uint8Array([0x00]));
			zip.file('readme.txt', 'data');

			const zipBlob = await zip.generateAsync({ type: 'arraybuffer' });
			const file = createMockFile('test.zip', zipBlob);

			const result = await extractShapefileFromZip(file);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toBeInstanceOf(ShapefileError);
				expect(result.error.code).toBe('extraction/missing-prj');
			}
		});

		it('should return error for ZIP with only unrelated files', async () => {
			const zip = new JSZip();
			zip.file('readme.txt', 'some content');
			zip.file('data.csv', 'a,b,c');
			const zipBlob = await zip.generateAsync({ type: 'arraybuffer' });
			const file = createMockFile('no-shapefile.zip', zipBlob);

			const result = await extractShapefileFromZip(file);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				// ZIP is valid but has no .shp file
				expect(result.error.code).toBe('extraction/missing-shp');
			}
		});
	});

	describe('ShapefileError properties', () => {
		it('should have correct name for debugging', async () => {
			const file = createMockFile('test.txt', 'not a zip');
			const result = await extractShapefileFromZip(file);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.name).toBe('ShapefileError');
			}
		});

		it('should include diagnostic info in error message', async () => {
			const file = createMockFile('test.txt', 'plain text');
			const result = await extractShapefileFromZip(file);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				// Message should include the first bytes for debugging
				expect(result.error.message).toMatch(/first bytes.*[0-9a-f]/i);
			}
		});
	});
});
