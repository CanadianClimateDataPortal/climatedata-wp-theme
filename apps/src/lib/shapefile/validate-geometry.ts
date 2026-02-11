/**
 * Shapefile geometry type validation.
 *
 * Inspects the extracted shapefile to determine the geometry type.
 * Only polygon geometries are accepted for ClimateData's custom
 * region uploads.
 *
 * @see {@link ./pipeline.ts} for the type signature
 * @see {@link ./extraction.ts} for the preceding pipeline stage
 */

import mapshaper from 'mapshaper';

import type { Result } from '@/lib/shapefile/result';
import type {
	GeometryType,
	ValidatedShapefile,
} from '@/lib/shapefile/contracts';
import {
	InvalidGeometryTypeError,
	ProcessingError,
} from '@/lib/shapefile/errors';
import type { ValidateShapefileGeometry } from '@/lib/shapefile/pipeline';

/**
 * Layer info structure returned by `-info save-to=info`.
 *
 * Only the fields we inspect are typed here.
 */
interface MapLayerInfo {
	/** Geometry type in lowercase (e.g. 'polygon', 'point', 'polyline') */
	geometry_type: string | null;
	/** Number of features in the layer */
	feature_count: number;
}

/**
 * Normalize geometry type to the PascalCase
 * convention used in our GeometryType contract.
 *
 * @example
 * normalizeGeometryType('polygon')  // 'Polygon'
 * normalizeGeometryType('polyline') // 'Polyline'
 */
const normalizeGeometryType = (
	rawType: string,
): GeometryType => {
	const normalized = rawType.charAt(0).toUpperCase()
		+ rawType.slice(1).toLowerCase();
	return normalized as GeometryType;
};

/**
 * Validate that an extracted shapefile contains polygon geometry.
 *
 * Rejects non-polygon geometry types (Point, Polyline, MultiPoint, etc.)
 * with an `InvalidGeometryTypeError`.
 *
 * @param shapefile - Previously extracted .shp and .prj data
 *
 * @returns Result with branded `ValidatedShapefile` on success,
 *   or `InvalidGeometryTypeError` / `ProcessingError` on failure
 *
 * @example
 * ```typescript
 * const result = await validateShapefileGeometry(extracted);
 *
 * if (result.ok) {
 *   // result.value is ValidatedShapefile — safe to transform
 * } else if (result.error instanceof InvalidGeometryTypeError) {
 *   console.error(`Wrong type: ${result.error.geometryType}`);
 * }
 * ```
 *
 * @see {@link ./pipeline.ts} for the type signature
 * @see {@link https://github.com/mbloch/mapshaper/wiki/Using-mapshaper-programmatically Mapshaper programmatic API}
 */
export const validateShapefileGeometry: ValidateShapefileGeometry = async (
	shapefile,
): Promise<Result<ValidatedShapefile, InvalidGeometryTypeError | ProcessingError>> => {
	// 1. Build filename input to be validated
	const input = {
		'file.shp': shapefile['file.shp'],
		'file.prj': shapefile['file.prj'],
	};

	// 2. Run initial check
	let output: Record<string, string>;
	try {
		output = await mapshaper.applyCommands(
			'file.shp -info save-to=info',
			input,
		);
	} catch (err) {
		return {
			ok: false,
			error: new ProcessingError(
				`Validation Step 1 Failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
				{ cause: err instanceof Error ? err : undefined },
			),
		};
	}

	// 3. Parse info.json output
	const rawJson = output['info.json'];
	if (!rawJson || typeof rawJson !== 'string') {
		return {
			ok: false,
			error: new ProcessingError(
				'Validation Step 2 Missing info output (expected info.json)',
			),
		};
	}

	let layerInfoList: MapLayerInfo[];
	try {
		layerInfoList = JSON.parse(rawJson);
	} catch (err) {
		return {
			ok: false,
			error: new ProcessingError(
				`Validation Step 3 Failed to parse: ${err instanceof Error ? err.message : 'Unknown error'}`,
				{ cause: err instanceof Error ? err : undefined },
			),
		};
	}

	// 4. Validate layer data exists
	if (!layerInfoList.length || !layerInfoList[0].geometry_type) {
		return {
			ok: false,
			error: new ProcessingError(
				'Validation Step 4 No layer data or missing geometry_type',
			),
		};
	}

	// 5. Check geometry type — only Polygon is accepted
	const normalizedType = normalizeGeometryType(layerInfoList[0].geometry_type);

	if (normalizedType !== 'Polygon') {
		return {
			ok: false,
			error: new InvalidGeometryTypeError(normalizedType),
		};
	}

	// 6. Return branded ValidatedShapefile
	const validated = shapefile as unknown as ValidatedShapefile;
	return { ok: true, value: validated };
};
