import React, { createContext, useMemo } from 'react';
import { ActorRefFrom } from 'xstate';
import { useActorRef } from '@xstate/react';

import {
	loadShapeFile,
	PipelineServices,
	shapefileMachine,
} from '@/lib/shapefile';
import { Result } from '@/lib/shapefile/result';
import {
	ConvertToDisplayableShapes,
	ExtractShapefileFromZip,
	PrepareFinchPayload,
	TransformToTopoJSON,
	ValidateSelectedArea,
	ValidateShapefileGeometry,
} from '@/lib/shapefile/pipeline';
import {
	FinchShapeParameter,
	type SimplifiedTopoJSON,
	type ValidatedRegion,
	ValidatedShapefile,
} from '@/lib/shapefile/contracts';

type ShapefileMachine = typeof shapefileMachine;
type ShapefileActor = ActorRefFrom<ShapefileMachine>;

type ShapefileContextValue = {
	actor: ShapefileActor;
};

/*
 * !! TEMPORARY: mock services are defined here. To be replaced with final implementation.
 */

function ok<T, E extends Error = never>(value: T): Result<T, E> {
	return { ok: true, value };
}
function err<T = never, E extends Error = Error>(error: E): Result<T, E> {
	return { ok: false, error };
}

const extractShapefileFromZip: ExtractShapefileFromZip = async (file) => {
	try {
		const shapeFileData = await loadShapeFile(file);
		return ok(shapeFileData);
	} catch (error) {
		const effectiveError = error as Error;
		return err(effectiveError);
	}
}

const validateShapefileGeometry: ValidateShapefileGeometry = async (
	shapefile,
) => {
	await new Promise(resolve => setTimeout(resolve, 1000))
	const validatedShapefile = shapefile as ValidatedShapefile;
	return ok(validatedShapefile);
}

const transformToTopoJSON: TransformToTopoJSON = async() => {
	const simpleTopo = {
		topology: {
			type: 'Topology',
			objects: {},
			arcs: [],
		},
		originalFeatureCount: 1,
		simplifiedFeatureCount: 1,
	} as SimplifiedTopoJSON;

	return ok(simpleTopo);
}

const convertToDisplayableShapes: ConvertToDisplayableShapes = () => {
	return ok({
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
	});
}

const validateSelectedArea: ValidateSelectedArea = () => {
	const validated = {
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
		areaFormatted: '5,000 km²',
		__areaValidated: Symbol('areaValidated'),
	} as unknown as ValidatedRegion;

	return ok(validated);
}

const prepareFinchPayload: PrepareFinchPayload = () => {
	return {
		type: 'FeatureCollection',
		features: [{
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
		}],
	} as FinchShapeParameter;
}

/*
 * !! END TEMPORARY
 */

const services: PipelineServices = {
	extractShapefileFromZip,
	validateShapefileGeometry,
	transformToTopoJSON,
	convertToDisplayableShapes,
	validateSelectedArea,
	prepareFinchPayload,
}

const ShapefileContext = createContext<ShapefileContextValue | null>(null);

/**
 * Provider giving access to a singleton instance of the shapefile state machine.
 *
 * Required to be able to use the `useShapefile` hook.
 */
function ShapefileProvider({ children }: React.PropsWithChildren) {
	const actor = useActorRef(shapefileMachine, { input: services });

	const value = useMemo<ShapefileContextValue>(() => ({ actor }), [actor]);

	return (
		<ShapefileContext.Provider value={value}>
			{children}
		</ShapefileContext.Provider>
	);
}

export {
	ShapefileProvider,
	ShapefileContext,
	type ShapefileContextValue,
};
