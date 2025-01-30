import React from "react";
import { useI18n } from "@wordpress/react-i18n";

import StepDataset from '@/components/download/step-dataset';
import StepVariable from '@/components/download/step-variable';
import StepVariableOptions from '@/components/download/step-variable-options';
import StepLocation from '@/components/download/step-location';
import StepAdditionalDetails from '@/components/download/step-additional-details';
import StepSendRequest from '@/components/download/step-send-request';
import StepNavigation from "@/components/download/step-navigation";
import StepSummary from "@/components/download/step-summary";

import { useAppSelector } from "@/app/hooks";
import { DownloadProvider, useDownloadContext } from "@/context/download-provider";
import { cn } from "@/lib/utils";

const Steps: React.FC = () => {
	const { __ } = useI18n();

	const data = useAppSelector(state => state.download)
	const { goToNextStep, currentStep } = useDownloadContext();

	const steps = [
		<StepDataset />,
		<StepVariable />,
		<StepVariableOptions />,
		<StepLocation />,
		<StepAdditionalDetails />,
		<StepSendRequest />,
	];

	const isLastStep = currentStep === steps.length;
	const isSecondToLastStep = currentStep === steps.length - 1;

	// TODO: add logic to disable the next button when the fields in the current step have not been filled out
	const isDisabled = false;

	let buttonText = __('Next Step');
	if (isLastStep) {
		buttonText = __('Send Request');
	}
	else if (isSecondToLastStep) {
		buttonText = __('Final Step');
	}

	const handleNext = () => {
		if (! isLastStep) {
			goToNextStep();
		}
		else {
			// TODO: add logic to actually send the request
			console.log(data)
			alert('See dev console for data that would be sent in the request');
		}
	}

	return (
		<div className="steps flex flex-col px-4">
			<StepNavigation totalSteps={steps.length} />
			<div className="mb-8">
				{steps[currentStep - 1]}
			</div>
			<button
				type="button"
				onClick={handleNext}
				className={cn(
					'w-64 mx-auto sm:mx-0 py-2 rounded-full uppercase bg-brand-red hover:bg-brand-red/50 text-white',
					isDisabled ? 'opacity-25' : '',
				)}
			>
				{buttonText} &rarr;
			</button>
		</div>
	);
};
Steps.displayName = "Steps";

const App: React.FC = () => (
	<DownloadProvider>
		<div className="min-h-screen bg-cold-grey-1">
			<div className="max-w-6xl mx-auto py-10">
				<div className="flex flex-col sm:flex-row">
					<div className="flex-1">
						<Steps />
					</div>
					<div className="w-full sm:w-72">
						<StepSummary />
					</div>
				</div>
			</div>
		</div>
	</DownloadProvider>
);

export default App;
