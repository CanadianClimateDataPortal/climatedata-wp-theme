/**
 * Tests for shapefile geometry validation.
 *
 * Mapshaper is mocked — we test our integration logic
 * (parsing, normalization, error handling), not mapshaper itself.
 */

import {
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from 'vitest';

import { validateShapefileGeometry } from './validate-geometry';
import { InvalidGeometryTypeError, ProcessingError } from './errors';
import { EXAMPLE_EXTRACTED_SHAPEFILE } from './contracts.examples';

// Mock mapshaper module
vi.mock('mapshaper', () => ({
	default: {
		applyCommands: vi.fn(),
	},
}));

/**
 * Helper: build a mapshaper info.json response for a given geometry type.
 */
const createInfoResponse = (
	geometryType: string,
	featureCount = 3,
): Record<string, string> => ({
	'info.json': JSON.stringify([
		{
			layer_name: 'file',
			geometry_type: geometryType,
			feature_count: featureCount,
		},
	]),
});

/**
 * Get the mocked applyCommands function.
 * Must be called after vi.mock has run.
 */
const getMockApplyCommands = async () => {
	const mapshaper = await import('mapshaper');
	return vi.mocked(mapshaper.default.applyCommands);
};

describe('validateShapefileGeometry', () => {
	let mockApplyCommands: ReturnType<typeof vi.fn>;

	beforeEach(async () => {
		mockApplyCommands = await getMockApplyCommands();
		mockApplyCommands.mockReset();
	});

	describe('successful validation', () => {
		it('should return ValidatedShapefile when geometry is polygon', async () => {
			// Mapshaper returns lowercase 'polygon'
			mockApplyCommands.mockResolvedValue(
				createInfoResponse('polygon'),
			);

			const result = await validateShapefileGeometry(
				EXAMPLE_EXTRACTED_SHAPEFILE,
			);

			expect(result.ok).toBe(true);
			if (result.ok) {
				// ValidatedShapefile has same data as ExtractedShapefile
				expect(result.value).toHaveProperty('file.shp');
				expect(result.value).toHaveProperty('file.prj');
			}
		});

		it('should pass .shp and .prj to mapshaper applyCommands', async () => {
			mockApplyCommands.mockResolvedValue(
				createInfoResponse('polygon'),
			);

			await validateShapefileGeometry(EXAMPLE_EXTRACTED_SHAPEFILE);

			expect(mockApplyCommands).toHaveBeenCalledOnce();
			expect(mockApplyCommands).toHaveBeenCalledWith(
				'file.shp -info save-to=info',
				{
					'file.shp': EXAMPLE_EXTRACTED_SHAPEFILE['file.shp'],
					'file.prj': EXAMPLE_EXTRACTED_SHAPEFILE['file.prj'],
				},
			);
		});
	});

	describe('error: invalid geometry type', () => {
		it('should return InvalidGeometryTypeError for point geometry', async () => {
			mockApplyCommands.mockResolvedValue(
				createInfoResponse('point'),
			);

			const result = await validateShapefileGeometry(
				EXAMPLE_EXTRACTED_SHAPEFILE,
			);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toBeInstanceOf(InvalidGeometryTypeError);
				if (result.error instanceof InvalidGeometryTypeError) {
					expect(result.error.geometryType).toBe('Point');
				}
			}
		});

		it('should return InvalidGeometryTypeError for polyline geometry', async () => {
			mockApplyCommands.mockResolvedValue(
				createInfoResponse('polyline'),
			);

			const result = await validateShapefileGeometry(
				EXAMPLE_EXTRACTED_SHAPEFILE,
			);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toBeInstanceOf(InvalidGeometryTypeError);
				if (result.error instanceof InvalidGeometryTypeError) {
					expect(result.error.geometryType).toBe('Polyline');
				}
			}
		});

		it('should include geometry type in error message', async () => {
			mockApplyCommands.mockResolvedValue(
				createInfoResponse('multipoint'),
			);

			const result = await validateShapefileGeometry(
				EXAMPLE_EXTRACTED_SHAPEFILE,
			);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toBeInstanceOf(InvalidGeometryTypeError);
				expect(result.error.message).toContain('Multipoint');
			}
		});
	});

	describe('error: processing failure', () => {
		it('should return ProcessingError when mapshaper throws', async () => {
			mockApplyCommands.mockRejectedValue(
				new Error('mapshaper internal error'),
			);

			const result = await validateShapefileGeometry(
				EXAMPLE_EXTRACTED_SHAPEFILE,
			);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toBeInstanceOf(ProcessingError);
				expect(result.error.message).toContain('mapshaper internal error');
			}
		});

		it('should return ProcessingError when output has no info.json', async () => {
			mockApplyCommands.mockResolvedValue({});

			const result = await validateShapefileGeometry(
				EXAMPLE_EXTRACTED_SHAPEFILE,
			);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toBeInstanceOf(ProcessingError);
				expect(result.error.message).toContain('no info output');
			}
		});

		it('should return ProcessingError when JSON is malformed', async () => {
			mockApplyCommands.mockResolvedValue({
				'info.json': 'not valid json {{{',
			});

			const result = await validateShapefileGeometry(
				EXAMPLE_EXTRACTED_SHAPEFILE,
			);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toBeInstanceOf(ProcessingError);
				expect(result.error.message).toContain('parse');
			}
		});

		it('should return ProcessingError when layer data has no geometry_type', async () => {
			mockApplyCommands.mockResolvedValue({
				'info.json': JSON.stringify([
					{
						layer_name: 'file',
						geometry_type: null,
						feature_count: 0,
					},
				]),
			});

			const result = await validateShapefileGeometry(
				EXAMPLE_EXTRACTED_SHAPEFILE,
			);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toBeInstanceOf(ProcessingError);
				expect(result.error.message).toContain('geometry_type');
			}
		});
	});
});
