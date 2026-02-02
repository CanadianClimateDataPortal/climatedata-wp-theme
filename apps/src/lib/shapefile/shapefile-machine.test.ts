/**
 * Two introductory test suites for the shapefile XState v5 machine.
 *
 * These demonstrate the testing pattern, not full coverage.
 * XState v5 testing uses createActor() + waitFor() for async states,
 * and direct snapshot inspection for sync transitions.
 *
 * @see https://stately.ai/docs/testing
 */

import { describe, it, expect, vi } from 'vitest';
import { createActor, waitFor } from 'xstate';

import type { PipelineServices } from '@/lib/shapefile/shapefile-machine';
import { shapefileMachine } from '@/lib/shapefile/shapefile-machine';
import type {
	DisplayableShapes,
	ExtractedShapefile,
	FinchShapeParameter,
	SelectedRegion,
	SimplifiedTopoJSON,
	ValidatedRegion,
	ValidatedShapefile,
} from '@/lib/shapefile/contracts';

// ============================================================================
// FIXTURES
// ============================================================================

/**
 * Minimal stub data for each pipeline stage.
 * Just enough shape to satisfy the types — no real geometry.
 */
const STUB_EXTRACTED: ExtractedShapefile = {
	'file.shp': new ArrayBuffer(8),
	'file.prj': 'GEOGCS["GCS_WGS_1984"]',
};

const STUB_VALIDATED = {
	...STUB_EXTRACTED,
	__validated: Symbol('validated'),
} as unknown as ValidatedShapefile;

const STUB_TOPOJSON: SimplifiedTopoJSON = {
	topology: {
		type: 'Topology',
		objects: {},
		arcs: [],
	},
	originalFeatureCount: 1,
	simplifiedFeatureCount: 1,
};

const STUB_DISPLAYABLE: DisplayableShapes = {
	shapes: [
		{
			id: 'shape-1',
			feature: {
				type: 'Feature',
				geometry: {
					type: 'Polygon',
					coordinates: [
						[
							[-75, 45],
							[-74, 45],
							[-74, 46],
							[-75, 46],
							[-75, 45],
						],
					],
				},
				properties: {},
			},
			areaKm2: 5000,
		},
	],
	bounds: [-75, 45, -74, 46],
	totalCount: 1,
};

const STUB_REGION: SelectedRegion = {
	id: 'shape-1',
	feature: STUB_DISPLAYABLE.shapes[0].feature,
	areaKm2: 5000,
	areaFormatted: '5,000 km²',
};

const STUB_VALIDATED_REGION = {
	...STUB_REGION,
	__areaValidated: Symbol('areaValidated'),
} as unknown as ValidatedRegion;

const STUB_FINCH_PAYLOAD: FinchShapeParameter = {
	type: 'FeatureCollection',
	features: [STUB_REGION.feature],
};

// ============================================================================
// SERVICE STUBS
// ============================================================================

/**
 * Build a complete PipelineServices where every function succeeds.
 * Each function is a vi.fn() so we can assert call counts.
 */
function createHappyServices(): PipelineServices {
	return {
		extractShapefileFromZip: vi.fn().mockResolvedValue({
			ok: true,
			value: STUB_EXTRACTED,
		}),
		validateShapefileGeometry: vi.fn().mockResolvedValue({
			ok: true,
			value: STUB_VALIDATED,
		}),
		transformToTopoJSON: vi.fn().mockResolvedValue({
			ok: true,
			value: STUB_TOPOJSON,
		}),
		convertToDisplayableShapes: vi.fn().mockReturnValue({
			ok: true,
			value: STUB_DISPLAYABLE,
		}),
		validateSelectedArea: vi.fn().mockReturnValue({
			ok: true,
			value: STUB_VALIDATED_REGION,
		}),
		prepareFinchPayload: vi.fn().mockReturnValue(STUB_FINCH_PAYLOAD),
	};
}

// ============================================================================
// HAPPY PATH
// ============================================================================

