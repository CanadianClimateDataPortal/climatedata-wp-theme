/**
 * Tests for compute-nb-positions-impl.ts.
 */

import { describe, expect, it } from 'vitest';
import { computeNbPositionsImpl } from './compute-nb-positions-impl';
import { Feature, Polygon, MultiPolygon } from 'geojson';

describe('computeNbPositionsImpl', () => {
	it('returns the correct number of positions for a single level polygon', () => {
		const feature = {
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
		} as Feature<Polygon>;
		const result = computeNbPositionsImpl(feature);
		expect(result).toBe(5);
	});

	it('returns the correct number of positions for a multilevel polygon', () => {
		const feature = {
			type: 'Feature',
			geometry: {
				type: 'Polygon',
				coordinates: [
					[
						[-75.8, 45.2],
						[-73.5, 45.2],
						[[-75.8, 46.1], [-75.8, 45.2]],
					],
				],
			},
			properties: {},
		} as Feature<Polygon>;
		const result = computeNbPositionsImpl(feature);
		expect(result).toBe(4);
	});

	it('returns the correct number of positions for a multi-polygon', () => {
		const feature = {
			type: 'Feature',
			geometry: {
				type: 'MultiPolygon',
				coordinates: [
					[
						[-75.8, 45.2],
						[-73.5, 45.2],
					],
					[
						[-73.5, 46.1],
						[-75.8, 46.1],
						[[-75.8, 46.1], [-75.8, 45.2]],
					]
				],
			},
			properties: {},
		} as Feature<MultiPolygon>;
		const result = computeNbPositionsImpl(feature);
		expect(result).toBe(6);
	});
});
