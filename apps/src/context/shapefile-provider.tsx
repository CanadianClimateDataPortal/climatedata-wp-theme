import React, { createContext, useMemo } from 'react';
import { ActorRefFrom } from 'xstate';
import { useActorRef } from '@xstate/react';

import type { Feature, Polygon } from 'geojson';

import {
	createAsyncPipelineServices,
	PipelineServices,
	shapefileMachine,
	type FinchShapeParameter,
	type PrepareFinchPayload,
	type ValidatedRegion,
	type ValidateSelectedArea,
} from '@/lib/shapefile';

type ShapefileMachine = typeof shapefileMachine;
type ShapefileActor = ActorRefFrom<ShapefileMachine>;

type ShapefileContextValue = {
	actor: ShapefileActor;
};

/*
 * !! TEMPORARY: mock sync services. To be replaced by CLIM-1270 and downstream.
 */

const validateSelectedArea: ValidateSelectedArea = () => {
	const validated = {
		id: 'stub-region',
		feature: {
			type: 'Feature' as const,
			geometry: {
				type: 'Polygon' as const,
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
		} as Feature<Polygon>,
		areaKm2: 5000,
		areaFormatted: '5,000 km²',
		__areaValidated: Symbol('areaValidated'),
	} as unknown as ValidatedRegion;

	return { ok: true as const, value: validated };
};

const prepareFinchPayload: PrepareFinchPayload = () => {
	return {
		type: 'FeatureCollection',
		features: [
			{
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
		],
	} as FinchShapeParameter;
};

/*
 * !! END TEMPORARY
 */

const services: PipelineServices = {
	...createAsyncPipelineServices(),
	validateSelectedArea,
	prepareFinchPayload,
};

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
