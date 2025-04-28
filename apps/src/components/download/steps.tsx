import React, { useState } from 'react';
import { useI18n } from '@wordpress/react-i18n';

import StepNavigation from '@/components/download/step-navigation';
import { useDownload } from '@/hooks/use-download';
import { cn } from '@/lib/utils';
import { useClimateVariable } from '@/hooks/use-climate-variable';
import { DownloadType } from '@/types/climate-variable-interface';
import { StepComponentRef } from '@/types/download-form-interface';
import { STEPS } from './config';

/**
 * The Steps component dynamically renders the current step component from the STEPS configuration.
 */
const Steps: React.FC = () => {
	const [isStepValid, setIsStepValid] = useState(false);
	const { __ } = useI18n();

	const { climateVariable } = useClimateVariable();
	const { goToNextStep, currentStep, registerStepRef } = useDownload();

	const isLastStep = currentStep === STEPS.length;
	const isSecondToLastStep = currentStep === STEPS.length - 1;

	let buttonText = __('Next Step');
	if (isLastStep) {
		buttonText = __('Send Request');
	} else if (isSecondToLastStep) {
		buttonText = __('Final Step');
	}

	const handleNext = () => {
		if (!isLastStep) {
			goToNextStep();
		} else {
			// TODO: remove once the rest of the logic for sending the request is finished
			console.log(climateVariable?.toObject())
			if (
				climateVariable?.getDownloadType() ===
				DownloadType.PRECALCULATED
			) {
				// Generate the file to be downloaded.
				climateVariable.getDownloadUrl().then((url) => {
					// @todo Either print or immediately initiate the download.
					console.log(url);
				});
			} else {
				// Send the request for analysis.
			}
		}
	};

	const StepComponent = STEPS[currentStep - 1];

	return (
		<div className="steps flex flex-col px-4">
			<StepNavigation totalSteps={STEPS.length} />
			<div className="mb-8">
				<StepComponent
					// Register the step's ref to enable communication between the step component
					// and the download context. This allows the step to validate itself and
					// notify the parent when its state changes.
					ref={(ref: StepComponentRef | null) => {
						if (ref) {
							// Store the ref in the download context to access it from other components
							registerStepRef(currentStep, ref);

							// Update the validation state based on the step's current state
							setIsStepValid(ref.isValid());
						}
					}}
				/>
			</div>
			<button
				type="button"
				onClick={handleNext}
				disabled={!isStepValid}
				className={cn(
					'w-64 mx-auto sm:mx-0 py-2 rounded-full uppercase text-white tracking-wider',
					!isStepValid
						? 'bg-brand-red/25 cursor-not-allowed'
						: 'bg-brand-red hover:bg-brand-red/75'
				)}
			>
				{buttonText} &rarr;
			</button>
		</div>
	);
};
Steps.displayName = 'StepsWrapper';

export default Steps;