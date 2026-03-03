/**
 * Tests for validate-selected-shapes-impl.
 *
 * Covers: validateSelectedShapesImpl (area sum, number positions, boundary,
 * multi-shape), throwAreaLimitError (code, message content).
 */

import { describe, it, expect } from 'vitest';

import {
	validateSelectedShapesImpl,
	throwAreaLimitError,
} from './validate-selected-shapes-impl';
import {
	EXAMPLE_DISPLAYABLE_SHAPE,
	EXAMPLE_SHAPES_CONSTRAINTS_TIGHT,
} from './contracts.examples';
import type { DisplayableShape } from './contracts';
import { ShapefileError } from './errors';

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

const makeShape = (areaKm2: number, nbPositions: number): DisplayableShape => ({
	...EXAMPLE_DISPLAYABLE_SHAPE,
	id: `test-shape-${areaKm2}`,
	areaKm2,
	nbPositions,
});

// ---------------------------------------------------------------------------
// validateSelectedShapesImpl
// ---------------------------------------------------------------------------

describe('validateSelectedShapesImpl', () => {
	it('returns branded ValidatedShapes for valid shapes', () => {
		// EXAMPLE_DISPLAYABLE_SHAPE has areaKm2: 5000
		// EXAMPLE_SHAPES_CONSTRAINTS_TIGHT: min 1000, max 10 000
		const result = validateSelectedShapesImpl(
			[EXAMPLE_DISPLAYABLE_SHAPE],
			EXAMPLE_SHAPES_CONSTRAINTS_TIGHT,
		);

		expect(result).toBe(result); // same reference
		expect(Array.isArray(result)).toBe(true);
		expect(result[0]).toBe(EXAMPLE_DISPLAYABLE_SHAPE);
	});

	it('throws ShapefileError with code selection/area-too-small when area is below minimum', () => {
		const shapes = [makeShape(500, 5)]; // 500 < min 1000

		let thrownError: unknown;
		try {
			validateSelectedShapesImpl(shapes, EXAMPLE_SHAPES_CONSTRAINTS_TIGHT);
		} catch (error) {
			thrownError = error;
		}

		expect(thrownError).toBeInstanceOf(ShapefileError);
		expect((thrownError as ShapefileError).code).toBe('selection/area-too-small');
	});

	it('throws ShapefileError with code selection/area-too-large when area exceeds maximum', () => {
		const shapes = [makeShape(15_000, 5)]; // 15 000 > max 10 000

		let thrownError: unknown;
		try {
			validateSelectedShapesImpl(shapes, EXAMPLE_SHAPES_CONSTRAINTS_TIGHT);
		} catch (error) {
			thrownError = error;
		}

		expect(thrownError).toBeInstanceOf(ShapefileError);
		expect((thrownError as ShapefileError).code).toBe('selection/area-too-large');
	});

	it('throws ShapefileError with code selection/too-many-positions when positions exceed maximum', () => {
		const shapes = [makeShape(5000, 15)]; // 15 > max 10

		let thrownError: unknown;
		try {
			validateSelectedShapesImpl(shapes, EXAMPLE_SHAPES_CONSTRAINTS_TIGHT);
		} catch (error) {
			thrownError = error;
		}

		expect(thrownError).toBeInstanceOf(ShapefileError);
		expect((thrownError as ShapefileError).code).toBe('selection/too-many-positions');
	});

	it('passes when sum of multiple shapes falls within constraints', () => {
		// areaKm2: 3000 + 3000 = 6000, within [1000, 10 000]
		// nbPositions: 3 + 4 = 7, lower than 10
		const shapes = [makeShape(3000, 3), makeShape(3000, 4)];

		expect(() =>
			validateSelectedShapesImpl(shapes, EXAMPLE_SHAPES_CONSTRAINTS_TIGHT),
		).not.toThrow();
	});

	it('passes when area is exactly at the minimum boundary', () => {
		const shapes = [makeShape(1000, 5)]; // exactly 1000 === min

		expect(() =>
			validateSelectedShapesImpl(shapes, EXAMPLE_SHAPES_CONSTRAINTS_TIGHT),
		).not.toThrow();
	});

	it('passes when area is exactly at the maximum boundary', () => {
		const shapes = [makeShape(10_000, 5)]; // exactly 10 000 === max

		expect(() =>
			validateSelectedShapesImpl(shapes, EXAMPLE_SHAPES_CONSTRAINTS_TIGHT),
		).not.toThrow();
	});

	it('passes when nbPositions is exactly at the boundary', () => {
		const shapes = [makeShape(5000, 10)]; // exactly 10 === max

		expect(() =>
			validateSelectedShapesImpl(shapes, EXAMPLE_SHAPES_CONSTRAINTS_TIGHT),
		).not.toThrow();
	});
});

// ---------------------------------------------------------------------------
// throwAreaLimitError
// ---------------------------------------------------------------------------

describe('throwAreaLimitError', () => {
	it('throws ShapefileError with code selection/area-too-large when area exceeds max', () => {
		let thrownError: unknown;
		try {
			throwAreaLimitError(15_000, EXAMPLE_SHAPES_CONSTRAINTS_TIGHT);
		} catch (error) {
			thrownError = error;
		}

		expect(thrownError).toBeInstanceOf(ShapefileError);
		expect((thrownError as ShapefileError).code).toBe('selection/area-too-large');
	});

	it('throws ShapefileError with code selection/area-too-small when area is below min', () => {
		let thrownError: unknown;
		try {
			throwAreaLimitError(500, EXAMPLE_SHAPES_CONSTRAINTS_TIGHT);
		} catch (error) {
			thrownError = error;
		}

		expect(thrownError).toBeInstanceOf(ShapefileError);
		expect((thrownError as ShapefileError).code).toBe('selection/area-too-small');
	});

	it('includes area value and limit value in the error message', () => {
		let thrownError: unknown;
		try {
			throwAreaLimitError(15_000, EXAMPLE_SHAPES_CONSTRAINTS_TIGHT);
		} catch (error) {
			thrownError = error;
		}

		const message = (thrownError as ShapefileError).message;
		// Area formatted with .toFixed(1): "15000.0"
		expect(message).toContain('15000.0');
		// Limit (maxKm2 10000) formatted with .toFixed(0): "10000"
		expect(message).toContain('10000');
	});
});
