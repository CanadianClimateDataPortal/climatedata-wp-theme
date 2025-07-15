import React, { useState } from 'react';
import { __ } from '@/context/locale-provider';

import StepNavigation from '@/components/download/step-navigation';
import { useDownload } from '@/hooks/use-download';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
	setCaptchaValue,
	setDownloadLinks,
	setRequestError,
	setRequestResult,
	setRequestStatus,
} from '@/features/download/download-slice';
import { useClimateVariable } from '@/hooks/use-climate-variable';
import { cn } from '@/lib/utils';
import { FINCH_FREQUENCY_NAMES, GEOSERVER_BASE_URL } from '@/lib/constants';
import { StepComponentRef } from '@/types/download-form-interface';
import {
	DownloadFile,
	DownloadType,
	FileFormatType,
	FrequencyType,
	InteractiveRegionOption,
	StationDownloadUrlsProps,
} from '@/types/climate-variable-interface';
import { useLocale } from "@/hooks/use-locale";
import { sprintf } from "@wordpress/i18n";

/**
 * The Steps component dynamically renders the current step component from the STEPS configuration.
 */
const Steps: React.FC = () => {
	const { locale } = useLocale();
	const [isStepValid, setIsStepValid] = useState<boolean>(false);

	const dispatch = useAppDispatch();
	const { steps, goToNextStep, currentStep, registerStepRef } = useDownload();
	const { climateVariable } = useClimateVariable();

	const { subscribe, email, requestStatus, captchaValue, selectedStation } = useAppSelector((state) => state.download);

	const isLastStep = currentStep === steps.length;
	const isSecondToLastStep = currentStep === steps.length - 1;
	const showSendRequestButtonText = (isLastStep || isSecondToLastStep) && climateVariable?.getDownloadType() === DownloadType.ANALYZED;

	let buttonText = __('Next Step');
	if (showSendRequestButtonText) {
		buttonText = __('Send Request');
	} else if (isSecondToLastStep) {
		buttonText = __('Final Step');
	}

	// Flatten object into FormData with php-style bracket notation
	const appendFormData = (formData: FormData, data: any, parentKey = ''): void => {
		if (Array.isArray(data)) {
			data.forEach((value, i) => {
				appendFormData(formData, value, `${parentKey}[${i}]`);
			});
		} else if (typeof data === 'object' && data !== null) {
			Object.keys(data).forEach(key => {
				appendFormData(formData, data[key], parentKey ? `${parentKey}[${key}]` : key);
			});
		} else if (data !== undefined) {
			formData.append(parentKey, String(data));
		}
	};

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
				dispatch(setDownloadLinks(undefined));

				const ahccdDownloadRequiredVariables = climateVariable.getAhccdDownloadRequiredVariables?.() ?? [];
				const analysisNamespace = climateVariable.getDatasetType() === 'ahccd' ? 'analyze-stations' : 'analyze';
				const analysisFieldValues = climateVariable.getAnalysisFieldValues();
				const analysisFields = climateVariable.getAnalysisFields?.() ?? [];
				const analysisUrl = climateVariable.getAnalysisUrl();
				const scenarios = climateVariable.getAnalyzeScenarios?.() ?? climateVariable.getScenarios?.() ?? [];
				const percentiles = climateVariable.getPercentiles?.() ?? [];
				const model = climateVariable.getModel?.();
				const missingData = climateVariable.getMissingData?.();
				const fileFormat = climateVariable.getFileFormat?.();
				const decimals = climateVariable.getDecimalPlace?.();
				const interactiveRegion = climateVariable.getInteractiveRegion?.();
				const selectedPoints = climateVariable.getSelectedPoints?.();
				const gridType = climateVariable.getGridType?.() ?? 'canadagrid';

				let latList = '';
				let lonList = '';

				if (
					interactiveRegion &&
					interactiveRegion !== InteractiveRegionOption.GRIDDED_DATA &&
					selectedPoints &&
					Object.keys(selectedPoints).length === 1
				) {
					// Get the region id (the only key in selectedPoints)
					const regionId = Object.keys(selectedPoints)[0];
					const url = `${GEOSERVER_BASE_URL}/partition-to-points/${gridType}/${interactiveRegion}/${regionId}.json`;
					try {
						const response = await fetch(url);
						if (!response.ok) throw new Error('Failed to fetch region grid points');
						const points = await response.json(); // array of [lat, lon]
						latList = points.map((x: [number, number]) => x[0]).join(',');
						lonList = points.map((x: [number, number]) => x[1]).join(',');
					} catch (err) {
						dispatch(setRequestStatus('error'));
						dispatch(setRequestError('Failed to fetch region grid points'));
						return;
					}
				} else if (selectedPoints && Object.keys(selectedPoints).length > 0) {
					// TODO: is this correct? Fallback: use selected points as before
					latList = Object.values(selectedPoints).map((c) => c.lat).join(',');
					lonList = Object.values(selectedPoints).map((c) => c.lng).join(',');
				}

				// Build the inputs array for request_data
				const inputs: { id: string, data: any }[] = [];
				if (latList) inputs.push({ id: 'lat', data: latList });
				if (lonList) inputs.push({ id: 'lon', data: lonList });

				// Add average (True for any region except GRIDDED_DATA)
				inputs.push({ id: 'average', data: interactiveRegion !== InteractiveRegionOption.GRIDDED_DATA ? 'True' : 'False' });

				// Add start_date and end_date
				const dateRange = climateVariable.getDateRange?.();
				if (dateRange && dateRange.length === 2) {
					inputs.push({ id: 'start_date', data: dateRange[0] });
					inputs.push({ id: 'end_date', data: dateRange[1] });
				}

				if (percentiles.length > 0) {
					inputs.push({ id: 'ensemble_percentiles', data: percentiles.join(',') });
				} else {
					// If no percentiles are selected, 'ensemble_percentiles' must still be in the request
					inputs.push({ id: 'ensemble_percentiles', data: '' });
				}

				const datasetFinchName = climateVariable.getFinchDataset();

				if (datasetFinchName) {
					inputs.push({ id: 'dataset', data: datasetFinchName });
				}

				scenarios.forEach((scenario) => {
					inputs.push({ id: 'scenario', data: scenario });
				});

				if (model) {
					inputs.push({ id: 'models', data: model });
				}

				const freq = climateVariable.getFrequency?.();
				let finchFreq = freq;

				if (freq && FINCH_FREQUENCY_NAMES && (freq as keyof typeof FINCH_FREQUENCY_NAMES) in FINCH_FREQUENCY_NAMES) {
					finchFreq = FINCH_FREQUENCY_NAMES[freq as keyof typeof FINCH_FREQUENCY_NAMES] ?? null;
				}

				if (finchFreq) {
					inputs.push({ id: 'freq', data: finchFreq });
				}

				inputs.push({ id: 'data_validation', data: 'warn' });

				// Add output_name (getFinch + region + name)
				let outputName = climateVariable.getFinch?.() || 'download';
				if (interactiveRegion && interactiveRegion !== InteractiveRegionOption.GRIDDED_DATA) {
					outputName += `_${interactiveRegion}`;
					const selectedRegion = climateVariable.getSelectedRegion?.();
					if (selectedRegion && (selectedRegion as any).name) {
						outputName += `_${(selectedRegion as any).name}`;
					} else if (selectedPoints && Object.keys(selectedPoints).length === 1) {
						const regionId = Object.keys(selectedPoints)[0];
						const regionPoint = selectedPoints[regionId];
						if (regionPoint) {
							const regionName = regionPoint?.name || '';
							if (regionName) {
								outputName += `_${regionName}`;
							}
						}
					}
				}
				inputs.push({ id: 'output_name', data: outputName });

				// Add all other analysisFieldValues as inputs, appending unit if present in analysisFields
				Object.entries(analysisFieldValues).forEach(([key, value]) => {
					if (key !== 'lat' && key !== 'lon') {
						// Find the analysisField definition for this key
						const fieldDef = analysisFields.find((f: any) => f.key === key);
						let dataValue = value;
						if (fieldDef && fieldDef.unit && value !== undefined && value !== null && value !== '') {
							dataValue = `${value} ${fieldDef.unit}`;
						}
						inputs.push({ id: key, data: dataValue });
					}
				});

				if (fileFormat) {
					inputs.push({ id: 'output_format', data: fileFormat });
				}
				if (typeof decimals === 'number') {
					inputs.push({ id: 'csv_precision', data: decimals });
				}

				// Missing data
				if (missingData) {
					if (missingData === 'wmo') {
						inputs.push({ id: 'check_missing', data: 'wmo' });
					} else {
						inputs.push({ id: 'check_missing', data: 'pct' });
						const toleranceMap: { [key: number]: number } = { 5: 0.05, 10: 0.1, 15: 0.15 };
						const tolerance = toleranceMap[Number(missingData)] ?? 0.05;
						const missingOptions = { pct: { tolerance } };
						inputs.push({ id: 'missing_options', data: JSON.stringify(missingOptions) });
					}
				}

				const request_data: { [key: string]: any } = {};
				request_data['inputs'] = inputs;
				request_data['notification_email'] = email;
				request_data['response'] = 'document';
				request_data['mode'] = 'auto';
				request_data['outputs'] = [{ transmissionMode: 'reference', id: 'output' }];

				// Build FormData
				const formData = new FormData();
				formData.append('namespace', analysisNamespace);
				formData.append('signup', String(subscribe));
				formData.append('captcha_code', captchaValue ?? '');
				formData.append('submit_url', analysisUrl ?? '');

				if (climateVariable.getDatasetType() === 'ahccd') {
					// Stations list
					const stations = Object.keys(selectedPoints ?? {});
					formData.append('stations', stations.join(','));

					// Required variables
					if (ahccdDownloadRequiredVariables.length > 0) {
						appendFormData(formData, ahccdDownloadRequiredVariables, 'required_variables');
					}
				}

				appendFormData(formData, request_data, 'request_data');

				try {
					const response = await fetch('/wp-json/cdc/v2/finch_submit/', {
						method: 'POST',
						body: formData,
						credentials: 'include',
					});

					const data = await response.json();
					if (data.status === 'captcha failed') {
						dispatch(setRequestStatus('error'));
						dispatch(setRequestError(__('Captcha failed. Please try again.')));
						dispatch(setCaptchaValue(''));
						return;
					}

					dispatch(setRequestResult(data));
					dispatch(setRequestStatus('success'));
					dispatch(setCaptchaValue(''));
					goToNextStep();
				} catch (error: any) {
					dispatch(setRequestStatus('error'));
					dispatch(setRequestError(error?.message || 'Unknown error'));
					dispatch(setCaptchaValue(''));
				}
			}
			else if (climateVariable?.getDownloadType() === DownloadType.PRECALCULATED && climateVariable?.getFrequency() !== FrequencyType.DAILY) {
				// Download precalculated climate variables
				// and not daily frequency (daily frequency are analyzed)

				if (climateVariable?.getInteractiveMode() === 'region') {
					// Precalcultated variables (no station)
					const fileFormat = climateVariable.getFileFormat?.() ?? '';
					const fileName = climateVariable.getId() ?? 'file';

					// Get a reference to the "Next Step" button
					const button = document.getElementById('nextStepBtn');
					let originalButtonText: string | null = null;

					if (button) {
						// Store the original button text so we can restore it later
						originalButtonText = button.textContent;

						// Update the button UI to indicate loading state
						button.textContent = __('Loading...');
						button.setAttribute('disabled', 'true');
						button.classList.add('cursor-not-allowed');
					}
					
					const downloadFileName = fileName + (fileFormat === FileFormatType.NetCDF ? '.nc' : '.zip');

// Generate the file to be downloaded
					climateVariable.getDownloadUrl()
						.then((url) => {
							// If a valid URL is returned, create a download file object
							if (url) {
								const file: DownloadFile = {
									url: url,
									label: sprintf(__(`Download %s`), downloadFileName),
									fileName: downloadFileName,
								};
								dispatch(setDownloadLinks([file])); // Save the generated download link
							}

							// Update UI to indicate success
							dispatch(setRequestStatus('success'));

							// Restore the button to its original state
							if (button) {
								button.textContent = originalButtonText;
								button.removeAttribute('disabled');
								button.classList.remove('cursor-not-allowed');
							}

							// Automatically proceed to the next step, unless all variables were selected
							if (climateVariable.getThreshold() !== 'all') {
								goToNextStep();
							}
						})
						.catch(() => {
							// In case of an error, update the request status and clear any links
							dispatch(setRequestStatus('error'));
							dispatch(setDownloadLinks(undefined));

							// Restore the button to its original state
							if (button) {
								button.textContent = originalButtonText;
								button.removeAttribute('disabled');
								button.classList.remove('cursor-not-allowed');
							}
						});


				} else {
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
							stationDownloadUrlsProps.filename = selectedStation?.filename;
							stationDownloadUrlsProps.locale = locale;
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
					id="nextStepBtn"
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
