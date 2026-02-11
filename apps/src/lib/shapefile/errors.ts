import { AbstractError, type WithErrorCode } from '@/lib/errors';
import { type GeometryType } from './contracts';

// ============================================================================
// ERROR CODES
// ============================================================================

/**
 * All possible error codes for shapefile processing.
 *
 * Naming convention: `phase/error-type`
 * - phase: extraction, validation, area, processing
 * - error-type: kebab-case description
 */
export const VALUES_SHAPEFILE_ERROR_CODES = [
	// Extraction phase
	'extraction/not-a-zip',
	'extraction/empty-file',
	'extraction/missing-shp',
	'extraction/missing-prj',
	'extraction/zip-parse-failed',
	// Validation phase
	'validation/invalid-geometry-type',
	// Area validation phase
	'area/too-large',
	'area/too-small',
	// Processing phase
	'processing/failed',
	'processing/projection-unsupported',
] as const;

/**
 * Discriminated union of all shapefile error codes.
 */
export type ShapefileErrorCode = (typeof VALUES_SHAPEFILE_ERROR_CODES)[number];

/**
 * Generic shapefile error with typed error code.
 *
 * Use this for new errors. The `code` property enables:
 * - Discriminated union handling in catch blocks
 * - Direct mapping to i18n keys in UI layer
 *
 * @example
 * ```typescript
 * // Throwing
 * throw new ShapefileError(
 *   'File does not have ZIP magic bytes (expected: 50 4B 03 04)',
 *   { code: 'extraction/not-a-zip' }
 * );
 *
 * // Catching
 * catch (error) {
 *   if (error instanceof ShapefileError) {
 *     switch (error.code) {
 *       case 'extraction/not-a-zip':
 *         // Handle specific error
 *     }
 *   }
 * }
 * ```
 */
export class ShapefileError
	extends AbstractError
	implements WithErrorCode<ShapefileErrorCode>
{
	readonly code: ShapefileErrorCode;

	constructor(
		message: string,
		options?: ErrorOptions & { code: ShapefileErrorCode },
	) {
		super(message, options);
		if (!options?.code) {
			throw new Error('ShapefileError requires a code', { cause: this });
		}
		this.code = options.code;
		this.name = 'ShapefileError';
	}
}

// ============================================================================
// VALIDATION ERRORS
// ============================================================================

/**
 * Error: Invalid geometry type (not polygon).
 *
 * Thrown during validation when shapefile geometry is not Polygon.
 * The error code is always `'validation/invalid-geometry-type'`.
 *
 * @param geometryType - The actual geometry type found (e.g. 'Point', 'Polyline')
 * @param options - Standard `ErrorOptions` (e.g. `{ cause }`)
 *
 * @example
 * ```typescript
 * const err = new InvalidGeometryTypeError('Point');
 * err.code;          // 'validation/invalid-geometry-type'
 * err.geometryType;  // 'Point'
 * ```
 *
 * @see {@link ./contracts.ts} for `GeometryType` definition
 */
export class InvalidGeometryTypeError extends ShapefileError {
	constructor(
		public readonly geometryType: GeometryType,
		options?: ErrorOptions,
	) {
		super(
			`Invalid geometry type: ${geometryType}. Only polygons are supported.`,
			{
				...options,
				code: 'validation/invalid-geometry-type',
			}
		);
		// Explicit name - survives minification
		this.name = 'InvalidGeometryTypeError';
	}
}

/**
 * Error: Area exceeds maximum limit.
 *
 * Thrown during area validation (CLIM-1270, U13).
 *
 * @remarks
 * TODO (CLIM-1270): We will not use this error as-is, we do not want to
 * change the contract of errors and this is not the same constructor
 * signature as typical errors. Migrate to standard `(message, options?)`
 * pattern. Use `DEFAULT_AREA_CONSTRAINTS` field names (`minKm2`, `maxKm2`)
 * for consistency with the constraint config.
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
 *
 * @remarks
 * TODO (CLIM-1270): Migrate to standard constructor signature
 * `(message: string, options?: ErrorOptions)` like other ShapefileError
 * subclasses. Current signature uses domain-specific positional args
 * (`areaKm2`, `minKm2`) which diverges from the established pattern.
 * Use `DEFAULT_AREA_CONSTRAINTS` field names (`minKm2`, `maxKm2`)
 * for consistency with the constraint config.
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
 * Generic error for transformation failures.
 * The error code is always `'processing/failed'`.
 *
 * @param message - Descriptive message including diagnostic details
 * @param options - Standard `ErrorOptions` (e.g. `{ cause }`)
 *
 * @example
 * ```typescript
 * const err = new ProcessingError('Validation step failed: timeout');
 * err.code;  // 'processing/failed'
 * ```
 */
export class ProcessingError extends ShapefileError {
	constructor(
		message: string,
		options?: ErrorOptions,
	) {
		super(
			message,
			{ ...options, code: 'processing/failed', }
		);
		// Explicit name - survives minification
		this.name = 'ProcessingError';
	}
}

/**
 * Error: Projection not supported.
 *
 * Thrown if shapefile uses non-WGS84 projection that cannot be converted.
 * The error code is always `'processing/projection-unsupported'`.
 *
 * @param projection - The unsupported projection string found in the .prj file
 * @param options - Standard `ErrorOptions` (e.g. `{ cause }`)
 *
 * @example
 * ```typescript
 * const err = new ProjectionError('NAD83');
 * err.code;        // 'processing/projection-unsupported'
 * err.projection;  // 'NAD83'
 * ```
 */
export class ProjectionError extends ShapefileError {
	constructor(
		public readonly projection: string,
		options?: ErrorOptions,
	) {
		super(
			`Unsupported projection: ${projection}. Only WGS84 is supported.`,
			{ ...options, code: 'processing/projection-unsupported', }
		);
		// Explicit name - survives minification
		this.name = 'ProjectionError';
	}
}
