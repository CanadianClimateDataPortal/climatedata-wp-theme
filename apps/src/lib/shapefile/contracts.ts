/**
 * TypeScript contracts for shapefile processing pipeline.
 *
 * This file defines the type architecture for the entire shapefile
 * upload and processing workflow, from file extraction through validation,
 * transformation, and selection.
 *
 * ARCHITECTURE OVERVIEW:
 * ======================
 *
 * The shapefile processing follows a strict pipeline with typed stages:
 *
 * 1. Extraction Layer (✅ Implemented in file-loader.ts)
 *    File → ExtractedShapefile
 *
 * 2. Validation Layer (⏳ To implement in CLIM-1267)
 *    ExtractedShapefile → ValidatedShapefile
 *
 * 3. Transformation Layer (⏳ To implement)
 *    ValidatedShapefile → SimplifiedTopoJSON
 *
 * 4. Display Layer (⏳ To implement in CLIM-1268)
 *    SimplifiedTopoJSON → DisplayableShapes
 *
 * 5. Selection Layer (⏳ To implement in CLIM-1269)
 *    DisplayableShapes → SelectedRegion
 *
 * 6. Area Validation Layer (⏳ To implement in CLIM-1270)
 *    SelectedRegion → ValidatedRegion
 *
 * 7. Finch Integration Layer (⏳ To implement in CLIM-1274)
 *    ValidatedRegion → FinchShapeParameter
 *
 * Each stage uses Result types (success/failure) for explicit error handling.
 */

import type { Feature, Polygon } from 'geojson';
import type {
  InvalidGeometryTypeError,
  AreaExceedsLimitError,
  AreaBelowLimitError,
  ProcessingError,
  ProjectionError,
} from './errors';

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
 * @example Extracting from ZIP
 * ```typescript
 * const file = fileInput.files[0]; // User-selected ZIP file
 * const result = await extractShapefileFromZip(file);
 * if (result.ok) {
 *   const shapefile: ExtractedShapefile = result.value;
 *   console.log('SHP size:', shapefile['file.shp'].byteLength);
 *   console.log('Projection:', shapefile['file.prj']);
 * }
 * ```
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
 * This is a "phantom type" that enforces validation at compile time. It's
 * identical to ExtractedShapefile at runtime, but TypeScript treats it as a
 * distinct type, preventing unvalidated shapefiles from being used in functions
 * that require validated input.
 *
 * The validation confirms the shapefile contains only polygon geometries, as
 * required by the ClimateData upload feature (points and lines are rejected).
 *
 * @example Type Safety Enforcement
 * ```typescript
 * // ❌ Cannot use ExtractedShapefile directly
 * function transform(shapefile: ValidatedShapefile) { ... }
 * transform(extractedData); // Type error!
 *
 * // ✅ Must validate first
 * const validated = await validateShapefileGeometry(extractedData);
 * if (validated.ok) {
 *   transform(validated.value); // Works!
 * }
 * ```
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
 *
 * @example Creating DisplayableShape
 * ```typescript
 * const shape: DisplayableShape = {
 *   id: nanoid(),
 *   feature: {
 *     type: 'Feature',
 *     geometry: { type: 'Polygon', coordinates: [...] },
 *     properties: {}
 *   },
 *   areaKm2: turf.area(feature) / 1_000_000 // Convert m² to km²
 * };
 * ```
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
 * One polygon selected by clicking on the map.
 *
 * Only one region can be selected at a time, and it must pass area
 * validation (between 100 km² and 500,000 km²) before being used for climate
 * data downloads.
 *
 * @example Storing Selected Region
 * ```typescript
 * const selected: SelectedRegion = {
 *   id: displayableShape.id,
 *   feature: displayableShape.feature,
 *   areaKm2: displayableShape.areaKm2,
 *   areaFormatted: `${displayableShape.areaKm2.toLocaleString()} km²`
 * };
 * ```
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
// RESULT TYPES (Discriminated Unions)
// ============================================================================

/**
 * Success result wrapper.
 */
export interface Ok<T> {
  ok: true;
  value: T;
}

/**
 * Failure result wrapper.
 */
export interface Err<E extends Error> {
  ok: false;
  error: E;
}

/**
 * Result type for operations that can fail.
 *
 * Explicit error handling without try-catch.
 *
 * A discriminated union that forces explicit error handling without relying on
 * try-catch blocks. The `ok` property acts as a type guard, allowing TypeScript
 * to narrow the type to either the success value or the error.
 *
 * This pattern is used throughout the shapefile processing pipeline to make
 * error handling explicit and type-safe at compile time.
 *
 * @example Checking Result Success
 * ```typescript
 * const result = await validateShapefile(data);
 * if (result.ok) {
 *   // TypeScript knows result.value exists
 *   console.log('Valid:', result.value);
 * } else {
 *   // TypeScript knows result.error exists
 *   console.error('Error:', result.error.message);
 * }
 * ```
 */
