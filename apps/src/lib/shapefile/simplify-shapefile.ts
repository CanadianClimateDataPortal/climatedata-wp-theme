
/**
 * @file
 *
 * IMPORTANT — STUB FILE. Avoid modifying.
 *
 * The body of this function is scaffolding only. A follow-up PR will
 * replace the stub output with a real client-side simplification pipeline.
 * Keep changes minimal to avoid merge conflicts with that work.
 *
 * Do not reference dependency names in comments or error messages.
 * Describe operations and contracts, not the library that implements them.
 *
 * @see [[LLM-Context-ClimateData-Ticket-CLIM-1267-Client-Side-Escaped-Defect]]
 */

import mapshaper from 'mapshaper';
import type { FeatureCollection } from 'geojson';

import type { Result } from './result';
import type { SimplifiedGeometry } from './contracts';
import { ProcessingError } from './errors';
import type { SimplifyShapefile } from './pipeline';

/**
 * Simplify and project a validated shapefile to GeoJSON.
 *
 * Clean, snap, fix geometry, project to WGS84,
 * and output as GeoJSON FeatureCollection.
 *
 * Legacy equivalent: `simplify_polygons()` in shapefile-upload.js:654-670
 *
 * @param shapefile - Previously validated .shp and .prj data
 *
 * @returns Result with `SimplifiedGeometry` on success,
 *   or `ProcessingError` on failure
 *
 * @example
 * ```typescript
 * const result = await simplifyShapefile(validated);
 *
 * if (result.ok) {
 *   // result.value.featureCollection is a GeoJSON FeatureCollection
 *   console.log(`${result.value.featureCount} features simplified`);
 * }
 * ```
 */
export const simplifyShapefile: SimplifyShapefile = async (
	shapefile,
): Promise<Result<SimplifiedGeometry, ProcessingError>> => {
	// --- TEMPORARY DEBUG (CLIM-1267) ---
	console.log('[SHAPEFILE DEBUG] simplify-shapefile: starting');

	const input = {
		'file.shp': shapefile['file.shp'],
		'file.prj': shapefile['file.prj'],
	};

	const cmd = [
		'-i file.shp encoding=utf-8',
		'-clean',
		'-snap precision=0.001 fix-geometry',
		'-proj wgs84',
		'-o format=geojson',
		'output.geojson',
	].join(' ');
	console.log('[SHAPEFILE DEBUG] simplify-shapefile: cmd =', cmd);

	// Lazy-load mapshaper (only when actually needed, not at page load)
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let mapshaper: any;
	try {
		const mod = await import('mapshaper');
		mapshaper = mod.default;
		console.log('[SHAPEFILE DEBUG] simplify-shapefile: mapshaper loaded');
	} catch (importErr) {
		console.error('[SHAPEFILE DEBUG] simplify-shapefile: DYNAMIC IMPORT FAILED:', importErr);
		return {
			ok: false,
			error: new ProcessingError(
				`Failed to load mapshaper: ${importErr instanceof Error ? importErr.message : 'Unknown error'}`,
				{ cause: importErr instanceof Error ? importErr : undefined },
			),
		};
	}

	console.log('[SHAPEFILE DEBUG] simplify-shapefile: calling applyCommands');
	let output: Record<string, string>;
	try {
		output = await mapshaper.applyCommands(
			cmd,
			input,
		);
	} catch (err) {
		console.error('[SHAPEFILE DEBUG] simplify-shapefile: applyCommands THREW:', err);
		return {
			ok: false,
			error: new ProcessingError(
				`Simplification Step Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
				{ cause: err instanceof Error ? err : undefined },
			),
		};
	}
	console.log('[SHAPEFILE DEBUG] simplify-shapefile: applyCommands returned, output keys =', Object.keys(output || {}));

	const rawJson = output['output.geojson'];
	console.log('[SHAPEFILE DEBUG] simplify-shapefile: output.geojson exists =', !!rawJson, ', length =', rawJson?.length);
	if (!rawJson || typeof rawJson !== 'string') {
		console.error('[SHAPEFILE DEBUG] simplify-shapefile: NO output.geojson! Keys:', Object.keys(output || {}));
		return {
			ok: false,
			error: new ProcessingError(
				'Simplification Step Error Receiving no GeoJSON output',
			),
		};
	}

	let featureCollection: FeatureCollection;
	try {
		featureCollection = JSON.parse(rawJson);
	} catch (err) {
		console.error('[SHAPEFILE DEBUG] simplify-shapefile: JSON.parse FAILED:', err);
		return {
			ok: false,
			error: new ProcessingError(
				`Simplification Step Failed to parse GeoJSON output: ${err instanceof Error ? err.message : 'Unknown error'}`,
				{ cause: err instanceof Error ? err : undefined },
			),
		};
	}

	console.log('[SHAPEFILE DEBUG] simplify-shapefile: SUCCESS —', featureCollection.features?.length ?? 0, 'features');
	return {
		ok: true,
		value: {
			featureCollection,
			featureCount: featureCollection.features?.length ?? 0,
		},
	};
};
