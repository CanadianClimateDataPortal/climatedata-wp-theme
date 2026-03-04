/**
 * @file
 *
 * Data shape interfaces for the shapefile processing pipeline.
 *
 * This file defines what data looks like at each stage:
 * Extract → Validate → Transform → Display → Select → Validate Shapes → Finch
 *
 * For pipeline function signatures, see ./pipeline.ts
 * For Result types, see ./result.ts
 *
 * @remarks
 *
 * Geographic Concepts — Quick Reference
 *
 * ```
 * Coordinate system  A mathematical model that assigns (x, y) numbers to
 *                    locations on Earth. Different models optimize for
 *                    different regions or purposes.
 *
 * Projection         The specific math used to flatten the curved surface
 *                    onto a 2D plane. Each coordinate system uses one.
 *
 * WGS84              World Geodetic System 1984. The global standard used
 *                    by GPS, web maps (Leaflet, Google Maps), and the
 *                    GeoJSON spec. Coordinates are latitude/longitude
 *                    in degrees.
 *
 * .prj file          Declares which coordinate system a shapefile uses,
 *                    as a WKT (Well-Known Text) string.
 *
 * Convert to WGS84   Transform coordinates from the shapefile's native
 *                    system into standard lat/long. Handled by proj4
 *                    during .shp parsing. GIS jargon: "reprojection".
 * ```
 *
 * Our pipeline converts coordinates to WGS84 so that all geometry is in
 * the same lat/long system that Leaflet and downstream services expect.
 *
 * @see {@link ./pipeline.ts} for pipeline function signatures
 * @see {@link ./result.ts} for Result types
 */

import type { Feature, FeatureCollection, Polygon } from 'geojson';

/**
 * Shapes validation result type.
 */
export const VALUES_SHAPES_VALIDATION_STATUSES = [
	'area-too-large',
	'area-too-small',
	'too-many-positions',
	'valid',
] as const;

/**
 * Geometry types supported by shapefiles.
 *
 * Only 'Polygon' is valid for ClimateData uploads.
 * Other types (Point, Polyline) are rejected.
 */
export const VALUES_SUPPORTED_GEOMETRY_TYPES = [
	'MultiPatch',
	'MultiPoint',
	'Point',
	'Polygon',
	'Polyline',
] as const;

/**
 * Result of shapes validation.
 */
export const VALUES_SHAPES_VALIDATION_RESULT_ERRORS = [
	'area-too-large',
	'area-too-small',
	'too-many-positions',
] as const;

// ============================================================================
// LAYER 1: EXTRACTION (Implemented in extraction.ts)
// ============================================================================

/**
 * A single .shp/.prj pair extracted from a ZIP archive.
 *
 * Each pair is independently reprojected by shpjs/proj4 during parsing.
 * The `basename` preserves the original filename stem for traceability
 * in warning messages and error diagnostics.
 */
export interface ShapefilePair {
	/** Binary shapefile geometry data */
	shp: ArrayBuffer;
	/** Projection definition string (e.g., WGS84 WKT) */
	prj: string;
	/** Original filename stem (e.g., "munic_s" from "subdir/munic_s.shp") */
	basename: string;
}

/**
 * An entry that was skipped during extraction.
 *
 * Produced when a `.shp` file has no matching `.prj` in the ZIP archive.
 * Collected as structured data so the UI can surface warnings.
 */
export interface SkippedEntry {
	/** Original filename stem of the orphan .shp */
	basename: string;
	/** Human-readable reason for skipping */
	reason: string;
}

/**
 * Extracted shapefile data from ZIP archive.
 *
 * Contains all valid .shp/.prj pairs found in the archive, plus any
 * entries that were skipped (e.g., orphan .shp without matching .prj).
 *
 * A ZIP with one .shp and one .prj produces a single-element `pairs`
 * array — backward compatible with the previous single-pair shape.
 *
 * @see {@link ./extract-shapefile.ts} for implementation
 */
export interface ExtractedShapefile {
	/** All valid .shp/.prj pairs found in the archive */
	pairs: ShapefilePair[];
	/** Entries skipped during extraction (orphan .shp without .prj) */
	skippedEntries: SkippedEntry[];
}

// ============================================================================
// LAYER 2: VALIDATION
// ============================================================================

/**
 * Geometry types supported by shapefiles.
 *
 * @see {@link VALUES_SUPPORTED_GEOMETRY_TYPES}
 */
export type GeometryType = (typeof VALUES_SUPPORTED_GEOMETRY_TYPES)[number];

/**
 * Shapefile metadata from validation inspection.
 */
export interface ShapefileInfo {
	/** Geometry type (must be 'Polygon') */
	geometry_type: GeometryType;
	/** Number of features in shapefile */
	feature_count: number;
	/** Bounding box [minX, minY, maxX, maxY] */
	bbox?: [number, number, number, number];
	/** Source projection system */
	projection?: string;
}

/**
 * Branded type proving shapefile has passed geometry validation.
 *
 * Phantom type that enforces validation at compile time. Identical to
 * ExtractedShapefile at runtime, but TypeScript treats it as distinct,
 * preventing unvalidated shapefiles from reaching transformation stage.
 */
export type ValidatedShapefile = ExtractedShapefile & {
	readonly __validated: unique symbol;
};

// ============================================================================
// LAYER 3: TRANSFORMATION
// ============================================================================

