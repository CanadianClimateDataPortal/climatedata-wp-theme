import { useContext } from 'react';
import { useSelector } from '@xstate/react';

import {
	ShapefileContext,
	type ShapefileContextValue,
} from '@/context/shapefile-provider';
import { ShapefileLoadError } from '@/lib/shapefile';

export type UseShapefileHook = {
	file: File | null;
	isProcessingFile: boolean;
	isFileInvalid: boolean;
	reset: () => void;
	setFile: (file: File | null) => void;
};

/**
 * Hook providing access to various attributes and utilities to interact with the shapefile state machine.
 *
 * The <ShapefileProvider> must be included to be able to use this hook.
 */
export function useShapefile(): UseShapefileHook {
	const context = useContext<ShapefileContextValue | null>(ShapefileContext);

	if (!context) {
		throw new Error(
			'useShapefile must be used within a <ShapefileContext>'
		);
	}

	const actor = context.actor;
	const snapshot = useSelector(actor, (snapshot) => snapshot);
	const send = actor.send;
	const error = snapshot.context.error;
	const hasError = !!error;

	const isProcessingFile =
		snapshot.matches('extracting') || snapshot.matches('validating') || snapshot.matches('transforming');
	const isFileInvalid = hasError && error instanceof ShapefileLoadError;

	const reset = () => {
		send({ type: 'RESET' });
	}

	const setFile = (file: File | null) => {
		if (!file) {
			reset();
		} else {
			send({
				type: 'FILE_SELECTED',
				file,
			});
		}
	}

	return {
		file: snapshot.context.file,
		isProcessingFile,
		isFileInvalid,
		reset,
		setFile,
	};
}
