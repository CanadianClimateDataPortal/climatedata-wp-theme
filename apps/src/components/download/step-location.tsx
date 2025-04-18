import React from 'react';
import { useI18n } from '@wordpress/react-i18n';

import 'leaflet/dist/leaflet.css';

import {
	StepContainer,
	StepContainerDescription,
} from '@/components/download/step-container';
import { useClimateVariable } from "@/hooks/use-climate-variable";

/**
 * Location step, allows the user to make a selection on the map and choose what type of region to select
 */
const StepLocation = React.forwardRef((_, ref) => {
	const { __ } = useI18n();
	const { climateVariable } = useClimateVariable();

	// expose isValid method to parent component
	React.useImperativeHandle(ref, () => ({
		isValid: () => Object.keys(climateVariable?.getSelectedPoints() ?? {}).length > 0
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
