import React, { useState } from 'react';
import { useI18n } from '@wordpress/react-i18n';

import StepNavigation from '@/components/download/step-navigation';
import { useDownload } from '@/hooks/use-download';
import { cn } from '@/lib/utils';
import { StepComponentRef } from '@/types/download-form-interface';

/**
 * The Steps component dynamically renders the current step component from the STEPS configuration.
 */
const Steps: React.FC = () => {
	const [isStepValid, setIsStepValid] = useState(false);
	const { __ } = useI18n();

	const { steps, goToNextStep, currentStep, registerStepRef } = useDownload();

	const isLastStep = currentStep === steps.length;
	const isSecondToLastStep = currentStep === steps.length - 1;

	let buttonText = __('Next Step');
	if (isLastStep) {
		buttonText = __('Send Request');
	} else if (isSecondToLastStep) {
		buttonText = __('Final Step');
	}

	const handleNext = () => {
		if (!isLastStep) {
			goToNextStep();
		}
	};

	const StepComponent = steps[currentStep - 1] as React.ElementType;

	return (
		<div className="steps flex flex-col px-4">
			<StepNavigation totalSteps={steps.length} />
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
			{!isLastStep && (
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
			)}
		</div>
	);
};
Steps.displayName = 'StepsWrapper';

export default Steps;