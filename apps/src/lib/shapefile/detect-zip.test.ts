/**
 * Tests for ZIP file detection.
 *
 * Focus: Test validation decisions (isZip, isEmpty) based on byte content.
 * Not tested: Browser File API, platform string operations.
 *
 * We mock File to provide controlled byte sequences, then verify our logic
 * correctly identifies ZIP magic bytes and empty files.
 */

import { describe, it, expect } from 'vitest';

import {
	createMockFile,
} from './test-utils';
import {
	detectZip,
	formatMagicBytes,
	ZIP_MAGIC_BYTES,
} from './detect-zip';


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
