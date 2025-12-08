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
import { FinchRequestInput, StepComponentRef } from '@/types/download-form-interface';
import {
	DownloadFile,
	DownloadType,
	FileFormatType,
	InteractiveRegionOption,
	StationDownloadUrlsProps,
} from '@/types/climate-variable-interface';
import { useLocale } from "@/hooks/use-locale";
import { useS2D } from '@/hooks/use-s2d';
import { sprintf } from "@wordpress/i18n";
import { trackFinchDownload } from '@/lib/google-analytics';

/**
 * The Steps component dynamically renders the current step component from the STEPS configuration.
 */
const Steps: React.FC = () => {
	const { locale } = useLocale();
	const [isStepValid, setIsStepValid] = useState<boolean>(false);

	const dispatch = useAppDispatch();
	const { steps, goToNextStep, currentStep, registerStepRef } = useDownload();
	const { climateVariable } = useClimateVariable();

	const { isS2DVariable } = useS2D();

	const { subscribe, email, requestStatus, captchaValue, selectedStation } = useAppSelector((state) => state.download);

	const isLastStep = currentStep === steps.length;
	const isSecondToLastStep = currentStep === steps.length - 1;

	const isDailyRequest = climateVariable?.getFrequency() === 'daily';
	const isAnalyzeRequest = climateVariable?.getDownloadType() === DownloadType.ANALYZED;
	const isPrecalculatedDownload =
		climateVariable?.getDownloadType() === DownloadType.PRECALCULATED &&
		!isDailyRequest;

	const showSendRequestButton =
		(isLastStep || isSecondToLastStep) &&
		(isAnalyzeRequest || isDailyRequest);

	let buttonText = __('Next Step');
	if (requestStatus === 'loading') {
		buttonText = __('Loading...');
	} else if (showSendRequestButton) {
		buttonText = __('Send Request') + ' →';
	} else if (isSecondToLastStep) {
		buttonText = __('Final Step') + ' →';
	}
	const buttonIsEnabled = requestStatus !== 'loading' && isStepValid;

	// The following is to set an ID used in Google Tag Manager event tracking
	const buttonId = (
		(isLastStep || isSecondToLastStep) &&
		isAnalyzeRequest &&
		climateVariable?.getDatasetType() !== 'ahccd'
	) ?
		'analyze-process' :
		undefined;

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
		if (!isStepValid || requestStatus === 'loading') {
			return;
		}

		if (!isLastStep && !isSecondToLastStep) {
			goToNextStep();
			return;
		}

		if (climateVariable) {
			if (isAnalyzeRequest || isDailyRequest) {
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
					latList = Object.values(selectedPoints).map((c) => c.lat).join(',');
					lonList = Object.values(selectedPoints).map((c) => c.lng).join(',');
				}

				// Build the inputs array for request_data
				const inputs: FinchRequestInput[] = [];

				if (isDailyRequest) {
					const selectedRegion = climateVariable.getSelectedRegion();
					if (selectedRegion) {
						const bounds = selectedRegion.bounds as [
							[number, number],
							[number, number],
						];
						inputs.push({ id: 'lat0', data: bounds[0][0].toPrecision(14) });
						inputs.push({ id: 'lon0', data: bounds[0][1].toPrecision(14) });
						inputs.push({ id: 'lat1', data: bounds[1][0].toPrecision(14) });
						inputs.push({ id: 'lon1', data: bounds[1][1].toPrecision(14) });
					} else {
						if (latList) {
							inputs.push({ id: 'lat0', data: latList });
						}
						if (lonList) {
							inputs.push({ id: 'lon0', data: lonList });
						}
					}
				} else {
					if (latList) {
						inputs.push({ id: 'lat', data: latList });
					}
					if (lonList) {
						inputs.push({ id: 'lon', data: lonList });
					}
				}

				// Add average (True for any region except GRIDDED_DATA)
				if (!isDailyRequest) {
					inputs.push({ id: 'average', data: interactiveRegion !== InteractiveRegionOption.GRIDDED_DATA ? 'True' : 'False' });
				}

				// Add start_date and end_date
				const dateRange = climateVariable.getDateRange?.();
				if (!isDailyRequest && dateRange && dateRange.length === 2) {
					inputs.push({ id: 'start_date', data: dateRange[0] });
					inputs.push({ id: 'end_date', data: dateRange[1] });
				}

				if (percentiles.length > 0) {
					inputs.push({ id: 'ensemble_percentiles', data: percentiles.join(',') });
				} else if (!isDailyRequest) {
					// If no percentiles are selected, 'ensemble_percentiles' must still be in the request
					// (except for a daily request)
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

				if (
					!isDailyRequest &&
					freq &&
					(freq as keyof typeof FINCH_FREQUENCY_NAMES) in FINCH_FREQUENCY_NAMES
				) {
					const finchFreq = FINCH_FREQUENCY_NAMES[freq as keyof typeof FINCH_FREQUENCY_NAMES];
					if (finchFreq) {
						inputs.push({id: 'freq', data: finchFreq});
					}
				}

				inputs.push({ id: 'data_validation', data: 'warn' });

				if (!isDailyRequest) {
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
				}

				// Add all other analysisFieldValues as inputs, appending unit if present in analysisFields
				Object.entries(analysisFieldValues).forEach(([key, value]) => {
					if (key !== 'lat' && key !== 'lon') {
						// Find the analysisField definition for this key
						const fieldDef = analysisFields.find((f: any) => f.key === key);
						let dataValue = value;
						if (fieldDef && fieldDef.unit && value !== undefined && value !== null && value !== '') {
							dataValue = `${value} ${fieldDef.unit}`;
						}
						inputs.push({ id: key, data: dataValue ?? '' });
					}
				});

				if (fileFormat) {
					inputs.push({ id: 'output_format', data: fileFormat });
				}

				if (!isDailyRequest && typeof decimals === 'number') {
					inputs.push({ id: 'csv_precision', data: decimals.toString() });
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

				// Variable name, daily only
				if (isDailyRequest) {
					inputs.push({ id: 'variable', data: climateVariable.getFinch?.() || '' });
				}

				const request_data: { [key: string]: any; } = {};
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

				if (climateVariable.getDatasetType() !== 'ahccd') {
					trackFinchDownload(climateVariable, inputs);
				}

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
			else if (isPrecalculatedDownload) {
				// Download precalculated climate variables
				// and not daily frequency (daily frequency are analyzed)
				dispatch(setRequestStatus('loading'));

				if (climateVariable?.getInteractiveMode() === 'region') {
					// Precalculated variables (no station)
					const fileFormat = climateVariable.getFileFormat?.() ?? '';
					const fileName = climateVariable.getId() ?? 'file';
					/**
					 * The file extension may be specific to the variable type and format
					 * but in the case of the backends for S2D variables, they're always
					 * served by the backend as a zip file since they always contain multiple files.
					 */
					const downloadFileExtension = isS2DVariable
						? '.zip'
						: fileFormat === FileFormatType.NetCDF
							? '.nc'
							: '.zip';
					const downloadFileName = fileName + downloadFileExtension;

					// Generate the file to be downloaded
					climateVariable.getDownloadUrl()
						.then((url) => {
							// If a valid URL is returned, create a download file object
							if (url) {
								const file: DownloadFile = {
									url: url,
									label: sprintf(__(`Download %s`), downloadFileName),
									linkAttributes: {
										// Class name for Google Tag Manager event tracking
										className: 'download_variable_data_bccaqv2',
									},
									fileName: downloadFileName,
								};
								dispatch(setDownloadLinks([file])); // Save the generated download link
							}

							// Update UI to indicate success
							dispatch(setRequestStatus('success'));

							// Automatically proceed to the next step, unless all variables were selected
							if (climateVariable.getThreshold() !== 'all') {
								goToNextStep();
							}
						})
						.catch(() => {
							// In case of an error, update the request status and clear any links
							dispatch(setRequestStatus('error'));
							dispatch(setDownloadLinks(undefined));
						});


				} else {
					// For station variables
					const selectedPoints = climateVariable.getSelectedPoints?.() ?? {};
					const fileFormat = climateVariable.getFileFormat?.() ?? null;
					const stationIds = Object.keys(selectedPoints);
					const stationDownloadUrlsProps: StationDownloadUrlsProps = {};
					dispatch(setRequestStatus('loading'));

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
				<div>
					{/* The button is a <a> element to be compatible with Google Tag Manager event tracking*/}
					<a
						id={buttonId}
						onClick={handleNext}
						className={cn(
							'inline-block w-64 mx-auto sm:mx-0 py-2 rounded-full cursor-pointer',
							'bg-brand-red',
							'uppercase text-white tracking-wider text-center',
							buttonIsEnabled ?
								'hover:bg-brand-red/75':
								'cursor-not-allowed opacity-35'
						)}
					>
						{buttonText}
					</a>
				</div>
			)}
		</div>
	);
};
Steps.displayName = 'StepsWrapper';

export default Steps;
