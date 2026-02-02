import { AbstractError } from '@/lib/errors';
import type { GeometryType } from '@/lib/shapefile/contracts';


// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Error: Invalid geometry type (not polygon).
 *
 * Thrown during validation (CLIM-1266).
 */
export class InvalidGeometryTypeError extends AbstractError {
	constructor(
		public readonly geometryType: GeometryType,
		options?: ErrorOptions,
	) {
		super(
			`Invalid geometry type: ${geometryType}. Only polygons are supported.`,
			options,
		);
		// Explicit name - survives minification
		this.name = 'InvalidGeometryTypeError';
	}
}

/**
 * Error: Area exceeds maximum limit.
 *
 * Thrown during area validation (CLIM-1270, U13).
 */
export class AreaExceedsLimitError extends AbstractError {
	constructor(
		public readonly areaKm2: number,
		public readonly maxKm2: number,
		options?: ErrorOptions,
	) {
		super(
			`Region area (${areaKm2.toFixed(1)} km²) exceeds maximum (${maxKm2.toFixed(0)} km²)`,
			options,
		);
		// Explicit name - survives minification
		this.name = 'AreaExceedsLimitError';
	}
}

/**
 * Error: Area below minimum limit.
 *
 * Thrown during area validation (CLIM-1270, U14).
 */
export class AreaBelowLimitError extends AbstractError {
	constructor(
		public readonly areaKm2: number,
		public readonly minKm2: number,
		options?: ErrorOptions,
	) {
		super(
			`Region area (${areaKm2.toFixed(1)} km²) is below minimum (${minKm2.toFixed(0)} km²)`,
			options,
		);
		// Explicit name - survives minification
		this.name = 'AreaBelowLimitError';
	}
}

/**
 * Error: Shapefile processing failed.
 *
 * Generic error for Mapshaper or transformation failures.
 */
export class ProcessingError extends AbstractError {
	constructor(message: string, options?: ErrorOptions) {
		super(message, options);
		// Explicit name - survives minification
		this.name = 'ProcessingError';
	}
}

/**
 * Error: Projection not supported.
 *
 * Thrown if shapefile uses non-WGS84 projection that cannot be converted.
 */
export class ProjectionError extends AbstractError {
	constructor(
		public readonly projection: string,
		options?: ErrorOptions,
	) {
		super(
			`Unsupported projection: ${projection}. Only WGS84 is supported.`,
			options,
		);
		// Explicit name - survives minification
		this.name = 'ProjectionError';
	}
}
