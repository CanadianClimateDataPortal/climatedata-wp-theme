/**
 * Tests for shapefile extraction from ZIP archives.
 *
 * Tests verify extraction logic and error handling via Result type.
 * We mock File.arrayBuffer() to test behavior with controlled inputs.
 */

import { describe, it, expect } from 'vitest';
import { zipSync, strToU8 as _strToU8 } from 'fflate';

import { extractShapefileFromZip } from './extract-shapefile';
import { ShapefileError } from './errors';
import { createMockFile } from './test-utils';

/**
 * Realm-safe wrapper for fflate's strToU8.
 *
 * In jsdom, fflate's strToU8 returns a Node.js-realm Uint8Array that
 * fails zipSync's `instanceof Uint8Array` check (jsdom realm), causing
 * string entries to be treated as directories instead of file content.
 * Re-wrapping with the global Uint8Array constructor fixes this.
 */
const strToU8 = (s: string): Uint8Array => new Uint8Array(_strToU8(s));

/**
 * Create a valid ZIP file containing .shp and .prj files.
 */
const createValidShapefileZip = (): File => {
	const zipData = zipSync({
		// Mock binary .shp file (shapefile header starts with file code)
		'test.shp': new Uint8Array([
			0x00, 0x00, 0x27, 0x0a, // File code
			0x00, 0x00, 0x00, 0x00, // Unused
		]),
		// Mock .prj file (WGS84 projection)
		'test.prj': strToU8('GEOGCS["WGS 84",DATUM["WGS_1984"]]'),
	});
	return createMockFile('test.zip', zipData);
};

describe('extractShapefileFromZip', () => {
	describe('successful extraction', () => {
		it('should extract .shp and .prj files from valid ZIP', async () => {
			const file = createValidShapefileZip();
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
			const zipData = zipSync({
				'test.shp': new Uint8Array([0x00]),
				'test.prj': strToU8('GEOGCS["WGS 84"]'),
				'test.dbf': strToU8('ignored data'),
				'test.shx': strToU8('ignored data'),
				'readme.txt': strToU8('ignored data'),
			});
			const file = createMockFile('test.zip', zipData);

			const result = await extractShapefileFromZip(file);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(Object.keys(result.value)).toHaveLength(2);
				expect(result.value).toHaveProperty('file.shp');
				expect(result.value).toHaveProperty('file.prj');
			}
		});

		it('should handle case-insensitive file extensions', async () => {
			const zipData = zipSync({
				'TEST.SHP': new Uint8Array([0x00]),
				'TEST.PRJ': strToU8('GEOGCS["WGS 84"]'),
			});
			const file = createMockFile('test.zip', zipData);

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

		it('should return error for files with non-ZIP content but correct extension', async () => {
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
			const zipData = zipSync({
				'test.prj': strToU8('GEOGCS["WGS 84"]'),
				'readme.txt': strToU8('data'),
			});
			const file = createMockFile('test.zip', zipData);

			const result = await extractShapefileFromZip(file);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toBeInstanceOf(ShapefileError);
				expect(result.error.code).toBe('extraction/missing-shp');
			}
		});

		it('should return error for ZIP without .prj file', async () => {
			const zipData = zipSync({
				'test.shp': new Uint8Array([0x00]),
				'readme.txt': strToU8('data'),
			});
			const file = createMockFile('test.zip', zipData);

			const result = await extractShapefileFromZip(file);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toBeInstanceOf(ShapefileError);
				expect(result.error.code).toBe('extraction/missing-prj');
			}
		});

		it('should return error for ZIP with only unrelated files', async () => {
			const zipData = zipSync({
				'readme.txt': strToU8('some content'),
				'data.csv': strToU8('a,b,c'),
			});
			const file = createMockFile('no-shapefile.zip', zipData);

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
