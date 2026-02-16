/**
 * Pipeline function type signatures for shapefile processing.
 *
 * These define the contract for each stage of the pipeline:
 * Extract → Validate → Transform → Display → Select → Validate Area → Finch
 *
 * When the XState machine is implemented, these signatures will be
 * used as invoked services on the machine.
 */

import { type Result } from './result';
import {
	type ExtractedShapefile,
	type ValidatedShapefile,
	type SimplifiedGeometry,
	type SelectedRegion,
	type AreaConstraints,
	type ValidatedRegion,
	type FinchShapeParameter,
} from './contracts';
import {
	type ShapefileError,
	type InvalidGeometryTypeError,
	type AreaExceedsLimitError,
	type AreaBelowLimitError,
	type ProcessingError,
	type ProjectionError,
} from './errors';

/**
 * Stage 1: Extract shapefile from ZIP.
 *
 * Validates the file is a ZIP archive and extracts .shp and .prj files.
 *
 * @see {@link ./extract-shapefile.ts} for implementation
 */
export type ExtractShapefileFromZip = (
	file: File,
) => Promise<Result<ExtractedShapefile, ShapefileError>>;

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
 * Stage 3: Simplify shapefile geometry.
 *
 * Cleans, snaps, fixes geometry, projects to WGS84,
 * and outputs simplified GeoJSON.
 */
export type SimplifyShapefile = (
	shapefile: ValidatedShapefile,
) => Promise<Result<SimplifiedGeometry, ProcessingError | ProjectionError>>;

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
