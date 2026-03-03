/**
 * Tests for prepareFinchPayloadImpl.
 *
 * Verifies that validated shapes are converted into a valid
 * FinchShapeParameter (GeoJSON FeatureCollection) for the Finch API.
 */

import { describe, it, expect } from 'vitest';

import { prepareFinchPayloadImpl } from './prepare-finch-payload-impl';
import {
	EXAMPLE_VALIDATED_SHAPES,
	EXAMPLE_DISPLAYABLE_SHAPE,
	EXAMPLE_FINCH_PAYLOAD,
} from './contracts.examples';
import type { ValidatedShapes } from './contracts';

describe('prepareFinchPayloadImpl', () => {
	it('returns a FeatureCollection with type FeatureCollection', () => {
		const result = prepareFinchPayloadImpl(EXAMPLE_VALIDATED_SHAPES);

		expect(result.type).toBe('FeatureCollection');
	});

	it('extracts features from shapes', () => {
		const result = prepareFinchPayloadImpl(EXAMPLE_VALIDATED_SHAPES);

		expect(result.features).toHaveLength(1);
		expect(result.features[0]).toEqual(EXAMPLE_DISPLAYABLE_SHAPE.feature);
	});

	it('matches expected payload structure', () => {
		const result = prepareFinchPayloadImpl(EXAMPLE_VALIDATED_SHAPES);

		expect(result).toEqual(EXAMPLE_FINCH_PAYLOAD);
	});

	it('handles multiple shapes', () => {
		const secondShape = {
			...EXAMPLE_DISPLAYABLE_SHAPE,
			id: 'shape-2',
		};
		const twoShapes = Object.assign(
			[EXAMPLE_DISPLAYABLE_SHAPE, secondShape],
			{ __areaValidated: Symbol('areaValidated') },
		) as unknown as ValidatedShapes;

		const result = prepareFinchPayloadImpl(twoShapes);

		expect(result.features).toHaveLength(2);
	});
});
