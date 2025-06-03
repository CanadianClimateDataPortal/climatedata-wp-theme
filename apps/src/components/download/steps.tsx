import React, { useState } from 'react';
import { __ } from '@/context/locale-provider';

import StepNavigation from '@/components/download/step-navigation';
import { useDownload } from '@/hooks/use-download';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setRequestStatus, setRequestError, setRequestResult, setDownloadLinks, setCaptchaValue } from '@/features/download/download-slice';
import { useClimateVariable } from '@/hooks/use-climate-variable';
import { cn } from '@/lib/utils';
import { GEOSERVER_BASE_URL, DATASETS, FINCH_DATASET_CMIP6_SSP370 } from '@/lib/constants';
import { StepComponentRef } from '@/types/download-form-interface';
import {
	DownloadFile,
	DownloadType,
	FileFormatType,
	FrequencyType,
	StationDownloadUrlsProps,
	InteractiveRegionOption
} from '@/types/climate-variable-interface';

/**
 * The Steps component dynamically renders the current step component from the STEPS configuration.
 */
const Steps: React.FC = () => {
	const [isStepValid, setIsStepValid] = useState<boolean>(false);

	const dispatch = useAppDispatch();
	const { steps, goToNextStep, currentStep, registerStepRef } = useDownload();
	const { climateVariable } = useClimateVariable();

	const { subscribe, email, requestStatus, captchaValue } = useAppSelector((state) => state.download);

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

				const analysisNamespace = climateVariable.getDatasetType() === 'ahccd' ? 'analyze-stations' : 'analyze';
				const analysisFieldValues = climateVariable.getAnalysisFieldValues();
				const analysisFields = climateVariable.getAnalysisFields?.() ?? [];
				const analysisUrl = climateVariable.getAnalysisUrl();
				const scenarios = climateVariable.getAnalyzeScenarios?.() ?? climateVariable.getScenarios?.() ?? [];
				const percentiles = climateVariable.getPercentiles?.() ?? [];
				const model = climateVariable.getModel?.();
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
				}

				// Add dataset using Finch name from DATASETS
				const datasetKey = climateVariable.getVersion?.();
				let datasetFinchName = datasetKey;

				if (datasetKey && DATASETS && (datasetKey as keyof typeof DATASETS) in DATASETS && DATASETS[datasetKey as keyof typeof DATASETS].finch_name) {
					if (datasetKey === 'cmip6' && scenarios.includes('ssp370')) {
						// Special case: if SSP3-7.0 is selected, use a special dataset name
						datasetFinchName = FINCH_DATASET_CMIP6_SSP370;
					} else {
						datasetFinchName = DATASETS[datasetKey as keyof typeof DATASETS].finch_name;
					}
				}

				if (datasetFinchName) {
					inputs.push({ id: 'dataset', data: datasetFinchName });
				}

				if (scenarios.length > 0) {
					inputs.push({ id: 'scenario', data: scenarios });
				}

				if (model) {
					inputs.push({ id: 'models', data: model });
				}

				const freq = climateVariable.getFrequency?.();
				if (freq) {
					inputs.push({ id: 'freq', data: freq });
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
						dispatch(setRequestError('Captcha failed. Please try again.'));
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

					// Generate the file to be downloaded.
					climateVariable.getDownloadUrl()
						.then((url) => {
							const file: DownloadFile = {
								url: url ?? '',
								label: fileFormat === FileFormatType.NetCDF ? 'file.nc' : 'file.zip',
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
