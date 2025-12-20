/**
 * Tests for file introspection validation logic.
 *
 * Focus: Test our validation decisions (isZip, isEmpty) based on byte content.
 * Not tested: Browser File API, TextDecoder, or platform string operations.
 *
 * We mock File to provide controlled byte sequences, then verify our logic
 * correctly identifies ZIP magic bytes and empty files.
 */

import { describe, it, expect } from 'vitest';
import { introspectFile } from './file-introspection';

/**
 * Mock File with controlled byte content.
 *
 * Provides only what our code needs: arrayBuffer() returning specific bytes.
 * This isolates our validation logic from platform File API implementation.
 */
const createMockFile = (
  name: string,
  content: Uint8Array | string,
  type = 'application/octet-stream',
): File => {
  const buffer =
    typeof content === 'string'
      ? new TextEncoder().encode(content).buffer
      : content.buffer;

  const file = {
    name,
    size: buffer.byteLength,
    type,
    arrayBuffer: async (): Promise<ArrayBuffer> => buffer,
  } as File;

  return file;
};

describe('introspectFile', () => {
  describe('validation logic - ZIP detection', () => {
    it('should detect ZIP magic bytes: 50 4B 03 04', async () => {
      const zipBytes = new Uint8Array([
        0x50,
        0x4b,
        0x03,
        0x04,
      ]);
      const file = createMockFile('test.zip', zipBytes);
      const result = await introspectFile(file);

      // Our validation logic
      expect(result.isZip).toBe(true);
    });

    it('should reject non-ZIP magic bytes', async () => {
      const file = createMockFile('test.txt', 'plain text');
      const result = await introspectFile(file);

      // Our validation logic
      expect(result.isZip).toBe(false);
    });

    it('should reject files with incomplete magic bytes', async () => {
      const twoBytes = new Uint8Array([0x50, 0x4b]);
      const file = createMockFile('tiny.zip', twoBytes);
      const result = await introspectFile(file);

      // Our validation logic - need all 4 bytes
      expect(result.isZip).toBe(false);
    });

    it('should ignore MIME type and check bytes only', async () => {
      // File claims to be ZIP but has wrong bytes
      const file = createMockFile('fake.zip', 'not a zip', 'application/zip');
      const result = await introspectFile(file);

      // Our validation logic - MIME type ignored
      expect(result.isZip).toBe(false);
    });
  });

  describe('validation logic - empty file detection', () => {
    it('should detect empty files', async () => {
      const emptyBytes = new Uint8Array([]);
      const file = createMockFile('empty.zip', emptyBytes);
      const result = await introspectFile(file);

      // Our validation logic
      expect(result.isEmpty).toBe(true);
      expect(result.isZip).toBe(false);
    });

    it('should not flag non-empty files as empty', async () => {
      const someBytes = new Uint8Array([0x50, 0x4b, 0x03, 0x04]);
      const file = createMockFile('test.zip', someBytes);
      const result = await introspectFile(file);

      // Our validation logic
      expect(result.isEmpty).toBe(false);

    });
  });

  describe('diagnostic data format - platform-dependent', () => {
    // These tests verify format/structure but rely on platform APIs
    // (TextDecoder, Array.from, string operations)
    // We test the contract, not the platform implementation

    it('should return hex string format for firstBytes', async () => {
      const data = new Uint8Array([0x50, 0x4b, 0x03, 0x04]);
      const file = createMockFile('test.zip', data);
      const result = await introspectFile(file);

      // Format: space-separated hex pairs
      expect(result.firstBytes).toBe('50 4b 03 04');
    });

    it('should return string for rawDataPreview', async () => {
      const data = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]); // "Hello"
      const file = createMockFile('test.txt', data);
      const result = await introspectFile(file);

      // Returns a string (platform handles decoding)
      expect(typeof result.rawDataPreview).toBe('string');
    });
  });
});
