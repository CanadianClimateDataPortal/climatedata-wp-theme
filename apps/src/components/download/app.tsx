import React, { useContext } from 'react';
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
import { DownloadContext } from '@/context/download-provider';

const Steps: React.FC = () => {
	const { __ } = useI18n();
	const { climateVariable } = useClimateVariable();
	const context = useContext(DownloadContext);

	const { goToNextStep, currentStep, isStepValid } = useDownload();

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

	/**
	 * @todo This needs to be refactored. The validity of the step should be
	 *   determined by the step itself since a step can have dynamic fields.
	 *   We could instead pass a handler or have the step themselves set
	 *   the isStepValid state.
	 */
	const isDisabled = !isStepValid();

	let buttonText = __('Next Step');
	if (isLastStep) {
		buttonText = __('Send Request');
	} else if (isSecondToLastStep) {
		buttonText = __('Final Step');
	}

	const handleNext = async () => {
		if (!isLastStep) {
			goToNextStep();
		} else {
			const frequency = context?.fields?.frequency;

			if (
				climateVariable?.getDownloadType() === DownloadType.PRECALCULATED
				&& frequency !== FrequencyType.DAILY // If frequency is daily, it's analyzed
			) {
				// Generate the file to be downloaded.
				climateVariable.getDownloadUrl().then((url) => {
					// @todo Either print or immediately initiate the download.
					console.log(url);
				});
			} else {
				// Send the request for analysis.

				// Analysis mode
				const analysisMode = context?.fields?.dataset?.dataset_type === 'ahccd'
					? 'analyze-stations' // Climate projections
					: 'analyze'; // Climate projectionsClimate projections

				// const analysisFields = climateVariable.getAnalysisFields();
				const analysisFieldValues = climateVariable.getAnalysisFieldValues();
				const analysisUrl = climateVariable.getAnalysisUrl(
					context?.fields?.dataset?.dataset_type,
					context?.fields?.variable?.id,
				);

				// Prepare payload
				const payload = {
					namespace: analysisMode,
					signup: context?.fields?.subscribe,
					request_data: analysisFieldValues,
					submit_url: analysisUrl,
				};
				if(analysisMode === 'analyze-stations') {
					// TODO: not sure if getSelectedPoints is the right method
					payload.stations = JSON.stringify(climateVariable.getSelectedPoints());
					payload.required_variables = []; // TODO:
				}

				// We send the request
				const url = 'https://climatedata.ca/site/assets/themes/climate-data-ca/resources/ajax/finch-submit.php';

				try {
					const response = await fetch(url, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify(payload),
					});
					if (!response.ok) {
						throw new Error('Failed to fetch data');
					}

					const data = await response.json();
					if (data.status === 'success') {
						console.log(data);
					}
				} catch (error) {
					console.error('Download error:', error);
					throw error;
				}
			}
		}
	};

	return (
		<div className="steps flex flex-col px-4">
			<StepNavigation totalSteps={steps.length} />
			<div className="mb-8">{steps[currentStep - 1]}</div>
			<button
				type="button"
				onClick={handleNext}
				disabled={isDisabled}
				className={cn(
					'w-64 mx-auto sm:mx-0 py-2 rounded-full uppercase text-white tracking-wider',
					isDisabled
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