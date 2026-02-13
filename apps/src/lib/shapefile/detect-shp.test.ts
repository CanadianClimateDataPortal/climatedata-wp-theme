/**
 * Tests for SHP file detection.
 *
 * Focus: Test validation decisions (isShp, isPolygon) based on byte content.
 * Not tested: Browser File API, platform string operations.
 *
 * We mock File to provide controlled byte sequences, then verify using
 * SHP headers.
 */

import { describe, it, expect } from 'vitest';

import {
	detectShp,
	SHP_FILE_CODE,
	SHP_HEADER_SIZE,
} from './detect-shp';

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

describe('detectShp', () => {
	describe('valid SHP detection', () => {
		it('should detect a valid Polygon SHP (type 5)', async () => {
			const buffer = buildShpHeader(5);
			const result = await detectShp(buffer);

			expect(result.isShp).toBe(true);
			expect(result.isPolygon).toBe(true);
			expect(result.shapeTypeCode).toBe(5);
			expect(result.shapeTypeName).toBe('Polygon');
			expect(result.hasFeatures).toBe(true);
		});

		it('should detect a valid PolygonZ SHP (type 15)', async () => {
			const buffer = buildShpHeader(15);
			const result = await detectShp(buffer);

			expect(result.isShp).toBe(true);
			expect(result.isPolygon).toBe(true);
			expect(result.shapeTypeCode).toBe(15);
			expect(result.shapeTypeName).toBe('Polygon');
		});

		it('should detect a valid PolygonM SHP (type 25)', async () => {
			const buffer = buildShpHeader(25);
			const result = await detectShp(buffer);

			expect(result.isShp).toBe(true);
			expect(result.isPolygon).toBe(true);
			expect(result.shapeTypeCode).toBe(25);
			expect(result.shapeTypeName).toBe('Polygon');
		});
	});

	describe('non-polygon type detection', () => {
		it('should reject Point SHP (type 1)', async () => {
			const buffer = buildShpHeader(1);
			const result = await detectShp(buffer);

			expect(result.isShp).toBe(true);
			expect(result.isPolygon).toBe(false);
			expect(result.shapeTypeName).toBe('Point');
		});

		it('should reject Polyline SHP (type 3)', async () => {
			const buffer = buildShpHeader(3);
			const result = await detectShp(buffer);

			expect(result.isShp).toBe(true);
			expect(result.isPolygon).toBe(false);
			expect(result.shapeTypeName).toBe('Polyline');
		});

		it('should reject MultiPoint SHP (type 8)', async () => {
			const buffer = buildShpHeader(8);
			const result = await detectShp(buffer);

			expect(result.isShp).toBe(true);
			expect(result.isPolygon).toBe(false);
			expect(result.shapeTypeName).toBe('MultiPoint');
		});

		it('should reject MultiPatch SHP (type 31)', async () => {
			const buffer = buildShpHeader(31);
			const result = await detectShp(buffer);

			expect(result.isShp).toBe(true);
			expect(result.isPolygon).toBe(false);
			expect(result.shapeTypeName).toBe('MultiPatch');
		});
	});

	describe('feature detection', () => {
		it('should detect features when file length > 100 bytes', async () => {
			// 58 words = 116 bytes > 100 header
			const buffer = buildShpHeader(5, 58);
			const result = await detectShp(buffer);

			expect(result.hasFeatures).toBe(true);
			expect(result.fileLength).toBe(116);
		});

		it('should report no features when file is header-only (50 words = 100 bytes)', async () => {
			// 50 words = exactly 100 bytes = header only
			const buffer = buildShpHeader(5, 50);
			const result = await detectShp(buffer);

			expect(result.hasFeatures).toBe(false);
			expect(result.fileLength).toBe(100);
		});
	});

	describe('invalid file handling', () => {
		it('should reject a buffer smaller than 36 bytes', async () => {
			const buffer = new ArrayBuffer(20);
			const result = await detectShp(buffer);

			expect(result.isShp).toBe(false);
		});

		it('should reject a non-SHP file (wrong file code)', async () => {
			const buffer = new ArrayBuffer(100);
			const view = new DataView(buffer);
			// Write wrong file code
			view.setInt32(0, 1234, false);
			const result = await detectShp(buffer);

			expect(result.isShp).toBe(false);
		});

		it('should handle unknown shape type code gracefully', async () => {
			const buffer = buildShpHeader(99);
			const result = await detectShp(buffer);

			expect(result.isShp).toBe(true);
			expect(result.isPolygon).toBe(false);
			// Falls back to 'Point' for unknown types
			expect(result.shapeTypeName).toBe('Point');
		});
	});
});
