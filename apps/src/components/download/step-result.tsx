import React, { useState, useEffect } from 'react';
import { useI18n } from '@wordpress/react-i18n';

import {
	StepContainer,
	StepContainerDescription,
} from '@/components/download/step-container';
import { useClimateVariable } from "@/hooks/use-climate-variable";
import { DownloadType, StationDownloadUrlsProps, DownloadFile, FrequencyType, FileFormatType } from '@/types/climate-variable-interface';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/app/hooks';

interface AnalyzePayload {
	namespace: string;
	signup: boolean;
	request_data: { [key: string]: string | null; };
	submit_url: string | null;
	stations?: string;
	required_variables?: string[];
}

/**
 * Result step, the final one, allows the user to make download file or see a success message.
 */
const StepResult = React.forwardRef(() => {
	const { __ } = useI18n();
	const { climateVariable } = useClimateVariable();
	const { subscribe } = useAppSelector(
		(state) => state.download
	);

	const [containerTitle, setContainerTitle] = useState<string | null>(null);
	const [containerDescription, setContainerDescription] = useState<string | null>(null);

	// For precalculated climate variables
	const [files, setFiles] = useState<DownloadFile[]>([]);

	// Success messages
	const downloadSuccessMessage = __('Your file is ready to download. Click the button below to start the download.');
	const multipleDownloadSuccessMessage = __('Your files are ready to download. Click the buttons below to start the download.');
	// Error messages
	const downloadErrorMessage = __('An error occurred while preparing your file. Please try again later.');
	const analyzeErrorMessage = __('An error occurred while preparing your request. Please try again later.');

	// Set title, description and file
	useEffect(() => {
		const frequency = climateVariable?.getFrequency();

		if (climateVariable?.getDownloadType() === DownloadType.PRECALCULATED && frequency !== FrequencyType.DAILY) {
			// Download precalculated climate variables
			// and not daily frequency (daily frequency are analyzed)

			setContainerTitle(__('Download your file'));
			setContainerDescription(__('Your request is being sent...'));

			if(climateVariable.getInteractiveMode() === 'region') {
				// Precalcultated variables (no station)

				// Generate the file to be downloaded.
				climateVariable.getDownloadUrl()
				.then((url) => {
					const file: DownloadFile = {
						url: url ?? '',
						label: 'file.zip'
					};
					setFiles([file]);

					setContainerDescription(downloadSuccessMessage);
				})
				.catch(() => {
					setContainerDescription(downloadErrorMessage);
				});
			} else if(climateVariable.getInteractiveMode() === 'station') {
				// For station variables

				// TODO: set StationDownloadUrlsProps
				// TODO: replace with correct data
				const stationDownloadUrlsProps: StationDownloadUrlsProps = {} as StationDownloadUrlsProps;
				if(climateVariable.getId() === 'msc_climate_normals') {
					stationDownloadUrlsProps.stationIds = ['7113534', '8502800'];
					stationDownloadUrlsProps.fileFormat = climateVariable.getFileFormat() ?? FileFormatType.CSV;
				} else if(climateVariable.getId() === 'daily_ahccd_temperature_and_precipitation') {
					stationDownloadUrlsProps.stationIds = ['7093GJ5', '7115800'];
					stationDownloadUrlsProps.fileFormat = climateVariable.getFileFormat() ?? FileFormatType.CSV;
				}
				else if(climateVariable.getId() === 'future_building_design_value_summaries') {
					stationDownloadUrlsProps.stationName = 'Happy Valley-Goose Bay, NL';
				}
				else if(climateVariable.getId() === 'short_duration_rainfall_idf_data') {
					stationDownloadUrlsProps.stationId = '8501132';
				}
				else if(climateVariable.getId() === 'station_data') {
					stationDownloadUrlsProps.stationIds = ['54058', '6093'];
					stationDownloadUrlsProps.fileFormat = climateVariable.getFileFormat() ?? FileFormatType.CSV;
					stationDownloadUrlsProps.dateRange = {start: '1840-03-01', end: '2025-05-06'};
				}

				climateVariable.getStationDownloadFiles(stationDownloadUrlsProps)
					.then((downloadFiles) => {
						if(downloadFiles.length > 1) {
							setContainerDescription(multipleDownloadSuccessMessage);
						} else if(downloadFiles.length > 0) {
							setContainerDescription(downloadSuccessMessage);
						} else {
							setContainerDescription(downloadErrorMessage);
						}

						setFiles(downloadFiles);
					})
					.catch(() => {
						setContainerDescription(downloadErrorMessage);
					});
			}
		} else {
			// Analyzed climate variables (and precalculated daily variables)
			
			setContainerTitle(__('Send request'));
			setContainerDescription(__('Your request is being sent...'));

			if(climateVariable === null) {
				setContainerDescription(analyzeErrorMessage);
				return;
			}

			const datasetType = climateVariable.getDatasetType();

			// Analysis namespace
			const analysisNamespace = datasetType === 'ahccd'
				? 'analyze-stations' // Observations
				: 'analyze'; // Analyze climate variables

			// const analysisFields = climateVariable.getAnalysisFields();
			const analysisFieldValues = climateVariable.getAnalysisFieldValues();
			const analysisUrl = climateVariable.getAnalysisUrl();

			const payload: AnalyzePayload = {
				namespace: analysisNamespace,
				signup: subscribe,
				request_data: analysisFieldValues, // TODO: not sure if this is correct but make sure it has the right data
				submit_url: analysisUrl,
			};
			if(analysisNamespace === 'analyze-stations') {
				// TODO: add selected stations
				// payload.stations = climateVariable.getSelectedStations();
				payload.required_variables = []; // TODO:
			}

			const sendRequest = async () => {
				try {
					const url = 'https://climatedata.ca/site/assets/themes/climate-data-ca/resources/ajax/finch-submit.php';
					const response = await fetch(url, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify(payload),
					});

					if (!response.ok) {
						setContainerDescription(analyzeErrorMessage);
						throw new Error('Failed to send request');
					}
		
					const data = await response.json();
					if (data.status === 'success') {
						setContainerDescription(__('Your request has been sent. It may take 30 to 90 minutes to complete, depending on available resources.'));
					}
				} catch (error) {
					setContainerDescription(analyzeErrorMessage);
					throw new Error('Failed to send request: ' + error);
				}
			};

			sendRequest();
		}
	}, [climateVariable, __, subscribe]);

	// Cleanup files when the component unmounts
	useEffect(() => {
		return () => {
			files.forEach((file) => {
				if (file.url) {
					URL.revokeObjectURL(file.url);
				}
			});
		};
	}, [files]);

	return (
		<StepContainer title={containerTitle ?? ''} isLastStep>
			<StepContainerDescription>
				{containerDescription ?? ''}
			</StepContainerDescription>

			<div className="step-result">
				{files.length > 0 && (
					<div className="mt-4">
						{files.map((file, index) => (
							<p key={index} className="mb-2">
								<a
									href={file.url}
									download={file.label}
									className={cn(
										'text-lg font-semibold text-brand-blue underline ',
									)}
									target="_blank"
								>
									{__('Download')} {file.label}
								</a>
							</p>
						))}
					</div>
				)}

				{climateVariable?.getId() === 'msc_climate_normals' && (
					<p>
						{__('Additional Climate Normals variables are available from the')} <a href="https://climate-change.canada.ca/climate-data/#/climate-normals" target="_blank" className='text-dark-purple'>{__('Canadian Centre for Climate Services')}</a> {__('and the')} <a href="https://climate.weather.gc.ca/climate_normals/index_e.html" target="_blank" className='text-dark-purple'>{__('Government of Canada Historical Climate Data')}</a> {__('websites.')}
					</p>
				)}
			</div>
		</StepContainer>
	);
});
StepResult.displayName = 'StepResult';

export default StepResult;