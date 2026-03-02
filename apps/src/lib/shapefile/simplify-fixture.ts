/**
 * @file
 *
 * Gross polygon simplification for test fixture generation.
 *
 * Takes a DisplayableShape with a complex polygon (thousands of vertices)
 * and produces a lightweight version suitable for inline test fixtures.
 *
 * Uses nth-point decimation + aggressive coordinate truncation.
 * No additional dependencies — only @turf/truncate (already installed).
 *
 * Usage:
 *   import { simplifyFixture } from './simplify-fixture';
 *   const lite = simplifyFixture(hugeShape);
 *   console.log(JSON.stringify(lite, null, '\t'));
 */

import type { Feature, Polygon, Position } from 'geojson';
import truncate from '@turf/truncate';

import type { DisplayableShape } from './contracts';
import { computeAreaKm2Impl } from './compute-area-impl';

/**
 * Decimate a coordinate ring by keeping every Nth point.
 * Always preserves the first and last point (ring closure).
 */
const decimateRing = (
	ring: Position[],
	keepEvery: number,
): Position[] => {
	if (ring.length <= 4) return ring;

	const sampled: Position[] = [];
	// Skip last point (closing vertex) — we'll re-add it
	const open = ring.slice(0, -1);

	for (let i = 0; i < open.length; i += keepEvery) {
		sampled.push(open[i]);
	}

	// Ensure at least 3 distinct points for a valid polygon ring
	if (sampled.length < 3) {
		const mid = Math.floor(open.length / 2);
		sampled.length = 0;
		sampled.push(open[0], open[mid], open[open.length - 1]);
	}

	// Close the ring
	sampled.push(sampled[0]);

	return sampled;
};

/**
 * Simplify a DisplayableShape for use as an inline test fixture.
 *
 * @param shape - The full-resolution DisplayableShape
 * @param keepEvery - Keep every Nth coordinate (default: 10)
 * @param precision - Decimal places to keep (default: 2, ~1.1 km)
 * @returns A new DisplayableShape with fewer coordinates
 */
export const simplifyFixture = (
	shape: Omit<DisplayableShape, 'areaKm2'>,
	keepEvery = 10,
	precision = 2,
): DisplayableShape => {
	const polygon = shape.feature.geometry;

	// Decimate each ring (outer boundary + any holes)
	const decimatedCoords = polygon.coordinates.map(
		(ring) => decimateRing(ring, keepEvery),
	);

	const decimatedFeature: Feature<Polygon> = {
		type: 'Feature',
		properties: shape.feature.properties,
		geometry: {
			type: 'Polygon',
			coordinates: decimatedCoords,
		},
	};

	// Truncate coordinate precision
	const truncated = truncate(decimatedFeature, {
		precision,
		coordinates: 2,
		mutate: false,
	}) as Feature<Polygon>;

	return {
		id: shape.id,
		feature: truncated,
		areaKm2: computeAreaKm2Impl(truncated), // area is not relevant for fixtures
	};
};
