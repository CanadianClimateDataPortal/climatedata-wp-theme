import React, { createContext, useMemo } from 'react';
import { ActorRefFrom } from 'xstate';
import { useActorRef } from '@xstate/react';

import {
	createAsyncPipelineServices,
	PipelineServices,
	shapefileMachine,
	validateSelectedArea,
} from '@/lib/shapefile';

type ShapefileMachine = typeof shapefileMachine;
type ShapefileActor = ActorRefFrom<ShapefileMachine>;

type ShapefileContextValue = {
	actor: ShapefileActor;
};

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
