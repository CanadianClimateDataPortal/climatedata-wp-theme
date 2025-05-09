import React, { useState, useEffect } from 'react';
import { useI18n } from '@wordpress/react-i18n';

import {
	StepContainer,
	StepContainerDescription,
} from '@/components/download/step-container';
import { useClimateVariable } from "@/hooks/use-climate-variable";
import { DownloadType, StationDownloadUrlsProps, DownloadFile } from '@/types/climate-variable-interface';
import { cn } from '@/lib/utils';

/**
 * Result step, the final one, allows the user to make download file or see a success message.
 */
const StepResult = React.forwardRef(() => {
	const { __ } = useI18n();
	const { climateVariable } = useClimateVariable();

	const [containerTitle, setContainerTitle] = useState<string | null>(null);
	const [containerDescription, setContainerDescription] = useState<string | null>(null);

	// For precalculated climate variables
	const [files, setFiles] = useState<DownloadFile[]>([]);

	// Set title, description and file
	useEffect(() => {
		if (climateVariable?.getDownloadType() === DownloadType.PRECALCULATED) {
			// Download climate variable
			setContainerTitle(__('Download your file'));
			setContainerDescription(__('Your request is being sent...'));

			if(climateVariable.getInteractiveMode() === 'region') {
				// Generate the file to be downloaded.
				climateVariable.getDownloadUrl()
				.then((url) => {
					const file: DownloadFile = {
						url: url ?? '',
						label: 'file.zip'
					};
					setFiles([file]);

					setContainerDescription(__('Your file is ready to download. Click the button below to start the download.'));
				})
				.catch(() => {
					setContainerDescription(__('An error occurred while preparing your file. Please try again later.'));
				});
			} else if(climateVariable.getInteractiveMode() === 'station') {
				// For station variables

				// TODO: set StationDownloadUrlsProps
				// TODO: replace with correct data
				const stationDownloadUrlsProps: StationDownloadUrlsProps = {} as StationDownloadUrlsProps;
				if(climateVariable.getId() === 'msc_climate_normals') {
					stationDownloadUrlsProps.stationIds = ['7113534', '8502800'];
					stationDownloadUrlsProps.fileFormat = 'csv';
				} else if(climateVariable.getId() === 'daily_ahccd_temperature_and_precipitation') {
					stationDownloadUrlsProps.stationIds = ['7093GJ5', '7115800'];
					stationDownloadUrlsProps.fileFormat = 'csv';
				}
				else if(climateVariable.getId() === 'future_building_design_value_summaries') {
					stationDownloadUrlsProps.stationName = 'Happy Valley-Goose Bay, NL';
				}
				else if(climateVariable.getId() === 'short_duration_rainfall_idf_data') {
					stationDownloadUrlsProps.stationId = '8501132';
				}
				else if(climateVariable.getId() === 'station_data') {
					stationDownloadUrlsProps.stationIds = ['54058', '6093'];
					stationDownloadUrlsProps.fileFormat = 'csv';
					stationDownloadUrlsProps.dateRange = {start: '1840-03-01', end: '2025-05-06'};
				}

				climateVariable.getStationDownloadFiles(stationDownloadUrlsProps)
					.then((downloadFiles) => {
						if(downloadFiles.length > 1) {
							setContainerDescription(__('Your files are ready to download. Click the buttons below to start the download.'));
						} else if(downloadFiles.length > 0) {
							setContainerDescription(__('Your file is ready to download. Click the button below to start the download.'));
						} else {
							setContainerDescription(__('An error occurred while preparing your files. Please try again later.'));
						}

						setFiles(downloadFiles);
					})
					.catch(() => {
						setContainerDescription(__('An error occurred while preparing your files. Please try again later.'));
					});
			}
		} else {
			// Analyzed climate variable
			setContainerTitle(__('Sent request'));
			setContainerDescription(__('Your request has been sent. It may take 30 to 90 minutes to complete, depending on available resources.'));

			// TODO: analyze climate variable part
		}
	}, [climateVariable, __]);

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