/**
 * Data shape interfaces for the shapefile processing pipeline.
 *
 * This file defines what data looks like at each stage:
 * Extract → Validate → Transform → Display → Select → Validate Area → Finch
 *
 * For pipeline function signatures, see ./pipeline.ts
 * For Result types, see ./result.ts
 */

import type { Feature, Polygon } from 'geojson';

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
 * @see file-loader.ts - Implementation
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
 * Only 'Polygon' is valid for ClimateData uploads.
 * Other types (Point, Polyline) are rejected.
 */
export type GeometryType =
  | 'Point'
  | 'Polyline'
  | 'Polygon'
  | 'MultiPoint'
  | 'MultiPatch';

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
 * TopoJSON Topology object.
 *
 * Output format from Mapshaper simplification pipeline.
 * More compact than GeoJSON for polygon data.
 *
 * Reference: https://github.com/topojson/topojson-specification
 */
export interface TopoJSONTopology {
  type: 'Topology';
  /** Named geometry objects */
  objects: Record<string, TopoJSONGeometry>;
  /** Quantized arcs (shared boundaries) */
  arcs: number[][][];
  /** Optional transformation for quantization */
  transform?: {
    scale: [number, number];
    translate: [number, number];
  };
  /** Bounding box [minX, minY, maxX, maxY] */
  bbox?: [number, number, number, number];
}

/**
 * TopoJSON geometry object.
 */
export interface TopoJSONGeometry {
  type: string;
  /** Arc indices */
  arcs: number[][] | number[][][];
  /** Optional properties */
  properties?: Record<string, unknown>;
}

/**
 * Simplified and projected shapefile data.
 *
 * Result of Mapshaper's processing:
 * - `-clean`: Fix topology errors
 * - `-snap precision=0.001`: Snap coordinates
 * - `-fix-geometry`: Repair invalid geometries
 * - `-proj wgs84`: Project to WGS84
 * - `-o output.topojson`: Convert to TopoJSON
 */
export interface SimplifiedTopoJSON {
  /** TopoJSON topology */
  topology: TopoJSONTopology;
  /** Original feature count before simplification */
  originalFeatureCount: number;
  /** Feature count after simplification */
  simplifiedFeatureCount: number;
}

/**
 * Projection configuration.
 */
export interface ProjectionConfig {
  /** Target coordinate system (always 'wgs84' for ClimateData) */
  target: 'wgs84';
  /** Precision for coordinate snapping */
  snapPrecision: number;
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
  /** Minimum area in km² (default: 100) */
  minKm2: number;
  /** Maximum area in km² (default: 500,000) */
  maxKm2: number;
}

/**
 * Area validation result type.
 */
export type AreaValidationStatus = 'valid' | 'too-small' | 'too-large';

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
  errorMessageKey?: 'area-too-small' | 'area-too-large';
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
 * Default projection config.
 */
export const DEFAULT_PROJECTION_CONFIG: ProjectionConfig = {
  target: 'wgs84',
  snapPrecision: 0.001,
};

/**
 * Coordinate rounding precision for Finch API (requirement F13).
 */
export const FINCH_COORDINATE_PRECISION = 2;