describe('shapefile machine — happy path', () => {
	it('starts in idle', () => {
		const services = createHappyServices();
		const actor = createActor(shapefileMachine, { input: services });
		actor.start();

		expect(actor.getSnapshot().value).toBe('idle');

		actor.stop();
	});

	it('FILE_SELECTED → extracting → validating → transforming → displaying', async () => {
		const services = createHappyServices();
		const actor = createActor(shapefileMachine, { input: services });
		actor.start();

		// Send the file — machine enters extracting, then async pipeline runs
		actor.send({
			type: 'FILE_SELECTED',
			file: new File([], 'test.zip'),
		});

		// waitFor blocks until the machine reaches 'displaying'
		// (all 3 async stages resolve with ok: true)
		const snapshot = await waitFor(
			actor,
			(state) => state.matches('displaying'),
		);

		// Machine reached displaying
		expect(snapshot.value).toBe('displaying');

		// Each async service was called once
		expect(services.extractShapefileFromZip).toHaveBeenCalledOnce();
		expect(services.validateShapefileGeometry).toHaveBeenCalledOnce();
		expect(services.transformToTopoJSON).toHaveBeenCalledOnce();

		// Sync display conversion ran on entry
		expect(services.convertToDisplayableShapes).toHaveBeenCalledOnce();

		// Context has the pipeline results
		expect(snapshot.context.displayableShapes).toBe(STUB_DISPLAYABLE);
		expect(snapshot.context.error).toBeNull();

		actor.stop();
	});

	it('SHAPE_CLICKED with valid area → ready with finchPayload', async () => {
		const services = createHappyServices();
		const actor = createActor(shapefileMachine, { input: services });
		actor.start();

		// Drive to displaying first
		actor.send({
			type: 'FILE_SELECTED',
			file: new File([], 'test.zip'),
		});
		await waitFor(actor, (state) => state.matches('displaying'));

		// Click a shape — goes through transient 'selected' → 'ready'
		actor.send({
			type: 'SHAPE_CLICKED',
			region: STUB_REGION,
		});

		const snapshot = actor.getSnapshot();

		// 'selected' is transient — machine should already be in 'ready'
		expect(snapshot.value).toBe('ready');

		// Validation + payload services were called
		expect(services.validateSelectedArea).toHaveBeenCalledOnce();
		expect(services.prepareFinchPayload).toHaveBeenCalledOnce();

		// Context has the final payload
		expect(snapshot.context.finchPayload).toBe(STUB_FINCH_PAYLOAD);
		expect(snapshot.context.validatedRegion).toBe(STUB_VALIDATED_REGION);
		expect(snapshot.context.areaValidationResult?.status).toBe('valid');

		actor.stop();
	});
});

// ============================================================================
// ERROR PATH
// ============================================================================

describe('shapefile machine — error path', () => {
	it('extraction failure → idle with error in context', async () => {
		const extractionError = new Error('Not a valid ZIP file');

		const services = createHappyServices();
		// Override extraction to fail
		services.extractShapefileFromZip = vi.fn().mockResolvedValue({
			ok: false,
			error: extractionError,
		});

		const actor = createActor(shapefileMachine, { input: services });
		actor.start();

		actor.send({
			type: 'FILE_SELECTED',
			file: new File([], 'not-a-zip.txt'),
		});

		// Machine should return to idle after extraction fails
		const snapshot = await waitFor(
			actor,
			(state) => state.matches('idle'),
		);

		expect(snapshot.value).toBe('idle');
		expect(snapshot.context.error).toBe(extractionError);
		expect(snapshot.context.error?.message).toBe('Not a valid ZIP file');

		// Extraction was called, but downstream services were not
		expect(services.extractShapefileFromZip).toHaveBeenCalledOnce();
		expect(services.validateShapefileGeometry).not.toHaveBeenCalled();
		expect(services.transformToTopoJSON).not.toHaveBeenCalled();
		expect(services.convertToDisplayableShapes).not.toHaveBeenCalled();

		actor.stop();
	});

	it('RESET from any async state → idle with clean context', async () => {
		const services = createHappyServices();
		// Make extraction hang (never resolves) so we can RESET mid-flight
		services.extractShapefileFromZip = vi.fn().mockReturnValue(
			new Promise(() => {
				// intentionally never resolves
			}),
		);

		const actor = createActor(shapefileMachine, { input: services });
		actor.start();

		actor.send({
			type: 'FILE_SELECTED',
			file: new File([], 'test.zip'),
		});

		// Should be in extracting (waiting on the promise)
		expect(actor.getSnapshot().value).toBe('extracting');

		// RESET while extracting
		actor.send({ type: 'RESET' });

		const snapshot = actor.getSnapshot();
		expect(snapshot.value).toBe('idle');
		expect(snapshot.context.file).toBeNull();
		expect(snapshot.context.error).toBeNull();

		actor.stop();
	});
});
