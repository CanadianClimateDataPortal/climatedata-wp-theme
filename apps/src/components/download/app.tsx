import React, { useRef, useState } from 'react';
import { useI18n } from '@wordpress/react-i18n';

import StepDataset from '@/components/download/step-dataset';
import StepVariable from '@/components/download/step-variable';
import StepVariableOptions from '@/components/download/step-variable-options';
import StepLocation from '@/components/download/step-location';
import StepAdditionalDetails from '@/components/download/step-additional-details';
import StepSendRequest from '@/components/download/step-send-request';
import StepNavigation from '@/components/download/step-navigation';
import StepSummary from '@/components/download/step-summary';

import { MapProvider } from '@/context/map-provider';
import { AnimatedPanelProvider } from '@/context/animated-panel-provider';
import { DownloadProvider } from '@/context/download-provider';
import { LocaleProvider } from '@/context/locale-provider';
import { useDownload } from '@/hooks/use-download';
import { cn } from '@/lib/utils';
import { useClimateVariable } from '@/hooks/use-climate-variable';
import { DownloadType } from '@/types/climate-variable-interface';

const Steps: React.FC = () => {
	const [isStepValid, setIsStepValid] = useState(false);

	const { __ } = useI18n();
	const { climateVariable } = useClimateVariable();

	const { goToNextStep, currentStep } = useDownload();

	const steps = [
		StepDataset,
		StepVariable,
		StepVariableOptions,
		StepLocation,
		StepAdditionalDetails,
		StepSendRequest,
	];

	const stepRef = useRef<{
		isValid: () => boolean;
	} | null>(null);

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
		} else {
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

	const StepComponent = steps[currentStep - 1];
	return (
		<div className="steps flex flex-col px-4">
			<StepNavigation totalSteps={steps.length} />
			<div className="mb-8">
				<StepComponent ref={(ref: { isValid: () => boolean; } | null) => {
					if (ref) {
						stepRef.current = ref;
						// Force validation check when ref is updated
						setIsStepValid(ref.isValid());
					}
				}} />
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
Steps.displayName = 'Steps';

const App: React.FC = () => (
	<LocaleProvider>
		<MapProvider>
			<AnimatedPanelProvider>
				<DownloadProvider>
					<div className="min-h-screen bg-cold-grey-1">
						<div className="max-w-6xl mx-auto py-10">
							<div className="flex flex-col sm:flex-row gap-4">
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
			</AnimatedPanelProvider>
		</MapProvider>
	</LocaleProvider>
);

export default App;