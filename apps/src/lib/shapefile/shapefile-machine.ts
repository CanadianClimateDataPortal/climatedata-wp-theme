/**
 * XState v5 machine definition for the shapefile upload pipeline.
 *
 * Pure state machine — no React, no DOM, no implementation logic.
 * All pipeline functions (async and sync) are injected via machine input,
 * keeping this file free of side effects and fully testable.
 *
 * @see {@link ./contracts.ts} — data shapes
 * @see {@link ./pipeline.ts} — function type signatures
 * @see {@link ./errors.ts} — error types
 * @see {@link ./result.ts} — Result<T, E>
 */

import { assign, fromPromise, setup } from 'xstate';

import type { Feature, Polygon } from 'geojson';

import type { Result } from '@/lib/shapefile/result';
import type {
	AreaConstraints,
	AreaValidationResult,
	DisplayableShapes,
	ExtractedShapefile,
	FinchShapeParameter,
	SelectedRegion,
	SimplifiedGeometry,
	ValidatedRegion,
	ValidatedShapefile,
} from '@/lib/shapefile/contracts';
import { DEFAULT_AREA_CONSTRAINTS } from '@/lib/shapefile/contracts';
import type {
	ExtractShapefileFromZip,
	PrepareFinchPayload,
	SimplifyShapefile,
	ValidateSelectedArea,
	ValidateShapefileGeometry,
} from '@/lib/shapefile/pipeline';
import type {
	ProcessingError,
	ProjectionError,
	InvalidGeometryTypeError,
} from '@/lib/shapefile/errors';

// ============================================================================
// SERVICES (injected pipeline functions)
// ============================================================================

export type PipelineServices = {
	// Async (invoked as actors)
	extractShapefileFromZip: ExtractShapefileFromZip;
	validateShapefileGeometry: ValidateShapefileGeometry;
	simplifyShapefile: SimplifyShapefile;
	// Sync (called in actions)
	validateSelectedArea: ValidateSelectedArea;
	prepareFinchPayload: PrepareFinchPayload;
};

// ============================================================================
// CONTEXT
// ============================================================================

export type MachineContext = {
	file: File | null;
	extractedShapefile: ExtractedShapefile | null;
	validatedShapefile: ValidatedShapefile | null;
	simplifiedGeometry: SimplifiedGeometry | null;
	displayableShapes: DisplayableShapes | null;
	selectedRegion: SelectedRegion | null;
	validatedRegion: ValidatedRegion | null;
	finchPayload: FinchShapeParameter | null;
	areaValidationResult: AreaValidationResult | null;
	error: Error | null;
	areaConstraints: AreaConstraints;
	/**
	 * Injected pipeline functions — async actors and sync actions.
	 *
	 * @remarks
	 * Storing functions in context means snapshots are not serializable.
	 * This is acceptable as long as we don't need to persist/rehydrate state.
	 */
	services: PipelineServices;
};

function initialContext(services: PipelineServices): MachineContext {
	return {
		file: null,
		extractedShapefile: null,
		validatedShapefile: null,
		simplifiedGeometry: null,
		displayableShapes: null,
		selectedRegion: null,
		validatedRegion: null,
		finchPayload: null,
		areaValidationResult: null,
		error: null,
		areaConstraints: DEFAULT_AREA_CONSTRAINTS,
		services,
	};
}

/** Clear downstream pipeline data, preserving services and constraints. */
function downstreamReset(): Partial<MachineContext> {
	return {
		extractedShapefile: null,
		validatedShapefile: null,
		simplifiedGeometry: null,
		displayableShapes: null,
		selectedRegion: null,
		validatedRegion: null,
		finchPayload: null,
		areaValidationResult: null,
		error: null,
	};
}

// ============================================================================
// EVENTS
// ============================================================================

export type MachineEvent =
	| { type: 'FILE_SELECTED'; file: File }
	| { type: 'SHAPE_CLICKED'; region: SelectedRegion }
	| { type: 'RESET' };

// ============================================================================
// INPUT
// ============================================================================

export type MachineInput = PipelineServices;

// ============================================================================
// MACHINE
// ============================================================================

