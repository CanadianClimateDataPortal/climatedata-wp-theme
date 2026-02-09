/**
 * Data shape interfaces for the shapefile processing pipeline.
 *
 * This file defines what data looks like at each stage:
 * Extract → Validate → Transform → Display → Select → Validate Area → Finch
 *
 * For pipeline function signatures, see ./pipeline.ts
 * For Result types, see ./result.ts
 */

import type { Feature, FeatureCollection, Polygon } from 'geojson';

/**
 * Area validation result type.
 */
export const VALUES_AREA_VALIDATION_STATUSES = [
	'too-large',
	'too-small',
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
 * Result of area validation.
 */
export const VALUES_AREA_VALIDATION_RESULT_ERRORS = [
	'area-too-large',
	'area-too-small',
] as const;

// ============================================================================
// LAYER 1: EXTRACTION (Implemented in file-loader.ts)
// ============================================================================

/**
 * Extracted shapefile data from ZIP archive.
 *
 * Contains the two required files:
 * - .shp: Binary geometry data (ArrayBuffer)
 * - .prj: Projection definition (string)
 *
 * Other files such as .dbf and .shx are ignored to minimize data exposure.
 *
 * @see {@link ./file-loader.ts} for implementation
 */
export interface ExtractedShapefile {
	/** Binary shapefile geometry data */
	'file.shp': ArrayBuffer;
	/** Projection definition string (e.g., WGS84) */
	'file.prj': string;
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
 *
 * Extracted via Mapshaper's `-info` command or equivalent.
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
 * GeoJSON FeatureCollection output from mapshaper simplification.
 *
 * Result of mapshaper processing:
 * - `-clean`: Fix topology errors
 * - `-snap precision=0.001`: Snap coordinates
 * - `-fix-geometry`: Repair invalid geometries
 * - `-proj wgs84`: Project to WGS84
 * - `-o format=geojson`: Output as GeoJSON
 *
 * This is the raw parsed output from mapshaper. The UI layer
 * (downstream tickets) handles conversion to displayable shapes.
 */
export interface SimplifiedGeometry {
	/** Parsed GeoJSON FeatureCollection from mapshaper */
	featureCollection: FeatureCollection;
	/** Feature count (from mapshaper output) */
	featureCount: number;
}

// ============================================================================
// LAYER 4: DISPLAY
// ============================================================================

/**
 * Individual polygon shape ready for display on map.
 *
 * Represents a single polygon from the shapefile, converted from TopoJSON to
 * GeoJSON format for rendering with Leaflet. Each shape includes its computed
 * area for validation against size constraints.
 */
export interface DisplayableShape {
	/** Unique identifier for this shape */
	id: string;
	/** GeoJSON Feature with Polygon geometry */
	feature: Feature<Polygon>;
	/** Area in square kilometers (computed via Turf.js) */
	areaKm2: number;
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
 * User-selected region from shapefile.
 *
 * One polygon selected by clicking on the map. Must pass area
 * validation (between 100 km² and 500,000 km²) before being used
 * for climate data downloads.
 */
export interface SelectedRegion {
	/** Unique identifier (from DisplayableShape.id) */
	id: string;
	/** GeoJSON Feature of selected polygon */
	feature: Feature<Polygon>;
	/** Area in square kilometers */
	areaKm2: number;
	/** Human-readable area string (e.g., "1,234.5 km²") */
	areaFormatted: string;
}

// ============================================================================
// LAYER 6: AREA VALIDATION
// ============================================================================

/**
 * Area constraint configuration.
 *
 * From requirements U13, U14.
 */
export interface AreaConstraints {
	/**
	 * Minimum area in km²
	 * (default: 100)
	 * @see {@link DEFAULT_AREA_CONSTRAINTS}
	 */
	minKm2: number;
	/**
	 * Maximum area in km²
	 * (default: 500,000)
	 * @see {@link DEFAULT_AREA_CONSTRAINTS}
	 */
	maxKm2: number;
}

/**
 * @see {@link VALUES_AREA_VALIDATION_STATUSES}
 */
export type AreaValidationStatus =
	(typeof VALUES_AREA_VALIDATION_STATUSES)[number];

/**
 * Result of area validation.
 */
export interface AreaValidationResult {
	/** Validation outcome */
	status: AreaValidationStatus;
	/** Selected region area in km² */
	areaKm2: number;
	/** Applied constraints */
	constraints: AreaConstraints;
	/** Error message key (for i18n) if invalid */
	errorMessageKey?: (typeof VALUES_AREA_VALIDATION_RESULT_ERRORS)[number];
}

/**
 * Branded type proving region passed area validation.
 *
 * Similar to ValidatedShapefile, this enforces that area
 * validation must occur before using the region.
 */
export type ValidatedRegion = SelectedRegion & {
	readonly __areaValidated: unique symbol;
};

// ============================================================================
// LAYER 7: FINCH INTEGRATION
// ============================================================================

/**
 * GeoJSON payload for Finch API shape parameter.
 *
 * Requirements from CLIM-1274 (F11, F12, F13):
 * - Must be FeatureCollection with single Feature
 * - Coordinates rounded to 2 decimal places
 * - Replaces lat/lon parameters
 */
export interface FinchShapeParameter {
	type: 'FeatureCollection';
	features: [Feature<Polygon>]; // Exactly one feature
}

/**
 * Finch query parameters for shapefile request.
 */
export interface FinchShapefileQuery {
	/** GeoJSON shape parameter (serialized) */
	shape: string; // JSON.stringify(FinchShapeParameter)
	/** Other query params (dataset, variable, etc.) */
	[key: string]: string | number | boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Default area constraints (from requirements U13, U14).
 */
export const DEFAULT_AREA_CONSTRAINTS: AreaConstraints = {
	minKm2: 100,
	maxKm2: 500_000,
};

/**
 * Coordinate rounding precision for Finch API (requirement F13).
 */
export const FINCH_COORDINATE_PRECISION = 2;
