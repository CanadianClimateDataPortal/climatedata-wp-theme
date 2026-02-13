import { describe, expect, it, vi } from 'vitest';

import type { Mock } from 'vitest';

import { simplifyShapefile } from './simplify-shapefile';
import { EXAMPLE_VALIDATED_SHAPEFILE } from './contracts.examples';

// Mock mapshaper module
vi.mock('mapshaper');

import mapshaper from 'mapshaper';

const mockApplyCommands = mapshaper.applyCommands as Mock;

describe('simplifyShapefile', () => {
	describe('happy path', () => {
		it('returns SimplifiedGeometry with valid GeoJSON', async () => {
			const mockGeoJSON = {
				type: 'FeatureCollection',
				features: [
					{
						type: 'Feature',
						geometry: {
							type: 'Polygon',
							coordinates: [
								[
									[-75.8, 45.2],
									[-73.5, 45.2],
									[-73.5, 46.1],
									[-75.8, 46.1],
									[-75.8, 45.2],
								],
							],
						},
						properties: {},
					},
				],
			};

			mockApplyCommands.mockResolvedValueOnce({
				'output.geojson': JSON.stringify(mockGeoJSON),
			});

			const result = await simplifyShapefile(EXAMPLE_VALIDATED_SHAPEFILE);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.featureCollection).toEqual(mockGeoJSON);
				expect(result.value.featureCount).toBe(1);
			}
		});

		it('returns correct feature count for multiple features', async () => {
			const mockGeoJSON = {
				type: 'FeatureCollection',
				features: [
					{
						type: 'Feature',
						geometry: {
							type: 'Polygon',
							coordinates: [
								[
									[0, 0],
									[1, 0],
									[1, 1],
									[0, 1],
									[0, 0],
								],
							],
						},
						properties: {},
					},
					{
						type: 'Feature',
						geometry: {
							type: 'Polygon',
							coordinates: [
								[
									[2, 2],
									[3, 2],
									[3, 3],
									[2, 3],
									[2, 2],
								],
							],
						},
						properties: {},
					},
					{
						type: 'Feature',
						geometry: {
							type: 'Polygon',
							coordinates: [
								[
									[4, 4],
									[5, 4],
									[5, 5],
									[4, 5],
									[4, 4],
								],
							],
						},
						properties: {},
					},
				],
			};

			mockApplyCommands.mockResolvedValueOnce({
				'output.geojson': JSON.stringify(mockGeoJSON),
			});

			const result = await simplifyShapefile(EXAMPLE_VALIDATED_SHAPEFILE);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.featureCount).toBe(3);
			}
		});

		it('handles empty features array', async () => {
			const mockGeoJSON = {
				type: 'FeatureCollection',
				features: [],
			};

			mockApplyCommands.mockResolvedValueOnce({
				'output.geojson': JSON.stringify(mockGeoJSON),
			});

			const result = await simplifyShapefile(EXAMPLE_VALIDATED_SHAPEFILE);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.featureCount).toBe(0);
			}
		});
	});

	describe('error cases', () => {
		it('returns ProcessingError when mapshaper throws', async () => {
			mockApplyCommands.mockRejectedValueOnce(
				new Error('Mapshaper internal error'),
			);

			const result = await simplifyShapefile(EXAMPLE_VALIDATED_SHAPEFILE);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.name).toBe('ProcessingError');
				expect(result.error.message).toContain('Mapshaper simplification failed');
				expect(result.error.message).toContain('Mapshaper internal error');
			}
		});

		it('returns ProcessingError when no output file key', async () => {
			mockApplyCommands.mockResolvedValueOnce({
				'some-other-file.json': '{}',
			});

			const result = await simplifyShapefile(EXAMPLE_VALIDATED_SHAPEFILE);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.name).toBe('ProcessingError');
				expect(result.error.message).toContain('no GeoJSON output');
				expect(result.error.message).toContain('output.geojson');
			}
		});

		it('returns ProcessingError when output is not a string', async () => {
			mockApplyCommands.mockResolvedValueOnce({
				'output.geojson': null,
			});

			const result = await simplifyShapefile(EXAMPLE_VALIDATED_SHAPEFILE);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.name).toBe('ProcessingError');
				expect(result.error.message).toContain('no GeoJSON output');
			}
		});

		it('returns ProcessingError when output is invalid JSON', async () => {
			mockApplyCommands.mockResolvedValueOnce({
				'output.geojson': 'not valid JSON{{{',
			});

			const result = await simplifyShapefile(EXAMPLE_VALIDATED_SHAPEFILE);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.name).toBe('ProcessingError');
				expect(result.error.message).toContain('Failed to parse');
				expect(result.error.message).toContain('GeoJSON output');
			}
		});
	});
});
