/**
 * @file Shapefile Pipeline — Example Fixtures and Type Documentation
 *
 * Typed constants for every pipeline layer defined in contracts.ts.
 * Serves as:
 * - Compile-time type validation ("type tests")
 * - Shared fixtures for vitest and Ladle stories
 * - Living documentation of data shapes at each stage
 * - Source for classdiagram-ts extension visualization
 *
 * @see {@link ./contracts.ts} — Data shape interfaces
 * @see {@link ./pipeline.ts} — Function type signatures
 * @see {@link ./result.ts} — Result<T, E>
 */

import type {
	ShapesConstraints,
	ShapesValidationResult,
	DisplayableShape,
	DisplayableShapes,
	ExtractedShapefile,
	FinchShapeParameter,
	SelectedShape,
	ShapefileInfo,
	SimplifiedGeometry,
	ValidatedShapes,
	ValidatedShapefile,
} from './contracts';
import { DEFAULT_SHAPES_CONSTRAINTS } from './contracts';

// ============================================================================
// LAYER 1: EXTRACTION
// ============================================================================

/**
 * Minimal extracted shapefile — single .shp/.prj pair with empty skippedEntries.
 *
 * In production, the ArrayBuffer contains real shapefile binary data.
 * Here we use an 8-byte stub — enough to satisfy the type.
 *
 * @see {@link ExtractedShapefile}
 */
export const EXAMPLE_EXTRACTED_SHAPEFILE: ExtractedShapefile = {
	pairs: [
		{
			shp: new ArrayBuffer(8),
			prj: 'GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137,298.257223563]],PRIMEM["Greenwich",0],UNIT["Degree",0.017453292519943295]]',
			basename: 'test',
		},
	],
	skippedEntries: [],
};

// ============================================================================
// LAYER 2: VALIDATION
// ============================================================================

/**
 * Shapefile metadata from validation inspection.
 *
 * Polygon geometry type — the only accepted type for ClimateData uploads.
 *
 * @see {@link ShapefileInfo}
 */
export const EXAMPLE_SHAPEFILE_INFO: ShapefileInfo = {
	geometry_type: 'Polygon',
	feature_count: 3,
	bbox: [-75.8, 45.2, -73.5, 46.1],
	projection: 'WGS84',
};

/**
 * Branded validated shapefile — proves geometry validation passed.
 *
 * Requires `as unknown as` cast because the branded `__validated` symbol
 * cannot be constructed outside the validation function.
 *
 * @see {@link ValidatedShapefile}
 */
export const EXAMPLE_VALIDATED_SHAPEFILE = {
	...EXAMPLE_EXTRACTED_SHAPEFILE,
	__validated: Symbol('validated'),
} as unknown as ValidatedShapefile;

// ============================================================================
// LAYER 3: TRANSFORMATION
// ============================================================================

/**
 * Simplified GeoJSON output.
 *
 * Minimal FeatureCollection with one polygon feature.
 * Production data would have real coordinates.
 *
 * @see {@link SimplifiedGeometry}
 */
export const EXAMPLE_SIMPLIFIED_GEOMETRY: SimplifiedGeometry = {
	featureCollection: {
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
	},
	featureCount: 1,
};

// ============================================================================
// LAYER 4: DISPLAY
// ============================================================================

/**
 * Single displayable polygon — Ottawa region approximation.
 *
 * Coordinates form a closed ring (first === last point) as required
 * by the GeoJSON spec. Area is ~5,000 km² — within default constraints.
 *
 * @see {@link DisplayableShape}
 */
