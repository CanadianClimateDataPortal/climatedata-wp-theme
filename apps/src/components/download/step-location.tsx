import React from 'react';

import { sprintf } from '@wordpress/i18n';

import { __, _n } from '@/context/locale-provider';

import {
	StepContainer,
	StepContainerDescription,
} from '@/components/download/step-container';
import { useClimateVariable } from "@/hooks/use-climate-variable";
import { StepComponentRef } from '@/types/download-form-interface';
import { useAppDispatch } from '@/app/hooks';
import { setSelectionMode } from '@/features/download/download-slice';
import RasterDownloadMap from '@/components/download/raster-download-map';
import { useShapefile } from '@/hooks/use-shapefile';

import 'leaflet/dist/leaflet.css';
import { InteractiveRegionOption } from '@/types/climate-variable-interface';

/**
 * Step 4
 *
 * Location step, allows the user to make a selection on the map and choose what type of region to select
 */
const StepLocation = React.forwardRef<StepComponentRef>((_, ref) => {
	const { climateVariable } = useClimateVariable();
	const {
		reset: resetShapefile,
		isSelectedRegionValid: isShapefileSelectedRegionValid,
	} = useShapefile();
	const isShapefileMode = climateVariable?.getInteractiveRegion() === InteractiveRegionOption.USER;
	const isRegionSelected = Boolean(climateVariable?.getSelectedRegion());
	const selectedPointsCount = climateVariable?.getSelectedPointsCount() ?? 0;

	const dispatch = useAppDispatch();

	React.useImperativeHandle(ref, () => ({
		isValid: () => {
			if (isShapefileMode) {
				return isShapefileSelectedRegionValid;
			}

			return selectedPointsCount > 0 || isRegionSelected;
		},
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
		}
	}), [
		isRegionSelected,
		isShapefileSelectedRegionValid,
		selectedPointsCount,
		dispatch,
		resetShapefile,
		isShapefileMode,
	]);

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
