/**
 * Tests for binary format detection (ZIP and SHP).
 *
 * Focus: Test validation decisions based on byte content.
 * Not tested: Browser File API, platform string operations.
 *
 * We use controlled byte sequences to verify our logic
 * correctly identifies ZIP magic bytes, SHP headers, and empty files.
 */

import { describe, it, expect } from 'vitest';

import {
	createMockFile,
} from './test-utils';
import {
	detectZip,
	formatMagicBytes,
	readShpHeader,
	ZIP_MAGIC_BYTES,
	SHP_FILE_CODE,
	SHP_HEADER_SIZE,
} from './magic-bytes';


describe('detectZip', () => {
	describe('ZIP detection via magic bytes', () => {
		it(`should detect ZIP magic bytes: ${formatMagicBytes(ZIP_MAGIC_BYTES)}`, async () => {
			const zipBytes = new Uint8Array(ZIP_MAGIC_BYTES);
			const file = createMockFile('test.zip', zipBytes);
			const result = await detectZip(file);

			expect(result.isZip).toBe(true);
			expect(result.isEmpty).toBe(false);
		});

		it('should reject non-ZIP magic bytes', async () => {
			const file = createMockFile('test.txt', 'plain text');
			const result = await detectZip(file);

			expect(result.isZip).toBe(false);
		});

		it('should reject files with incomplete magic bytes', async () => {
			const twoBytes = new Uint8Array(ZIP_MAGIC_BYTES.slice(0, 2));
			const file = createMockFile('tiny.zip', twoBytes);
			const result = await detectZip(file);

			expect(result.isZip).toBe(false);
		});

		it('should ignore file extension and check bytes only', async () => {
			// File has .zip extension but wrong bytes
			const file = createMockFile('fake.zip', 'not a zip', 'application/zip');
			const result = await detectZip(file);

			expect(result.isZip).toBe(false);
		});

		it('should ignore MIME type and check bytes only', async () => {
			// File claims ZIP MIME type but has wrong bytes
			const file = createMockFile('data.bin', 'random data', 'application/zip');
			const result = await detectZip(file);

			expect(result.isZip).toBe(false);
		});
	});

	describe('empty file detection', () => {
		it('should detect empty files', async () => {
			const emptyBytes = new Uint8Array([]);
			const file = createMockFile('empty.zip', emptyBytes);
			const result = await detectZip(file);

			expect(result.isEmpty).toBe(true);
			expect(result.isZip).toBe(false);
		});

		it('should not flag non-empty files as empty', async () => {
			const someBytes = new Uint8Array(ZIP_MAGIC_BYTES);
			const file = createMockFile('test.zip', someBytes);
			const result = await detectZip(file);

			expect(result.isEmpty).toBe(false);
		});
	});

	describe('diagnostic data', () => {
		it('should return hex string for firstBytes', async () => {
			const data = new Uint8Array(ZIP_MAGIC_BYTES);
			const file = createMockFile('test.zip', data);
			const result = await detectZip(file);
			expect(result.firstBytes).toBe(formatMagicBytes(ZIP_MAGIC_BYTES));
			expect(result.firstBytes).toBe('50 4b 03 04');
		});

		it('should return empty string for empty files', async () => {
			const file = createMockFile('empty.bin', new Uint8Array([]));
			const result = await detectZip(file);

			expect(result.firstBytes).toBe('');
		});
	});
});


// ============================================================================
// SHP HEADER READING
// ============================================================================

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

	// Offset 0: File code (big-endian) = 9994
	view.setInt32(0, SHP_FILE_CODE, false);
	// Offset 24: File length in 16-bit words (big-endian)
	view.setInt32(24, fileLengthWords, false);
	// Offset 32: Shape type (little-endian)
	view.setInt32(32, shapeType, true);

	return buffer;
};

