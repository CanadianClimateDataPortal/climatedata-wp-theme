/**
 * Tests for native file introspection.
 *
 * @module lib/shapefile/file-introspection.test
 */

import { describe, it, expect } from 'vitest';
import { introspectFile } from './file-introspection';

/**
 * Create a mock File object for testing
 */
const createMockFile = (
  name: string,
  content: Uint8Array | string,
  type = 'application/octet-stream',
): File => {
  const blob = new Blob(
    [content],
    { type },
  );
  return new File(
    [blob],
    name,
    { type },
  );
};

/**
 * Create a minimal valid ZIP file (PK magic bytes)
 */
const createMinimalZipFile = (): File => {
  // ZIP local file header signature: 50 4B 03 04
  const zipHeader = new Uint8Array([
    0x50, 0x4B, 0x03, 0x04, // ZIP signature (PK..)
    0x14, 0x00, // Version needed to extract
    0x00, 0x00, // General purpose bit flag
    0x00, 0x00, // Compression method (stored)
    0x00, 0x00, // Last mod file time
    0x00, 0x00, // Last mod file date
    0x00, 0x00, 0x00, 0x00, // CRC-32
    0x00, 0x00, 0x00, 0x00, // Compressed size
    0x00, 0x00, 0x00, 0x00, // Uncompressed size
  ]);

  return createMockFile('test.zip', zipHeader, 'application/zip');
};

describe('introspectFile', () => {
  describe('ZIP detection', () => {
    it('should detect valid ZIP files by magic bytes', async () => {
      const file = createMinimalZipFile();
      const result = await introspectFile(file);

      expect(result.isZip).toBe(true);
      expect(result.isEmpty).toBe(false);
      expect(result.firstBytes).toMatch(/^50 4b 03 04/);
    });

    it('should reject files without ZIP magic bytes', async () => {
      const file = createMockFile(
        'test.txt',
        'This is just text content',
        'text/plain',
      );
      const result = await introspectFile(file);

      expect(result.isZip).toBe(false);
      expect(result.isEmpty).toBe(false);
    });

    it('should reject files renamed to .zip without ZIP content', async () => {
      const file = createMockFile(
        'fake.zip',
        'not a real zip file',
        'application/zip',
      );
      const result = await introspectFile(file);

      expect(result.isZip).toBe(false);
      // MIME type is unreliable - we check magic bytes
    });

    it('should reject files too small to have ZIP header', async () => {
      const file = createMockFile(
        'tiny.zip',
        new Uint8Array([0x50, 0x4B]), // Only 2 bytes
      );
      const result = await introspectFile(file);

      expect(result.isZip).toBe(false);
      // Need at least 4 bytes for magic number
    });
  });

  describe('empty file detection', () => {
    it('should detect empty files', async () => {
      const file = createMockFile('empty.zip', new Uint8Array([]));
      const result = await introspectFile(file);

      expect(result.isEmpty).toBe(true);
      expect(result.isZip).toBe(false);
      expect(result.firstBytes).toBe('');
    });

    it('should not flag non-empty files as empty', async () => {
      const file = createMinimalZipFile();
      const result = await introspectFile(file);

      expect(result.isEmpty).toBe(false);
    });
  });

  describe('diagnostic data', () => {
    it('should provide first 16 bytes as hex string', async () => {
      const data = new Uint8Array([
        0x50, 0x4B, 0x03, 0x04, 0xAA, 0xBB, 0xCC, 0xDD,
        0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88,
      ]);
      const file = createMockFile('test.zip', data);
      const result = await introspectFile(file);

      expect(result.firstBytes).toBe(
        '50 4b 03 04 aa bb cc dd 11 22 33 44 55 66 77 88'
      );
    });

    it('should handle files smaller than 16 bytes', async () => {
      const data = new Uint8Array([0x50, 0x4B, 0x03, 0x04]);
      const file = createMockFile('small.zip', data);
      const result = await introspectFile(file);

      expect(result.firstBytes).toBe('50 4b 03 04');
    });

    it('should provide raw data preview with escaped non-printable chars', async () => {
      // Mix of printable and non-printable characters
      const data = new Uint8Array([
        0x50, 0x4B, 0x03, 0x04, // PK.. (P and K are printable, 0x03 and 0x04 are not)
        0x48, 0x65, 0x6C, 0x6C, 0x6F, // "Hello"
        0x00, 0x01, 0x02, // Non-printable
      ]);
      const file = createMockFile('test.zip', data);
      const result = await introspectFile(file);

      expect(result.rawDataPreview).toContain('PK');
      expect(result.rawDataPreview).toContain('Hello');
      expect(result.rawDataPreview).toContain('\\x03');
      expect(result.rawDataPreview).toContain('\\x04');
      expect(result.rawDataPreview).toContain('\\x00');
    });

    it('should limit preview to first 100 bytes', async () => {
      const data = new Uint8Array(200).fill(0x41); // 200 'A' characters
      const file = createMockFile('large.txt', data);
      const result = await introspectFile(file);

      // Preview should only show first 100 characters
      expect(result.rawDataPreview.length).toBeLessThanOrEqual(100);
    });
  });

  describe('edge cases', () => {
    it('should handle binary data correctly', async () => {
      const data = new Uint8Array(256);
      // Fill with all possible byte values
      for (let i = 0; i < 256; i++) {
        data[i] = i;
      }

      const file = createMockFile('binary.dat', data);
      const result = await introspectFile(file);

      expect(result).toHaveProperty('isZip');
      expect(result).toHaveProperty('isEmpty');
      expect(result).toHaveProperty('firstBytes');
      expect(result).toHaveProperty('rawDataPreview');
    });

    it('should handle UTF-8 text files', async () => {
      const file = createMockFile(
        'text.txt',
        'Hello 世界 🌍',
        'text/plain',
      );
      const result = await introspectFile(file);

      expect(result.isZip).toBe(false);
      expect(result.isEmpty).toBe(false);
      // Text decoder should handle UTF-8
      expect(result.rawDataPreview).toContain('Hello');
    });
  });
});
