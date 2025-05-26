import React, { useState } from 'react';
import { __ } from '@/context/locale-provider';

import StepNavigation from '@/components/download/step-navigation';
import { useDownload } from '@/hooks/use-download';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setRequestStatus, setRequestError, setRequestResult, setDownloadLinks } from '@/features/download/download-slice';
import { useClimateVariable } from '@/hooks/use-climate-variable';
import { cn } from '@/lib/utils';
import { StepComponentRef } from '@/types/download-form-interface';
import {
	DownloadFile,
	DownloadType,
	FrequencyType,
	StationDownloadUrlsProps
} from '@/types/climate-variable-interface';

/**
 * The Steps component dynamically renders the current step component from the STEPS configuration.
 */
const Steps: React.FC = () => {
	const [isStepValid, setIsStepValid] = useState<boolean>(false);

	const dispatch = useAppDispatch();
	const { steps, goToNextStep, currentStep, registerStepRef } = useDownload();
	const { subscribe, captchaValue, requestStatus } = useAppSelector((state) => state.download);
	const { climateVariable } = useClimateVariable();

	const isLastStep = currentStep === steps.length;
	const isSecondToLastStep = currentStep === steps.length - 1;
	const showSendRequestButtonText = (isLastStep || isSecondToLastStep) && climateVariable?.getDownloadType() === DownloadType.ANALYZED;

	// TODO: need a better logic to determine which button text to show and what will happen when the button is pressed

	let buttonText = __('Next Step');
	if (showSendRequestButtonText) {
		buttonText = __('Send Request');
	} else if (isSecondToLastStep) {
		buttonText = __('Final Step');
	}

	const handleNext = async () => {
		if (!isLastStep && !isSecondToLastStep) {
			goToNextStep();
			return;
		}

		if (climateVariable) {
			if (climateVariable?.getDownloadType() === DownloadType.ANALYZED)  {
				dispatch(setRequestStatus('loading'));
				dispatch(setRequestError(null));
				dispatch(setRequestResult(undefined));

				const analysisNamespace = climateVariable.getDatasetType() === 'ahccd' ? 'analyze-stations' : 'analyze';

				const analysisFieldValues = climateVariable.getAnalysisFieldValues();
				const analysisUrl = climateVariable.getAnalysisUrl();

				const request_data: { [key: string]: any } = { ...analysisFieldValues };

				const scenarios = climateVariable.getAnalyzeScenarios?.() ?? climateVariable.getScenarios?.() ?? [];
				if (scenarios.length > 0) request_data["scenario"] = scenarios;

				const percentiles = climateVariable.getPercentiles?.() ?? [];
				if (percentiles.length > 0) request_data["ensemble_percentiles"] = percentiles.join(",");

				const model = climateVariable.getModel?.();
				if (model) request_data["models"] = model;

				const fileFormat = climateVariable.getFileFormat?.();
				if (fileFormat) request_data["output_format"] = fileFormat;

				const decimals = climateVariable.getDecimalPlace?.();
				if (typeof decimals === 'number') request_data["csv_precision"] = decimals;

				const selectedPoints = climateVariable.getSelectedPoints?.();
				if (selectedPoints && Object.keys(selectedPoints).length > 0) {
					request_data["lat"] = Object.values(selectedPoints).map((c) => c.lat).join(",");
					request_data["lon"] = Object.values(selectedPoints).map((c) => c.lng).join(",");
				}
				const selectedRegion = climateVariable.getSelectedRegion?.();
				if (selectedRegion && selectedRegion.bounds) {
					const bounds = selectedRegion.bounds as [[number, number], [number, number]];
					request_data["lat0"] = bounds[0][0];
					request_data["lon0"] = bounds[0][1];
					request_data["lat1"] = bounds[1][0];
					request_data["lon1"] = bounds[1][1];
				}

				const payload = {
					namespace: analysisNamespace,
					signup: subscribe,
					request_data,
					submit_url: analysisUrl,
					captcha_code: captchaValue,
				};

				try {
					const response = await fetch('/wp-json/cdc/v2/finch_submit/', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(payload),
						credentials: 'include',
					});

					const data = await response.json();
					if (data.status === 'captcha failed') {
						dispatch(setRequestStatus('error'));
						dispatch(setRequestError('Captcha failed. Please try again.'));
						return;
					}

					dispatch(setRequestResult(data));
					dispatch(setRequestStatus('success'));

					goToNextStep();
				} catch (error: any) {
					dispatch(setRequestStatus('error'));
					dispatch(setRequestError(error?.message || 'Unknown error'));
				}
			}
			else if (climateVariable?.getDownloadType() === DownloadType.PRECALCULATED && climateVariable?.getFrequency() !== FrequencyType.DAILY) {
				// Download precalculated climate variables
				// and not daily frequency (daily frequency are analyzed)

				if (climateVariable?.getInteractiveMode() === 'region') {
					// Precalcultated variables (no station)

					// Generate the file to be downloaded.
					climateVariable.getDownloadUrl()
					.then((url) => {
						const file: DownloadFile = {
							url: url ?? '',
							label: 'file.zip'
						};

						dispatch(setDownloadLinks([file]));
						dispatch(setRequestStatus('success'));

						goToNextStep();
					})
					.catch(() => {
						dispatch(setRequestStatus('error'));
						dispatch(setDownloadLinks(undefined));
					});
				} else {
					// TODO: make sure this is correct.. msc climate normals is a different datasetType than
					// 	the rest of variables that would fall in this condition which all are 'ahccd'
					// 	should msc climate normals behave differently than the others?
					// For station variables
					const selectedPoints = climateVariable.getSelectedPoints?.() ?? {};
					const fileFormat = climateVariable.getFileFormat?.() ?? null;
					const stationIds = Object.keys(selectedPoints);
					const stationDownloadUrlsProps: StationDownloadUrlsProps = {};

					switch (climateVariable.getId()) {
						case 'msc_climate_normals':
						case 'daily_ahccd_temperature_and_precipitation':
							stationDownloadUrlsProps.stationIds = stationIds;
							stationDownloadUrlsProps.fileFormat = fileFormat;
							break;
						case 'future_building_design_value_summaries': {
							const first = Object.values(selectedPoints)[0];
							stationDownloadUrlsProps.stationName = first?.name;
							break;
						}
						case 'short_duration_rainfall_idf_data':
							stationDownloadUrlsProps.stationId = stationIds[0];
							break;
						case 'station_data': {
							stationDownloadUrlsProps.stationIds = stationIds;
							stationDownloadUrlsProps.fileFormat = fileFormat;
							const dateRange = climateVariable.getDateRange?.();
							if (Array.isArray(dateRange) && dateRange.length >= 2) {
								stationDownloadUrlsProps.dateRange = { start: dateRange[0], end: dateRange[1] };
							}
							break;
						}
					}

					climateVariable.getStationDownloadFiles(stationDownloadUrlsProps)
					.then((downloadFiles) => {
						dispatch(setDownloadLinks(downloadFiles));
						dispatch(setRequestStatus('success'));

						goToNextStep();
					})
					.catch(() => {
						dispatch(setRequestStatus('error'));
						dispatch(setDownloadLinks(undefined));
					});
				}
			}
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
					disabled={!isStepValid || requestStatus === 'loading'}
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