export type Result<T, E extends Error = Error> = Ok<T> | Err<E>;

// ============================================================================
// PIPELINE FUNCTION SIGNATURES
// ============================================================================

/**
 * Stage 1: Extract shapefile from ZIP (✅ Implemented in file-loader.ts).
 */
export type ExtractShapefileFromZip = (
  file: File,
) => Promise<Result<ExtractedShapefile, Error>>;

/**
 * Stage 2: Validate shapefile geometry type.
 *
 * Validates that the shapefile contains only polygon geometries. Points,
 * polylines, and other geometry types are rejected as they cannot be used
 * for defining climate data download regions.
 *
 * @param shapefile - The extracted shapefile data to validate.
 * @returns A Result containing the validated shapefile on success, or an error
 *     indicating invalid geometry type or processing failure.
 *
 * @example Validating Geometry
 * ```typescript
 * const extracted = await extractShapefileFromZip(file);
 * if (extracted.ok) {
 *   const validated = await validateShapefileGeometry(extracted.value);
 *   if (!validated.ok) {
 *     if (validated.error instanceof InvalidGeometryTypeError) {
 *       console.error(`Wrong type: ${validated.error.geometryType}`);
 *     }
 *   }
 * }
 * ```
 */
export type ValidateShapefileGeometry = (
  shapefile: ExtractedShapefile,
) => Promise<Result<ValidatedShapefile, InvalidGeometryTypeError | ProcessingError>>;

/**
 * Stage 3: Transform and simplify to TopoJSON.
 *
 * Projects the shapefile to WGS84 coordinate system, cleans the geometry
 * (fixes topology errors, snaps coordinates), and converts to TopoJSON format
 * for efficient storage and transmission.
 *
 * @param shapefile - The validated shapefile to transform.
 * @param config - Projection configuration (target system and precision).
 * @returns A Result containing the simplified TopoJSON topology on success,
 *     or an error indicating processing or projection failure.
 *
 * @example Transforming to TopoJSON
 * ```typescript
 * const config: ProjectionConfig = {
 *   target: 'wgs84',
 *   snapPrecision: 0.001
 * };
 * const result = await transformToTopoJSON(validated, config);
 * if (result.ok) {
 *   console.log(`Simplified from ${result.value.originalFeatureCount} to ${result.value.simplifiedFeatureCount} features`);
 * }
 * ```
 */
export type TransformToTopoJSON = (
  shapefile: ValidatedShapefile,
  config: ProjectionConfig,
) => Promise<Result<SimplifiedTopoJSON, ProcessingError | ProjectionError>>;

/**
 * Stage 4: Convert TopoJSON to displayable shapes.
 */
export type ConvertToDisplayableShapes = (
  topoJSON: SimplifiedTopoJSON,
) => Result<DisplayableShapes, ProcessingError>;

/**
 * Stage 5: Validate selected region area.
 *
 * Validates that the selected region's area falls within the allowed range
 * (default: 100 km² to 500,000 km²). Regions that are too small may not
 * contain meaningful climate data, while regions that are too large may
 * exceed processing limits.
 *
 * @param region - The selected region to validate.
 * @param constraints - Area limits to enforce (min and max in km²).
 * @returns A Result containing the validated region on success, or an error
 *     indicating the area is too large or too small.
 *
 * @example Validating Selection
 * ```typescript
 * const constraints: AreaConstraints = { minKm2: 100, maxKm2: 500_000 };
 * const result = validateSelectedArea(selected, constraints);
 * if (!result.ok) {
 *   if (result.error instanceof AreaExceedsLimitError) {
 *     showError('Region too large. Please select a smaller area.');
 *   } else if (result.error instanceof AreaBelowLimitError) {
 *     showError('Region too small. Please select a larger area.');
 *   }
 * }
 * ```
 */
export type ValidateSelectedArea = (
  region: SelectedRegion,
  constraints: AreaConstraints,
) => Result<ValidatedRegion, AreaExceedsLimitError | AreaBelowLimitError>;

/**
 * Stage 6: Prepare Finch API payload.
 *
 * Converts the validated region into a GeoJSON FeatureCollection suitable for
 * the Finch API's shape parameter. Coordinates are rounded to 2 decimal places
 * as required by the API specification.
 *
 * @param region - The validated region to convert.
 * @returns A FinchShapeParameter ready to be serialized and sent to the API.
 *
 * @example Preparing for API Request
 * ```typescript
 * const payload = prepareFinchPayload(validatedRegion);
 * const query = {
 *   shape: JSON.stringify(payload),
 *   dataset: 'statistically_downscaled',
 *   variable: 'days_above_tmax'
 * };
 * // Send to Finch API...
 * ```
 */
export type PrepareFinchPayload = (
  region: ValidatedRegion,
) => FinchShapeParameter;

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
