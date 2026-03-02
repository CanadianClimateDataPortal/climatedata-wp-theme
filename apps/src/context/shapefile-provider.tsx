import React, { createContext, useMemo } from 'react';
import { ActorRefFrom } from 'xstate';
import { useActorRef } from '@xstate/react';

import {
	createAsyncPipelineServices,
	PipelineServices,
	shapefileMachine,
	type FinchShapeParameter,
	type PrepareFinchPayload,
	type ValidatedShapes,
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

const validateSelectedArea: ValidateSelectedArea = (shapes) => {
	// In this mock, we let the region pass validation as is
	const validated = Object.assign(
		[...shapes],
		{ __areaValidated: Symbol('areaValidated') },
	) as unknown as ValidatedShapes;

	return { ok: true as const, value: validated };
};

const prepareFinchPayload: PrepareFinchPayload = (shapes) => {
	return {
		type: 'FeatureCollection',
		features: shapes.map((s) => s.feature),
	} as FinchShapeParameter;
};

/*
 * !! END TEMPORARY
 */

const services: PipelineServices = {
	...createAsyncPipelineServices(),
	validateSelectedArea,
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
