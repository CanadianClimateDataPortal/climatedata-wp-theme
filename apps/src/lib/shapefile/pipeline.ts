/**
 * Pipeline function type signatures for shapefile processing.
 *
 * These define the contract for each stage of the pipeline:
 * Extract → Validate → Transform → Display → Select → Validate Area → Finch
 *
 * When the XState machine is implemented, these signatures will be
 * used as invoked services on the machine.
 */

import type { Result } from '@/lib/shapefile/result';
import type {
  ExtractedShapefile,
  ValidatedShapefile,
  SimplifiedTopoJSON,
  ProjectionConfig,
  DisplayableShapes,
  SelectedRegion,
  AreaConstraints,
  ValidatedRegion,
  FinchShapeParameter,
} from '@/lib/shapefile/contracts';
import type {
  InvalidGeometryTypeError,
  AreaExceedsLimitError,
  AreaBelowLimitError,
  ProcessingError,
  ProjectionError,
} from '@/lib/shapefile/errors';

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
 */
export type ValidateShapefileGeometry = (
  shapefile: ExtractedShapefile,
) => Promise<Result<ValidatedShapefile, InvalidGeometryTypeError | ProcessingError>>;

/**
 * Stage 3: Transform and simplify to TopoJSON.
 *
 * Projects the shapefile to WGS84 coordinate system, cleans the geometry,
 * and converts to TopoJSON format.
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
 * (default: 100 km² to 500,000 km²).
 */
export type ValidateSelectedArea = (
  region: SelectedRegion,
  constraints: AreaConstraints,
) => Result<ValidatedRegion, AreaExceedsLimitError | AreaBelowLimitError>;

/**
 * Stage 6: Prepare Finch API payload.
 *
 * Converts the validated region into a GeoJSON FeatureCollection suitable
 * for the Finch API's shape parameter.
 */
export type PrepareFinchPayload = (
  region: ValidatedRegion,
) => FinchShapeParameter;