export const shapefileMachine = setup({
	types: {
		context: {} as MachineContext,
		events: {} as MachineEvent,
		input: {} as MachineInput,
	},

	actors: {
		extractShapefileFromZip: fromPromise<
			Result<ExtractedShapefile, Error>,
			{ fn: ExtractShapefileFromZip; file: File }
		>(({ input }) => input.fn(input.file)),

		validateShapefileGeometry: fromPromise<
			Result<ValidatedShapefile, InvalidGeometryTypeError | ProcessingError>,
			{ fn: ValidateShapefileGeometry; shapefile: ExtractedShapefile }
		>(({ input }) => input.fn(input.shapefile)),

		simplifyShapefile: fromPromise<
			Result<SimplifiedGeometry, ProcessingError | ProjectionError>,
			{ fn: SimplifyShapefile; shapefile: ValidatedShapefile }
		>(({ input }) => input.fn(input.shapefile)),
	},

	guards: {
		isResultOk: (_, params: { result: Result<unknown, Error> }) =>
			params.result.ok,
		isAreaValid: ({ context }) => context.validatedRegion !== null,
		hasConversionError: ({ context }) =>
			context.error !== null && context.displayableShapes === null,
	},

	actions: {
		resetContext: assign(({ context }) => initialContext(context.services)),
		assignFile: assign(({ event }) => {
			if (event.type !== 'FILE_SELECTED') return {};
			return {
				...downstreamReset(),
				file: event.file,
			};
		}),
		runDisplayConversion: assign(({ context }) => {
			// Simplified GeoJSON is already available in context.
			// UI layer reads simplifiedGeometry directly.
			// Keep displayableShapes for compatibility, populate trivially.
			const geometry = context.simplifiedGeometry!;
			// Type assertion safe: validation confirmed all features are polygons
			const shapes = geometry.featureCollection.features.map((feature, index) => ({
				id: `shape-${index}`,
				feature: feature as Feature<Polygon>,
				areaKm2: 0, // Area computation deferred to CLIM-1270
			}));
			const bounds = geometry.featureCollection.bbox as
				| [number, number, number, number]
				| undefined;
			return {
				displayableShapes: {
					shapes,
					bounds: bounds ?? [0, 0, 0, 0],
					totalCount: shapes.length,
				},
				error: null,
			};
		}),
		runSelectionValidation: assign(({ context, event }) => {
			if (event.type !== 'SHAPE_CLICKED') return {};

			const region = event.region;
			const areaResult = context.services.validateSelectedArea(
				region,
				context.areaConstraints
			);

			if (areaResult.ok) {
				const finchPayload = context.services.prepareFinchPayload(
					areaResult.value,
				);
				return {
					selectedRegion: region,
					validatedRegion: areaResult.value,
					finchPayload,
					areaValidationResult: {
						status: 'valid' as const,
						areaKm2: region.areaKm2,
						constraints: context.areaConstraints,
					},
					error: null,
				};
			}

			const isTooSmall = region.areaKm2 < context.areaConstraints.minKm2;
			return {
				selectedRegion: region,
				validatedRegion: null,
				finchPayload: null,
				areaValidationResult: {
					status: isTooSmall
						? ('too-small' as const)
						: ('too-large' as const),
					areaKm2: region.areaKm2,
					constraints: context.areaConstraints,
					errorMessageKey: isTooSmall
						? ('area-too-small' as const)
						: ('area-too-large' as const),
				},
				error: areaResult.error,
			};
		}),
	},
}).createMachine({
	id: 'shapefile',
	context: ({ input }) => initialContext(input),
	initial: 'idle',

	states: {
		idle: {
			on: {
				FILE_SELECTED: {
					target: 'extracting',
					actions: 'assignFile',
				},
				RESET: { target: 'idle', actions: 'resetContext' },
			},
		},

		extracting: {
			invoke: {
				src: 'extractShapefileFromZip',
				input: ({ context }) => ({
					fn: context.services.extractShapefileFromZip,
					file: context.file!,
				}),
				onDone: [
					{
						guard: {
							type: 'isResultOk',
							params: ({ event }) => ({ result: event.output }),
						},
						target: 'validating',
						actions: assign(({ event }) => {
							const output = event.output;
							return output.ok
								? { extractedShapefile: output.value }
								: {};
						}),
					},
					{
						target: 'idle',
						actions: assign(({ event }) => {
							const output = event.output;
							return output.ok ? {} : { error: output.error };
						}),
					},
				],
			},
			on: { RESET: { target: 'idle', actions: 'resetContext' } },
		},

		validating: {
			invoke: {
				src: 'validateShapefileGeometry',
				input: ({ context }) => ({
					fn: context.services.validateShapefileGeometry,
					shapefile: context.extractedShapefile!,
				}),
				onDone: [
					{
						guard: {
							type: 'isResultOk',
							params: ({ event }) => ({ result: event.output }),
						},
						target: 'transforming',
						actions: assign(({ event }) => {
							const output = event.output;
							return output.ok
								? { validatedShapefile: output.value }
								: {};
						}),
					},
					{
						target: 'idle',
						actions: assign(({ event }) => {
							const output = event.output;
							return output.ok ? {} : { error: output.error };
						}),
					},
				],
			},
			on: { RESET: { target: 'idle', actions: 'resetContext' } },
		},

		transforming: {
			invoke: {
				src: 'simplifyShapefile',
				input: ({ context }) => ({
					fn: context.services.simplifyShapefile,
					shapefile: context.validatedShapefile!,
				}),
				onDone: [
					{
						guard: {
							type: 'isResultOk',
							params: ({ event }) => ({ result: event.output }),
						},
						target: 'displaying',
						actions: assign(({ event }) => {
							const output = event.output;
							return output.ok
								? { simplifiedGeometry: output.value }
								: {};
						}),
					},
					{
						target: 'idle',
						actions: assign(({ event }) => {
							const output = event.output;
							return output.ok ? {} : { error: output.error };
						}),
					},
				],
			},
			on: { RESET: { target: 'idle', actions: 'resetContext' } },
		},

		displaying: {
			entry: 'runDisplayConversion',
			// Eventless transition: bail to idle if sync conversion failed
			always: [
				{
					guard: 'hasConversionError',
					target: 'idle',
				},
			],
			on: {
				SHAPE_CLICKED: {
					target: 'selected',
					actions: 'runSelectionValidation',
				},
				FILE_SELECTED: {
					target: 'extracting',
					actions: 'assignFile',
				},
				RESET: { target: 'idle', actions: 'resetContext' },
			},
		},

		// Transient routing state — never rests here.
		// Immediately evaluates area validation and routes forward or back.
		selected: {
			always: [
				{
					guard: 'isAreaValid',
					target: 'ready',
				},
				{
					// Area invalid — return to displaying with error preserved for UI
					target: 'displaying',
				},
			],
		},

		ready: {
			on: {
				SHAPE_CLICKED: {
					target: 'selected',
					actions: 'runSelectionValidation',
				},
				FILE_SELECTED: {
					target: 'extracting',
					actions: 'assignFile',
				},
				RESET: { target: 'idle', actions: 'resetContext' },
			},
		},
	},
});
