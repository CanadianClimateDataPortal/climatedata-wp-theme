import React from 'react';
import { __ } from '@/context/locale-provider';

import 'leaflet/dist/leaflet.css';

import {
	StepContainer,
	StepContainerDescription,
} from '@/components/download/step-container';
import { useClimateVariable } from "@/hooks/use-climate-variable";
import { StepComponentRef } from '@/types/download-form-interface';

/**
 * Location step, allows the user to make a selection on the map and choose what type of region to select
 */
const StepLocation = React.forwardRef<StepComponentRef>((_, ref) => {
	const { climateVariable } = useClimateVariable();

	React.useImperativeHandle(ref, () => ({
		isValid: () =>
			(climateVariable?.getSelectedPointsCount() ?? 0) > 0 || Boolean(climateVariable?.getSelectedRegion()),
		getResetPayload: () => {
			return {
				selectedPoints: {},
				selectedRegion: null,
			};
		}
	}), [climateVariable]);

	return (
		<StepContainer title={__('Select a location or area')}>
			<StepContainerDescription>
				{__(
					'Using the tool below, you can select or draw a selection to include in your download file.'
				)}
			</StepContainerDescription>
			{climateVariable?.renderDownloadMap()}
		</StepContainer>
	);
});
StepLocation.displayName = 'StepLocation';

export default StepLocation;
