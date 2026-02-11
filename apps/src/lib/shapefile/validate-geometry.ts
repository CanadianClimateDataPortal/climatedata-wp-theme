
/**
 * @file
 *
 * IMPORTANT — STUB FILE. Avoid modifying.
 *
 * The body of this function is scaffolding only. A follow-up PR will
 * replace the stub output with a real client-side geometry inspection.
 * Keep changes minimal to avoid merge conflicts with that work.
 *
 * Do not reference dependency names in comments or error messages.
 * Describe operations and contracts, not the library that implements them.
 *
 * @see [[LLM-Context-ClimateData-Ticket-CLIM-1267-Client-Side-Escaped-Defect]]
 */

/**
 * @file
 *
 * Shapefile geometry type validation.
 *
 * Inspects the extracted shapefile to determine the geometry type.
 * Only polygon geometries are accepted for ClimateData's custom
 * region uploads.
 *
 * @see {@link ./pipeline.ts} for the type signature
 * @see {@link ./extraction.ts} for the preceding pipeline stage
 */

import {
	type Result,
} from './result';
import {
	type GeometryType,
	type ValidatedShapefile,
} from './contracts';
import {
	InvalidGeometryTypeError,
	ProcessingError,
} from './errors';
import {
	type ValidateShapefileGeometry,
} from './pipeline';

/**
 * Layer info from geometry inspection.
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
	// --- TEMPORARY DEBUG (CLIM-1267) ---
	console.log('[SHAPEFILE DEBUG] validate-geometry: starting');
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const _win = typeof window !== 'undefined' ? (window as any) : null;
	console.log('[SHAPEFILE DEBUG] validate-geometry: window.modules keys =',
		_win?.modules ? Object.keys(_win.modules) : 'NO window.modules');

	// 1. Build filename input to be validated
	const input = {
		'file.shp': shapefile['file.shp'],
		'file.prj': shapefile['file.prj'],
	};
	console.log('[SHAPEFILE DEBUG] validate-geometry: input shp =', input['file.shp'] instanceof ArrayBuffer ? `ArrayBuffer(${input['file.shp'].byteLength})` : typeof input['file.shp'],
		', prj =', typeof input['file.prj'], input['file.prj']?.length, 'chars');

	// 2. Run initial check
	// Lazy-load mapshaper (only when actually needed, not at page load)
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let mapshaper: any;
	try {
		const mod = await import('mapshaper');
		mapshaper = mod.default;
		console.log('[SHAPEFILE DEBUG] validate-geometry: mapshaper loaded, typeof =', typeof mapshaper);
		console.log('[SHAPEFILE DEBUG] validate-geometry: applyCommands =', typeof mapshaper?.applyCommands);
		console.log('[SHAPEFILE DEBUG] validate-geometry: mapshaper keys =', Object.keys(mapshaper || {}));
	} catch (importErr) {
		console.error('[SHAPEFILE DEBUG] validate-geometry: DYNAMIC IMPORT FAILED:', importErr);
		return {
			ok: false,
			error: new ProcessingError(
				`Failed to load mapshaper: ${importErr instanceof Error ? importErr.message : 'Unknown error'}`,
				{ cause: importErr instanceof Error ? importErr : undefined },
			),
		};
	}

	// 3. Run mapshaper -info command
	console.log('[SHAPEFILE DEBUG] validate-geometry: calling applyCommands("file.shp -info save-to=info")');
	let output: Record<string, string>;
	try {
		output = await mapshaper.applyCommands(
			'file.shp -info save-to=info',
			input,
		);
	} catch (err) {
		console.error('[SHAPEFILE DEBUG] validate-geometry: applyCommands THREW:', err);
		return {
			ok: false,
			error: new ProcessingError(
				`Validation Step Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
				{ cause: err instanceof Error ? err : undefined },
			),
		};
	}
	console.log('[SHAPEFILE DEBUG] validate-geometry: applyCommands returned, output keys =', Object.keys(output || {}));

	// 4. Parse info.json output
	const rawJson = output['info.json'];
	console.log('[SHAPEFILE DEBUG] validate-geometry: info.json exists =', !!rawJson, ', type =', typeof rawJson, ', length =', rawJson?.length);
	if (!rawJson || typeof rawJson !== 'string') {
		console.error('[SHAPEFILE DEBUG] validate-geometry: NO info.json in output! Keys:', Object.keys(output || {}));
		return {
			ok: false,
			error: new ProcessingError(
				'Validation Step Error: returned no info output (expected info.json)',
			),
		};
	}

	let layerInfoList: MapLayerInfo[];
	try {
		layerInfoList = JSON.parse(rawJson);
	} catch (err) {
		console.error('[SHAPEFILE DEBUG] validate-geometry: JSON.parse of info.json FAILED:', err, 'rawJson:', rawJson.substring(0, 200));
		return {
			ok: false,
			error: new ProcessingError(
				`Validation Step Error Failed to parse info output: ${err instanceof Error ? err.message : 'Unknown error'}`,
				{ cause: err instanceof Error ? err : undefined },
			),
		};
	}
	console.log('[SHAPEFILE DEBUG] validate-geometry: layerInfoList =', JSON.stringify(layerInfoList));

	// 5. Validate layer data exists
	if (!layerInfoList.length || !layerInfoList[0].geometry_type) {
		return {
			ok: false,
			error: new ProcessingError(
				'Validation Step Error: received no layer data or missing geometry_type',
			),
		};
	}

	// 6. Check geometry type — only Polygon is accepted
	const normalizedType = normalizeGeometryType(layerInfoList[0].geometry_type);
	console.log('[SHAPEFILE DEBUG] validate-geometry: geometry_type =', layerInfoList[0].geometry_type, '→ normalized =', normalizedType);

	if (normalizedType !== 'Polygon') {
		console.error('[SHAPEFILE DEBUG] validate-geometry: REJECTED geometry type:', normalizedType);
		return {
			ok: false,
			error: new InvalidGeometryTypeError(normalizedType),
		};
	}

	// 7. Return branded ValidatedShapefile
	console.log('[SHAPEFILE DEBUG] validate-geometry: SUCCESS — polygon geometry confirmed');
	const validated = shapefile as unknown as ValidatedShapefile;
	return { ok: true, value: validated };
};
