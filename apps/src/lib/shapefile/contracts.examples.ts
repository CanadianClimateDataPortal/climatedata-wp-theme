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
 * @see ./contracts.ts — Data shape interfaces
 * @see ./pipeline.ts — Function type signatures
 * @see ./result.ts — Result<T, E>
 */

import type {
	AreaConstraints,
	AreaValidationResult,
	DisplayableShape,
	DisplayableShapes,
	ExtractedShapefile,
	FinchShapeParameter,
	SelectedRegion,
	ShapefileInfo,
	SimplifiedTopoJSON,
	ValidatedRegion,
	ValidatedShapefile,
} from './contracts';
import { DEFAULT_AREA_CONSTRAINTS } from './contracts';

// ============================================================================
// LAYER 1: EXTRACTION
// ============================================================================

/**
 * Minimal extracted shapefile — .shp binary + .prj projection string.
 *
 * In production, the ArrayBuffer contains real shapefile binary data.
 * Here we use an 8-byte stub — enough to satisfy the type.
 *
 * @see {@link ExtractedShapefile}
 */
export const EXAMPLE_EXTRACTED_SHAPEFILE: ExtractedShapefile = {
	'file.shp': new ArrayBuffer(8),
	'file.prj': 'GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137,298.257223563]],PRIMEM["Greenwich",0],UNIT["Degree",0.017453292519943295]]',
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
 * Simplified TopoJSON output from Mapshaper pipeline.
 *
 * Minimal topology with one named object and empty arcs.
 * Production data would have quantized arc arrays and transform.
 *
 * @see {@link SimplifiedTopoJSON}
 */
export const EXAMPLE_SIMPLIFIED_TOPOJSON: SimplifiedTopoJSON = {
	topology: {
		type: 'Topology',
		objects: {
			shapefile: {
				type: 'GeometryCollection',
				arcs: [],
			},
		},
		arcs: [],
		bbox: [-75.8, 45.2, -73.5, 46.1],
	},
	originalFeatureCount: 3,
	simplifiedFeatureCount: 3,
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
 * User-selected region derived from the displayable shape.
 *
 * Includes formatted area string for UI display.
 *
 * @see {@link SelectedRegion}
 */
export const EXAMPLE_SELECTED_REGION: SelectedRegion = {
	id: EXAMPLE_DISPLAYABLE_SHAPE.id,
	feature: EXAMPLE_DISPLAYABLE_SHAPE.feature,
	areaKm2: EXAMPLE_DISPLAYABLE_SHAPE.areaKm2,
	areaFormatted: '5,000 km²',
};

// ============================================================================
// LAYER 6: AREA VALIDATION
// ============================================================================

/**
 * Default area constraints from requirements U13, U14.
 *
 * Re-exported from contracts.ts for convenience in tests and stories.
 *
 * @see {@link AreaConstraints}
 * @see {@link DEFAULT_AREA_CONSTRAINTS}
 */
export const EXAMPLE_AREA_CONSTRAINTS: AreaConstraints = {
	...DEFAULT_AREA_CONSTRAINTS,
};

/**
 * Custom area constraints for testing boundary conditions.
 *
 * Tighter range than defaults — useful for triggering too-small / too-large.
 *
 * @see {@link AreaConstraints}
 */
export const EXAMPLE_AREA_CONSTRAINTS_TIGHT: AreaConstraints = {
	minKm2: 1000,
	maxKm2: 10_000,
};

/**
 * Area validation result — valid.
 *
 * @see {@link AreaValidationResult}
 */
export const EXAMPLE_AREA_VALIDATION_VALID: AreaValidationResult = {
	status: 'valid',
	areaKm2: 5000,
	constraints: DEFAULT_AREA_CONSTRAINTS,
};

/**
 * Area validation result — too small.
 *
 * Area of 50 km² is below the default minimum of 100 km².
 *
 * @see {@link AreaValidationResult}
 */
export const EXAMPLE_AREA_VALIDATION_TOO_SMALL: AreaValidationResult = {
	status: 'too-small',
	areaKm2: 50,
	constraints: DEFAULT_AREA_CONSTRAINTS,
	errorMessageKey: 'area-too-small',
};

/**
 * Area validation result — too large.
 *
 * Area of 600,000 km² exceeds the default maximum of 500,000 km².
 *
 * @see {@link AreaValidationResult}
 */
export const EXAMPLE_AREA_VALIDATION_TOO_LARGE: AreaValidationResult = {
	status: 'too-large',
	areaKm2: 600_000,
	constraints: DEFAULT_AREA_CONSTRAINTS,
	errorMessageKey: 'area-too-large',
};

/**
 * Branded validated region — proves area validation passed.
 *
 * Requires `as unknown as` cast because the branded `__areaValidated` symbol
 * cannot be constructed outside the validation function.
 *
 * @see {@link ValidatedRegion}
 */
export const EXAMPLE_VALIDATED_REGION = {
	...EXAMPLE_SELECTED_REGION,
	__areaValidated: Symbol('areaValidated'),
} as unknown as ValidatedRegion;

// ============================================================================
// LAYER 7: FINCH INTEGRATION
// ============================================================================

/**
 * Finch API shape parameter — FeatureCollection with exactly one Feature.
 *
 * Coordinates would be rounded to 2 decimal places in production (F13).
 *
 * @see {@link FinchShapeParameter}
 */
export const EXAMPLE_FINCH_PAYLOAD: FinchShapeParameter = {
	type: 'FeatureCollection',
	features: [EXAMPLE_SELECTED_REGION.feature],
};
