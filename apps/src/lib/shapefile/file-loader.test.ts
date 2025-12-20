/**
 * Tests for shapefile file loading and extraction.
 *
 * @module lib/shapefile/file-loader.test
 */

import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import {
  loadShapeFile,
  ShapefileLoadError,
} from './file-loader';

/**
 * Create a mock File object for testing
 */
const createMockFile = (
  name: string,
  content: ArrayBuffer | string,
  type = 'application/zip',
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
 * Create a valid ZIP file containing .shp and .prj files
 */
const createValidShapefileZip = async (): Promise<File> => {
  const zip = new JSZip();

  // Mock binary .shp file
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

describe('loadShapeFile', () => {
  describe('happy path', () => {
    it('should extract .shp and .prj files from valid ZIP', async () => {
      const file = await createValidShapefileZip();
      const result = await loadShapeFile(file);

      expect(result).toHaveProperty('file.shp');
      expect(result).toHaveProperty('file.prj');
      expect(result['file.shp']).toBeInstanceOf(ArrayBuffer);
      expect(typeof result['file.prj']).toBe('string');
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

      const result = await loadShapeFile(file);

      // Should only have .shp and .prj
      expect(Object.keys(result)).toHaveLength(2);
      expect(result).toHaveProperty('file.shp');
      expect(result).toHaveProperty('file.prj');
    });
  });

  describe('error cases', () => {
    it('should reject non-ZIP files', async () => {
      const file = createMockFile(
        'test.txt',
        'not a zip',
        'text/plain',
      );

      await expect(loadShapeFile(file))
        .rejects
        .toThrow(ShapefileLoadError);

      await expect(loadShapeFile(file))
        .rejects
        .toThrow('must be a ZIP file');
    });

    it('should reject ZIP without .shp file', async () => {
      const zip = new JSZip();
      zip.file('test.prj', 'GEOGCS["WGS 84"]');
      zip.file('readme.txt', 'data');

      const zipBlob = await zip.generateAsync({ type: 'arraybuffer' });
      const file = createMockFile('test.zip', zipBlob);

      await expect(loadShapeFile(file))
        .rejects
        .toThrow(ShapefileLoadError);

      await expect(loadShapeFile(file))
        .rejects
        .toThrow('must contain both .shp and .prj');
    });

    it('should reject ZIP without .prj file', async () => {
      const zip = new JSZip();
      zip.file('test.shp', new Uint8Array([0x00]));
      zip.file('readme.txt', 'data');

      const zipBlob = await zip.generateAsync({ type: 'arraybuffer' });
      const file = createMockFile('test.zip', zipBlob);

      await expect(loadShapeFile(file))
        .rejects
        .toThrow(ShapefileLoadError);

      await expect(loadShapeFile(file))
        .rejects
        .toThrow('must contain both .shp and .prj');
    });

    it('should reject empty ZIP', async () => {
      const zip = new JSZip();
      const zipBlob = await zip.generateAsync({ type: 'arraybuffer' });
      const file = createMockFile('empty.zip', zipBlob);

      await expect(loadShapeFile(file))
        .rejects
        .toThrow(ShapefileLoadError);

      await expect(loadShapeFile(file))
        .rejects
        .toThrow('does not contain a valid shapefile');
    });

    it('should reject invalid ZIP data', async () => {
      const file = createMockFile(
        'corrupt.zip',
        'not valid zip data',
      );

      await expect(loadShapeFile(file))
        .rejects
        .toThrow(ShapefileLoadError);

      await expect(loadShapeFile(file))
        .rejects
        .toThrow('Failed to read ZIP file');
    });
  });

  describe('ShapefileLoadError', () => {
    it('should have correct name for debugging', () => {
      const error = new ShapefileLoadError('test error');
      expect(error.name).toBe('ShapefileLoadError');
      expect(error.message).toBe('test error');
    });

    it('should support error chaining', () => {
      const cause = new Error('underlying error');
      const error = new ShapefileLoadError(
        'wrapper error',
        { cause },
      );

      expect(error.cause).toBe(cause);
    });
  });
});
