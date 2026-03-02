/**
 * Tests for compute-area-impl.ts.
 *
 * Focus: Verify geodesic area computation returns values in km²,
 * is positive for real polygons, and returns 0 for degenerate inputs.
 */

import { describe, it, expect } from 'vitest';

import type { Feature, Polygon } from 'geojson';

import { computeAreaKm2Impl } from './compute-area-impl';
import {
	EXAMPLE_DISPLAYABLE_SHAPE,
	EXAMPLE_GEOMETRY_SHAPE_REALLY_BIG,
} from './contracts.examples';

describe('computeAreaKm2Impl', () => {
	describe('valid polygon', () => {
		it('returns a positive number for the Ottawa region polygon', () => {
			const result = computeAreaKm2Impl(EXAMPLE_DISPLAYABLE_SHAPE.feature);

			expect(result).toBeGreaterThan(0);
		});

		it('returns area in square kilometers, not square meters', () => {
			const result = computeAreaKm2Impl(EXAMPLE_DISPLAYABLE_SHAPE.feature);

			// Ottawa polygon is ~5000 km² — sanity bounds rule out raw m² (would be ~5e9)
			expect(result).toBeGreaterThan(100);
			expect(result).toBeLessThan(50_000);
		});
	});

	describe('really large polygon', () => {
		it('returns area exceeding the max constraint for Le Grand Nord du Quebec', () => {
			const result = computeAreaKm2Impl(EXAMPLE_GEOMETRY_SHAPE_REALLY_BIG.feature);

			expect(result).toBeGreaterThan(500_000);
		});
	});

	describe('degenerate polygon', () => {
		it('returns 0 for a polygon where all points are identical', () => {
			const degenerate: Feature<Polygon> = {
				type: 'Feature',
				geometry: {
					type: 'Polygon',
					coordinates: [
						[
							[-75.0, 45.0],
							[-75.0, 45.0],
							[-75.0, 45.0],
							[-75.0, 45.0],
						],
					],
				},
				properties: {},
			};

			const result = computeAreaKm2Impl(degenerate);

			expect(result).toBe(0);
		});
	});
});
