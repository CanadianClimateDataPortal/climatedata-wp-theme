
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

	// Lazy-load mapshaper (only when actually needed, not at page load)
	const mapshaper = (await import('mapshaper')).default;

	let output: Record<string, string>;
	try {
		output = await mapshaper.applyCommands(
			cmd,
			input,
		);
	} catch (err) {
		return {
			ok: false,
			error: new ProcessingError(
				`Simplification Step Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
				{ cause: err instanceof Error ? err : undefined },
			),
		};
	}

	const rawJson = output['output.geojson'];
	if (!rawJson || typeof rawJson !== 'string') {
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
		return {
			ok: false,
			error: new ProcessingError(
				`Simplification Step Failed to parse GeoJSON output: ${err instanceof Error ? err.message : 'Unknown error'}`,
				{ cause: err instanceof Error ? err : undefined },
			),
		};
	}

	return {
		ok: true,
		value: {
			featureCollection,
			featureCount: featureCollection.features?.length ?? 0,
		},
	};
};