describe('readShpHeader', () => {
	describe('valid SHP detection', () => {
		it('should detect a valid Polygon SHP (type 5)', () => {
			const buffer = buildShpHeader(5);
			const result = readShpHeader(buffer);

			expect(result.isShp).toBe(true);
			expect(result.isPolygon).toBe(true);
			expect(result.shapeTypeCode).toBe(5);
			expect(result.shapeTypeName).toBe('Polygon');
			expect(result.hasFeatures).toBe(true);
		});

		it('should detect a valid PolygonZ SHP (type 15)', () => {
			const buffer = buildShpHeader(15);
			const result = readShpHeader(buffer);

			expect(result.isShp).toBe(true);
			expect(result.isPolygon).toBe(true);
			expect(result.shapeTypeCode).toBe(15);
			expect(result.shapeTypeName).toBe('Polygon');
		});

		it('should detect a valid PolygonM SHP (type 25)', () => {
			const buffer = buildShpHeader(25);
			const result = readShpHeader(buffer);

			expect(result.isShp).toBe(true);
			expect(result.isPolygon).toBe(true);
			expect(result.shapeTypeCode).toBe(25);
			expect(result.shapeTypeName).toBe('Polygon');
		});
	});

	describe('non-polygon type detection', () => {
		it('should reject Point SHP (type 1)', () => {
			const buffer = buildShpHeader(1);
			const result = readShpHeader(buffer);

			expect(result.isShp).toBe(true);
			expect(result.isPolygon).toBe(false);
			expect(result.shapeTypeName).toBe('Point');
		});

		it('should reject Polyline SHP (type 3)', () => {
			const buffer = buildShpHeader(3);
			const result = readShpHeader(buffer);

			expect(result.isShp).toBe(true);
			expect(result.isPolygon).toBe(false);
			expect(result.shapeTypeName).toBe('Polyline');
		});

		it('should reject MultiPoint SHP (type 8)', () => {
			const buffer = buildShpHeader(8);
			const result = readShpHeader(buffer);

			expect(result.isShp).toBe(true);
			expect(result.isPolygon).toBe(false);
			expect(result.shapeTypeName).toBe('MultiPoint');
		});

		it('should reject MultiPatch SHP (type 31)', () => {
			const buffer = buildShpHeader(31);
			const result = readShpHeader(buffer);

			expect(result.isShp).toBe(true);
			expect(result.isPolygon).toBe(false);
			expect(result.shapeTypeName).toBe('MultiPatch');
		});
	});

	describe('feature detection', () => {
		it('should detect features when file length > 100 bytes', () => {
			// 58 words = 116 bytes > 100 header
			const buffer = buildShpHeader(5, 58);
			const result = readShpHeader(buffer);

			expect(result.hasFeatures).toBe(true);
			expect(result.fileLength).toBe(116);
		});

		it('should report no features when file is header-only (50 words = 100 bytes)', () => {
			// 50 words = exactly 100 bytes = header only
			const buffer = buildShpHeader(5, 50);
			const result = readShpHeader(buffer);

			expect(result.hasFeatures).toBe(false);
			expect(result.fileLength).toBe(100);
		});
	});

	describe('invalid file handling', () => {
		it('should reject a buffer smaller than 36 bytes', () => {
			const buffer = new ArrayBuffer(20);
			const result = readShpHeader(buffer);

			expect(result.isShp).toBe(false);
		});

		it('should reject a non-SHP file (wrong file code)', () => {
			const buffer = new ArrayBuffer(100);
			const view = new DataView(buffer);
			// Write wrong file code
			view.setInt32(0, 1234, false);
			const result = readShpHeader(buffer);

			expect(result.isShp).toBe(false);
		});

		it('should handle unknown shape type code gracefully', () => {
			const buffer = buildShpHeader(99);
			const result = readShpHeader(buffer);

			expect(result.isShp).toBe(true);
			expect(result.isPolygon).toBe(false);
			// Falls back to 'Point' for unknown types
			expect(result.shapeTypeName).toBe('Point');
		});
	});
});
