import React, { useEffect } from 'react';

import { sprintf } from '@wordpress/i18n';

import { __, _n } from '@/context/locale-provider';

import {
	StepContainer,
	StepContainerDescription,
} from '@/components/download/step-container';
import { useClimateVariable } from "@/hooks/use-climate-variable";
import { StepComponentProps, StepComponentRef } from "@/types/download-form-interface";
import { useAppDispatch } from '@/app/hooks';
import { setSelectionMode } from '@/features/download/download-slice';
import RasterDownloadMap from '@/components/download/raster-download-map';
import { useShapefile } from '@/hooks/use-shapefile';

import 'leaflet/dist/leaflet.css';
import { InteractiveRegionOption } from '@/types/climate-variable-interface';
import { StepErrorMessage } from '@/lib/step-error-message';

/**
 * Return the step error message to display when in shapefile mode.
 * Return null if no error.
 */
function getShapefileErrorMessage(
	file: File | null,
	errorCode: string | null,
	isFileValid: boolean,
	selectedShape: number | null,
): StepErrorMessage | null {
	if (!file) {
		return new StepErrorMessage(__('Please upload a shapefile.'), 'info');
	}

	if (!isFileValid) {
		return new StepErrorMessage(
			__('The selected file is not a supported shapefile.'),
		);
	}

	if (errorCode) {
		switch (errorCode) {
			case 'area/too-large':
				return new StepErrorMessage(
					__(
						'The selected region is too large. Try selecting a ' +
						'smaller region.'
					),
				);
			case 'area/too-small':
				return new StepErrorMessage(
					__(
						'The selected region is smaller than our data ' +
						'resolution. Try selecting a larger region or use ' +
						'the "Grid Cells" interactive region.'
					),
				);
		}
	}

	if (selectedShape === null) {
		return new StepErrorMessage(
			__('Please select a region on the map.'),
			'info',
		);
	}

	return null;
}

/**
 * Step 4
 *
 * Location step, allows the user to make a selection on the map and choose what type of region to select
 */
const StepLocation = React.forwardRef<
	StepComponentRef,
	StepComponentProps
>(({ onChangeValidity, onChangeErrorMessages }, ref) => {
	const { climateVariable } = useClimateVariable();
	const {
		reset: resetShapefile,
		isSelectedRegionValid: isShapefileSelectedRegionValid,
		file: shapefileFile,
		errorCode: shapefileErrorCode,
		isFileValid: isShapefileValid,
		selectedShape: selectedShapefileShape,
	} = useShapefile();
	const isShapefileMode = climateVariable?.getInteractiveRegion() === InteractiveRegionOption.USER;
	const isRegionSelected = Boolean(climateVariable?.getSelectedRegion());
	const selectedPointsCount = climateVariable?.getSelectedPointsCount() ?? 0;

	const dispatch = useAppDispatch();

	let isStepValid = true;

	if (isShapefileMode) {
		isStepValid = isShapefileSelectedRegionValid;
	} else {
		isStepValid = selectedPointsCount > 0 || isRegionSelected;
	}

	/**
	 * Step validation
	 */
	useEffect(() => {
		onChangeValidity(isStepValid)
	}, [isStepValid, onChangeValidity]);

	/**
	 * Step error messages
	 */
	useEffect(() => {
		const errorMessages: StepErrorMessage[] = [];

		if (!isStepValid) {
			if (isShapefileMode) {
				const errorMessage = getShapefileErrorMessage(
					shapefileFile,
					shapefileErrorCode,
					isShapefileValid,
					selectedShapefileShape,
				);
				if (errorMessage) {
					errorMessages.push(errorMessage);
				}
			} else {
				errorMessages.push(
					new StepErrorMessage(__('Please select a region on the map.'), 'info')
				);
			}
		}

		onChangeErrorMessages(errorMessages);
	}, [
		isStepValid,
		isShapefileMode,
		onChangeErrorMessages,
		shapefileFile,
		shapefileErrorCode,
		isShapefileValid,
		selectedShapefileShape,
	]);

	React.useImperativeHandle(ref, () => ({
		reset: () => {
			// Reset the selection mode
			dispatch(setSelectionMode('cells'));
			// Reset the shapefile state
			resetShapefile();
		},
		getResetPayload: () => {
			return {
				selectedPoints: {},
				selectedRegion: null,
				interactiveRegion: null,
			};
		},
	}), [dispatch, resetShapefile]);

	return (
		<StepContainer title={__('Select a location or area')}>
			<StepContainerDescription>
				{__(
					'Using the tool below, you can select or draw a selection to include in your download file.'
				)}
			</StepContainerDescription>
			<RasterDownloadMap />
		</StepContainer>
	);
});
StepLocation.displayName = 'StepLocation';

export default StepLocation;


/**
 * Extracts and formats summary data for the Variable Options step.
 */
export const StepSummaryLocation = (): React.ReactNode | null => {
	const { climateVariable } = useClimateVariable();

	if (!climateVariable) return null;

	const isRegion = Boolean(climateVariable.getSelectedRegion());

	const selectedCount = isRegion
		? climateVariable.getSelectedRegion()?.cellCount ?? 0
		: climateVariable.getSelectedPointsCount() ?? 0;

	return (
		(isRegion ? '~ ' : '') +
		sprintf(_n('%d selected', `%d selected`, selectedCount), selectedCount)
	);
}
