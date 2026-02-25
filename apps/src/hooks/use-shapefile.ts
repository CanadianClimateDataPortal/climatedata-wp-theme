import { useContext } from 'react';
import { useSelector } from '@xstate/react';

import {
	ShapefileContext,
	type ShapefileContextValue,
} from '@/context/shapefile-provider';
import { ShapefileError } from '@/lib/shapefile';
import type {
	DisplayableShape,
	DisplayableShapes,
	SelectedRegion,
	SimplifiedGeometry,
} from '@/lib/shapefile/contracts';

export type UseShapefileHook = {
	isProcessingFile: boolean;
	isFileValid: boolean;
	isSelectedRegionValid: boolean;
	file: File | null;
	reset: () => void;
	setFile: (file: File | null) => void;
	selectShape: (shape: DisplayableShape) => void;
	isDisplaying: boolean;
	displayableShapes: DisplayableShapes | null;
	simplifiedGeometry: SimplifiedGeometry | null;
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
	const file = snapshot.context.file;
	const hasFile = !!file;
	const hasError = !!error;
	const errorCode: string | null =
		error instanceof ShapefileError ? error.code : null;

	const isProcessingFile =
		snapshot.matches('extracting') ||
		snapshot.matches('validating') ||
		snapshot.matches('transforming');
	const isFileInvalid =
		hasError &&
		errorCode != null &&
		(errorCode.startsWith('extraction/') ||
			errorCode.startsWith('validation/') ||
			errorCode.startsWith('processing/'));
	const isFileValid = hasFile && !isFileInvalid;
	const isSelectedRegionValid = snapshot.matches('ready');

	const isDisplaying =
		snapshot.matches('displaying') ||
		snapshot.matches('selected') ||
		snapshot.matches('ready');

	const displayableShapes = snapshot.context.displayableShapes;
	const simplifiedGeometry = snapshot.context.simplifiedGeometry;

	const reset = () => {
		send({ type: 'RESET' });
	};

	const setFile = (file: File | null) => {
		if (!file) {
			reset();
		} else {
			send({
				type: 'FILE_SELECTED',
				file,
			});
		}
	};

	const selectShape = (shape: DisplayableShape) => {
		const selectedRegion = snapshot.context.selectedRegion;

		// Guard: already selected? (defense-in-depth — component also guards)
		if (selectedRegion?.id === shape.id) return;

		// Build SelectedRegion envelope (shared refs, no copy)
		const region: SelectedRegion = {
			id: shape.id,
			feature: shape.feature,
			areaKm2: shape.areaKm2,
			areaFormatted: '',
		};

		send({ type: 'SHAPE_CLICKED', region });
	};

	return {
		isProcessingFile,
		isFileValid,
		isSelectedRegionValid,
		file,
		reset,
		setFile,
		selectShape,
		isDisplaying,
		displayableShapes,
		simplifiedGeometry,
	};
}