/**
 * GeoJSON FeatureCollection output from the simplification process.
 *
 * Processing steps:
 * 1. Parse .shp binary and convert coordinates to WGS84 (standard lat/long)
 * 2. Filter to polygon geometries only
 * 3. Clean redundant coordinates
 * 4. Truncate coordinate precision
 * 5. Enforce RFC 7946 winding order
 *
 * This is the raw parsed output. The UI layer (downstream tickets)
 * handles conversion to displayable shapes.
 */
export interface SimplifiedGeometry {
	/** Parsed GeoJSON FeatureCollection */
	featureCollection: FeatureCollection;
	/** Feature count */
	featureCount: number;
}

// ============================================================================
// LAYER 4: DISPLAY
// ============================================================================

/**
 * Individual polygon shape ready for display on map.
 *
 * Represents a single polygon from the shapefile, extracted from simplified
 * GeoJSON for rendering with Leaflet. Each shape includes its computed
 * area and number of positions for validation against size constraints.
 */
export interface DisplayableShape {
	/** Unique identifier for this shape */
	id: string;
	/** GeoJSON Feature with Polygon geometry */
	feature: Feature<Polygon>;
	/** Area in square kilometers (computed via Turf.js) */
	areaKm2: number;
	/** Total number of positions (pairs of coordinates) in the shape */
	nbPositions: number;
}

/**
 * Collection of shapes ready for map display.
 */
export interface DisplayableShapes {
	/** Array of individual polygons */
	shapes: DisplayableShape[];
	/** Bounding box for map zoom [minLng, minLat, maxLng, maxLat] */
	bounds: [number, number, number, number];
	/** Total number of polygons */
	totalCount: number;
}

// ============================================================================
// LAYER 5: SELECTION
// ============================================================================

/**
 * Lean selection record for machine context and hook consumers.
 *
 * Full shape data (including `.feature`) stays in `displayableShapes`.
 * Consumers that need the feature resolve it there by ID.
 */
export type SelectedShape = Pick<DisplayableShape, 'id' | 'areaKm2'>;

// ============================================================================
// LAYER 6: SHAPES VALIDATION
// ============================================================================

/**
 * Shapes constraints configuration.
 *
 * From requirements U13, U14.
 */
export interface ShapesConstraints {
	/**
	 * Minimum area in km²
	 * (default: 100)
	 * @see {@link DEFAULT_SHAPES_CONSTRAINTS}
	 */
	minKm2: number;
	/**
	 * Maximum area in km²
	 * (default: 500,000)
	 * @see {@link DEFAULT_SHAPES_CONSTRAINTS}
	 */
	maxKm2: number;
	/**
	 * Maximum number of positions (pairs of coordinates) in a shape
	 * (default: 5,000,000)
	 * @see {@link DEFAULT_SHAPES_CONSTRAINTS}
	 * @remarks
	 */
	maxPositions: number;
}

/**
 * @see {@link VALUES_SHAPES_VALIDATION_STATUSES}
 */
export type ShapesValidationStatus =
	(typeof VALUES_SHAPES_VALIDATION_STATUSES)[number];

/**
 * Result of shapes validation.
 */
export interface ShapesValidationResult {
	/** Validation outcome */
	status: ShapesValidationStatus;
	/** Selected shapes area in km² */
	areaKm2: number;
	/** Number of positions in selected shapes */
	nbPositions: number;
	/** Applied constraints */
	constraints: ShapesConstraints;
	/** Error message key (for i18n) if invalid */
	errorMessageKey?: (typeof VALUES_SHAPES_VALIDATION_RESULT_ERRORS)[number];
}

/**
 * Branded type proving shapes passed validation.
 *
 * Similar to ValidatedShapefile, this enforces that shapes
 * validation must occur before using the shapes.
 */
export type ValidatedShapes = DisplayableShape[] & {
	readonly __shapesValidated: unique symbol;
};

// ============================================================================
// LAYER 7: FINCH INTEGRATION
// ============================================================================

/**
 * GeoJSON payload for Finch API shape parameter.
 *
 * - Must be FeatureCollection with single Feature
 * - Coordinates rounded to 2 decimal places
 * - Replaces lat/lon parameters
 */
export interface FinchShapeParameter {
	type: 'FeatureCollection';
	features: Feature<Polygon>[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Coordinate rounding precision for Finch API (requirement F13).
 */
export const FINCH_COORDINATE_PRECISION = 2;

/**
 * Roughly tolerated maximum size of the Finch request (in bytes).
 *
 * This number is not used to *guarantee* a request's maximum size (the actual
 * request could end up a little bit bigger than this in edge cases). But it's
 * used to calculate what a good value is for the maximum number of positions
 * allowed.
 *
 * Note that the bulk of a Finch request consists of coordinates, so we can
 * safely consider that the size of the request corresponds to the size of the
 * list of coordinates (as a JSON encoded string).
 */
export const FINCH_APPROX_MAX_REQUEST_SIZE = 4_000_000;

/**
 * Approximate number of bytes per position in a Finch request when positions
 * are JSON encoded.
 * The number 5.4 was determined empirically.
 */
const approximateBytesPerPosition = (5.4 + FINCH_COORDINATE_PRECISION) * 2;

/**
 * Default shapes selection constraints (from requirements U13, U14).
 *
 * The `maxPositions` is calculated from the desired maximum Finch request size,
 * and the approximate number of bytes per position in a request.
 */
export const DEFAULT_SHAPES_CONSTRAINTS: ShapesConstraints = {
	minKm2: 100,
	maxKm2: 500_000,
	maxPositions: Math.round(
		FINCH_APPROX_MAX_REQUEST_SIZE / approximateBytesPerPosition
	),
};
