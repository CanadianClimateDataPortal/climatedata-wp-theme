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

import { computeAreaKm2 } from './compute-area';
import { computeNbPositions } from './compute-nb-positions';
import {
	type Result,
} from './result';
import {
	type ShapesConstraints,
	type ShapesValidationResult,
	type DisplayableShape,
	type DisplayableShapes,
	type ExtractedShapefile,
	type FinchShapeParameter,
	type SimplifiedGeometry,
	type ValidatedShapes,
	type ValidatedShapefile,
	DEFAULT_SHAPES_CONSTRAINTS,
} from './contracts';
import {
	type ExtractShapefileFromZip,
	type PrepareFinchPayload,
	type SimplifyShapefile,
	type ValidateSelectedShapes,
	type ValidateShapefileGeometry,
} from './pipeline';
import {
	type ProcessingError,
	type ProjectionError,
	type InvalidGeometryTypeError,
} from './errors';

// ============================================================================
// SERVICES (injected pipeline functions)
// ============================================================================

export type PipelineServices = {
	// Async (invoked as actors)
	extractShapefileFromZip: ExtractShapefileFromZip;
	validateShapefileGeometry: ValidateShapefileGeometry;
	simplifyShapefile: SimplifyShapefile;
	// Sync (called in actions)
	validateSelectedShapes: ValidateSelectedShapes;
	prepareFinchPayload: PrepareFinchPayload;
};

// ============================================================================
// CONTEXT
// ============================================================================

/**
 * Structured warning from pipeline processing.
 *
 * Produced during extraction when orphan .shp files are skipped.
 * Future pipeline stages may add warnings using the same shape.
 */
export type PipelineWarning = {
	code: string;
	message: string;
};

export type MachineContext = {
	file: File | null;
	extractedShapefile: ExtractedShapefile | null;
	validatedShapefile: ValidatedShapefile | null;
	simplifiedGeometry: SimplifiedGeometry | null;
	displayableShapes: DisplayableShapes | null;
	selectedShapes: Pick<DisplayableShape, 'id' | 'areaKm2'>[];
	validatedShapes: ValidatedShapes | null;
	finchPayload: FinchShapeParameter | null;
	shapesValidationResult: ShapesValidationResult | null;
	error: Error | null;
	shapesConstraints: ShapesConstraints;
	warnings: PipelineWarning[];
	/**
	 * Injected pipeline functions — async actors and sync actions.
	 *
	 * @remarks
	 * Storing functions in context means snapshots are not serializable.
	 * This is acceptable as long as we don't need to persist/rehydrate state.
	 */
	services: PipelineServices;
};

const initialContext = (
	services: PipelineServices,
): MachineContext => ({
	file: null,
	extractedShapefile: null,
	validatedShapefile: null,
	simplifiedGeometry: null,
	displayableShapes: null,
	selectedShapes: [],
	validatedShapes: null,
	finchPayload: null,
	shapesValidationResult: null,
	error: null,
	shapesConstraints: DEFAULT_SHAPES_CONSTRAINTS,
	warnings: [],
	services,
});

/** Clear downstream pipeline data, preserving services and constraints. */
const downstreamReset = (): Partial<MachineContext> => ({
	extractedShapefile: null,
	validatedShapefile: null,
	simplifiedGeometry: null,
	displayableShapes: null,
	selectedShapes: [],
	validatedShapes: null,
	finchPayload: null,
	shapesValidationResult: null,
	error: null,
	warnings: [],
});

// ============================================================================
// EVENTS
// ============================================================================

export type MachineEvent =
	| { type: 'FILE_SELECTED'; file: File }
	| { type: 'SHAPE_CLICKED'; shapeId: string }
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
		areShapesValid: ({ context }) => context.validatedShapes !== null,
		hasConversionError: ({ context }) =>
			context.error !== null && context.displayableShapes === null,
	},

	actions: {
		resetContext: assign(({ context }) => initialContext(context.services)),
		assignFile: assign(({ event }) => {
			if (event.type !== 'FILE_SELECTED') {
				return {};
			}
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
				areaKm2: computeAreaKm2(feature as Feature<Polygon>),
				nbPositions: computeNbPositions(feature as Feature<Polygon>),
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
			};
		}),
		runSelectionValidation: assign(({ context, event }) => {
			if (event.type !== 'SHAPE_CLICKED') {
				return {};
			}

			const shapeId = event.shapeId;
			const shape = context.displayableShapes?.shapes.find(
				(s) => s.id === shapeId,
			);
			if (!shape) {
				return {};
			}

			const selectedShapes: Pick<DisplayableShape, 'id' | 'areaKm2'>[] = [
				{ id: shape.id, areaKm2: shape.areaKm2 },
			];

			const shapesResult = context.services.validateSelectedShapes(
				[shape],
				context.shapesConstraints,
			);

			if (shapesResult.ok) {
				const validatedShapes = shapesResult.value;
				const finchPayload = context.services.prepareFinchPayload(
					validatedShapes,
				);
				return {
					selectedShapes,
					validatedShapes,
					finchPayload,
					shapesValidationResult: {
						status: 'valid' as const,
						areaKm2: shape.areaKm2,
						nbPositions: shape.nbPositions,
						constraints: context.shapesConstraints,
					},
					error: null,
				};
			}

			const isTooSmall = shape.areaKm2 < context.shapesConstraints.minKm2;
			const tooManyPositions = shape.nbPositions > context.shapesConstraints.maxPositions;
			return {
				selectedShapes,
				validatedShapes: null,
				finchPayload: null,
				shapesValidationResult: {
					status: isTooSmall
						? ('area-too-small' as const)
						: tooManyPositions
							? ('too-many-positions' as const)
							: ('area-too-large' as const),
					areaKm2: shape.areaKm2,
					nbPositions: shape.nbPositions,
					constraints: context.shapesConstraints,
					errorMessageKey: isTooSmall
						? ('area-too-small' as const)
						: tooManyPositions
							? ('too-many-positions' as const)
							: ('area-too-large' as const),
				},
				error: shapesResult.error,
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
							if (!output.ok) {
								return {};
							}
							return {
								extractedShapefile: output.value,
								warnings: output.value.skippedEntries.map((e) => ({
									code: 'extraction/orphan-shp-skipped',
									message: `Skipped ${e.basename}.shp — ${e.reason}`,
								})),
							};
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
						actions: assign(({ context, event }) => {
							const output = event.output;
							if (!output.ok) {
								return {};
							}
							const validationWarnings = output.value.skippedEntries
								.filter((e) => !context.extractedShapefile?.skippedEntries.some(
									(existing) => existing.basename === e.basename,
								))
								.map((e) => ({
									code: 'validation/non-polygon-skipped',
									message: `${e.basename}.shp skipped — ${e.reason}`,
								}));
							return {
								validatedShapefile: output.value,
								warnings: [
									...context.warnings,
									...validationWarnings,
								],
							};
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
		// Immediately evaluates selected shapes validation and routes forward or back.
		selected: {
			always: [
				{
					guard: 'areShapesValid',
					target: 'ready',
				},
				{
					// Selected shapes invalid — return to displaying with error preserved for UI
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
