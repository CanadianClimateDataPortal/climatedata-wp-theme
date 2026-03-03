/**
 * @file
 *
 * Selected-shapes validation — implementation (reusable outside state machine).
 *
 * Convention: `-impl.ts` pattern
 *
 * This file contains the actual validation logic, separated from the
 * state machine service wrapper (validate-selected-shapes.ts). It throws
 * typed errors on failure instead of returning Result<T, E>, making it
 * usable in any context — not just the XState pipeline.
 *
 * @see {@link ./validate-selected-shapes.ts} for the state machine wrapper
 * @see {@link ./contracts.ts} for ShapesConstraints and ValidatedShapes
 */

import type {
	ShapesConstraints,
	DisplayableShape,
	ValidatedShapes,
} from './contracts';
import {
	ShapefileError,
	ShapefileErrorCode,
} from './errors';

/**
 * Throw a typed ShapefileError for an area constraint violation.
 *
 * Determines whether the area is too large or too small and throws
 * the appropriate ShapefileError with a human-readable message.
 *
 * @param areaKm2 - The total selected area in km²
 * @param constraints - The min/max area constraints to validate against
 * @param options - Optional ErrorOptions (e.g. { cause })
 *
 * @throws {ShapefileError} always — this function never returns
 */
export const throwAreaLimitError = (
	areaKm2: number,
	constraints: ShapesConstraints,
	options?: ErrorOptions,
): never => {
	const isOver = areaKm2 > constraints.maxKm2;
	const code: ShapefileErrorCode = isOver
		? 'selection/area-too-large'
		: 'selection/area-too-small';
	const limit = isOver
		? constraints.maxKm2
		: constraints.minKm2;
	const verb = isOver
		? 'exceeds maximum'
		: 'is below minimum';
	throw new ShapefileError(
		`Area (${areaKm2.toFixed(1)} km²) ${verb} (${limit.toFixed(0)} km²)`,
		{ ...options, code },
	);
};

/**
 * Validate that the total selected area falls within the allowed range.
 *
 * Sums `areaKm2` across all provided shapes, then checks the total
 * against the configured constraints. Brands the array as ValidatedShapes
 * on success, encoding area validity in the type system.
 *
 * @throws {ShapefileError} when the total area is outside the allowed range
 *
 * @param shapes - Array of DisplayableShape objects to validate
 * @param constraints - Min/max area constraints to validate against
 * @returns Branded ValidatedShapes array on success
 */
export const validateSelectedShapesImpl = (
	shapes: DisplayableShape[],
	constraints: ShapesConstraints,
): ValidatedShapes => {
	const totalArea = shapes.reduce(
		(sum, shape) => sum + shape.areaKm2,
		0,
	);

	if (totalArea < constraints.minKm2 || totalArea > constraints.maxKm2) {
		throwAreaLimitError(totalArea, constraints);
	}

	return shapes as unknown as ValidatedShapes;
};