export const EXAMPLE_DISPLAYABLE_SHAPE: DisplayableShape = {
	id: 'shape-1',
	feature: {
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
	areaKm2: 5000,
	nbPositions: 5,
};

/**
 * Collection of shapes ready for map display.
 *
 * Single polygon with bounds matching its extent.
 *
 * @see {@link DisplayableShapes}
 */
export const EXAMPLE_DISPLAYABLE_SHAPES: DisplayableShapes = {
	shapes: [EXAMPLE_DISPLAYABLE_SHAPE],
	bounds: [-75.8, 45.2, -73.5, 46.1],
	totalCount: 1,
};

// ============================================================================
// LAYER 5: SELECTION
// ============================================================================

/**
 * Lean selection record derived from the displayable shape.
 *
 * @see {@link SelectedShape}
 */
export const EXAMPLE_SELECTED_SHAPE: SelectedShape = {
	id: EXAMPLE_DISPLAYABLE_SHAPE.id,
	areaKm2: EXAMPLE_DISPLAYABLE_SHAPE.areaKm2,
};

// ============================================================================
// LAYER 6: SHAPES VALIDATION
// ============================================================================

/**
 * Default shapes constraints from requirements U13, U14.
 *
 * Re-exported from contracts.ts for convenience in tests and stories.
 *
 * @see {@link ShapesConstraints}
 * @see {@link DEFAULT_SHAPES_CONSTRAINTS}
 */
export const EXAMPLE_SHAPES_CONSTRAINTS: ShapesConstraints = {
	...DEFAULT_SHAPES_CONSTRAINTS,
};

/**
 * Custom shapes constraints for testing boundary conditions.
 *
 * Tighter range than defaults — useful for triggering too-small / too-large.
 *
 * @see {@link ShapesConstraints}
 */
export const EXAMPLE_SHAPES_CONSTRAINTS_TIGHT: ShapesConstraints = {
	minKm2: 1000,
	maxKm2: 10_000,
	maxPositions: 10,
};

/**
 * Shapes validation result — valid.
 *
 * @see {@link ShapesValidationResult}
 */
export const EXAMPLE_SHAPES_VALIDATION_VALID: ShapesValidationResult = {
	status: 'valid',
	areaKm2: 5000,
	nbPositions: 5,
	constraints: DEFAULT_SHAPES_CONSTRAINTS,
};

/**
 * Shapes validation result — area too small.
 *
 * Area of 50 km² is below the default minimum of 100 km².
 *
 * @see {@link ShapesValidationResult}
 */
export const EXAMPLE_SHAPES_VALIDATION_AREA_TOO_SMALL: ShapesValidationResult = {
	status: 'area-too-small',
	areaKm2: 50,
	nbPositions: 5,
	constraints: DEFAULT_SHAPES_CONSTRAINTS,
	errorMessageKey: 'area-too-small',
};

/**
 * Shapes validation result — area too large.
 *
 * Area of 600,000 km² exceeds the default maximum of 500,000 km².
 *
 * @see {@link ShapesValidationResult}
 */
export const EXAMPLE_SHAPES_VALIDATION_AREA_TOO_LARGE: ShapesValidationResult = {
	status: 'area-too-large',
	areaKm2: 600_000,
	nbPositions: 5,
	constraints: DEFAULT_SHAPES_CONSTRAINTS,
	errorMessageKey: 'area-too-large',
};

/**
 * Shapes validation result — too many positions.
 *
 * 1 more position than the default maximum.
 *
 * @see {@link ShapesValidationResult}
 */
export const EXAMPLE_SHAPES_VALIDATION_TOO_MANY_POSITIONS: ShapesValidationResult = {
	status: 'too-many-positions',
	areaKm2: 600_000,
	nbPositions: DEFAULT_SHAPES_CONSTRAINTS.maxPositions + 1,
	constraints: DEFAULT_SHAPES_CONSTRAINTS,
	errorMessageKey: 'too-many-positions',
};

/**
 * Branded validated shapes — proves shapes validation passed.
 *
 * @see {@link ValidatedShapes}
 */
export const EXAMPLE_VALIDATED_SHAPES = Object.assign(
	[EXAMPLE_DISPLAYABLE_SHAPE],
	{ __shapesValidated: Symbol('shapesValidated') },
) as unknown as ValidatedShapes;

// ============================================================================
// LAYER 7: FINCH INTEGRATION
// ============================================================================

/**
 * Finch API shape parameter — FeatureCollection with exactly one Feature.
 *
 * Coordinates would be rounded to 2 decimal places in production (F13).
 *
 * @see {@link FinchShapeParameter}
 * @see {@link FINCH_COORDINATE_PRECISION} in contracts.ts
 */
export const EXAMPLE_FINCH_PAYLOAD: FinchShapeParameter = {
	type: 'FeatureCollection',
	features: [EXAMPLE_DISPLAYABLE_SHAPE.feature],
};
