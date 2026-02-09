import mapshaper from 'mapshaper';

import type { FeatureCollection } from 'geojson';

import type { Result } from './result';
import type { SimplifiedGeometry } from './contracts';
import { ProcessingError } from './errors';
import type { SimplifyShapefile } from './pipeline';

/**
 * Simplify and project a validated shapefile to GeoJSON.
 *
 * Uses mapshaper to clean, snap, fix geometry, project to WGS84,
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
				`Mapshaper simplification failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
				{ cause: err instanceof Error ? err : undefined },
			),
		};
	}

	const rawJson = output['output.geojson'];
	if (!rawJson || typeof rawJson !== 'string') {
		return {
			ok: false,
			error: new ProcessingError(
				'Mapshaper returned no GeoJSON output (expected output.geojson)',
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
				`Failed to parse mapshaper GeoJSON output: ${err instanceof Error ? err.message : 'Unknown error'}`,
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
