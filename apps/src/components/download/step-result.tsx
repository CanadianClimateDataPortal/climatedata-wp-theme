import React, { useState, useEffect } from 'react';
import { __ } from '@/context/locale-provider';

import {
	StepContainer,
	StepContainerDescription,
} from '@/components/download/step-container';
import { useClimateVariable } from "@/hooks/use-climate-variable";
import { DownloadType, DownloadFile } from '@/types/climate-variable-interface';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/app/hooks';

/**
 * Result step, the final one, allows the user to make download file or see a success message.
 */
const StepResult = React.forwardRef(() => {
	const { climateVariable } = useClimateVariable();
	const { requestResult, downloadLinks } = useAppSelector((state) => state.download);

	const [containerTitle, setContainerTitle] = useState<string | null>(null);
	const [containerDescription, setContainerDescription] = useState<string | null>(null);

	// For precalculated climate variables
	const [files, setFiles] = useState<DownloadFile[]>([]);

	// Set title, description and file
	useEffect(() => {
		if (climateVariable?.getDownloadType() === DownloadType.ANALYZED && requestResult) {
			if (requestResult?.status === 'accepted') {
				setContainerTitle(__('Your request has been sent.'));
				setContainerDescription(__('It may take 30 to 90 minutes to complete, depending on available resources.'));
			}
		} else if (climateVariable?.getDownloadType() === DownloadType.PRECALCULATED && downloadLinks) {
			setContainerTitle(__('Your file is ready to download.'));
			setContainerDescription('Click the button below to start the download.');
			setFiles(downloadLinks);
		}
	}, [climateVariable, requestResult, downloadLinks, __]);

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
				{downloadLinks && downloadLinks.length > 0 && (
					<div className="mt-4">
						{downloadLinks.map((file, index) => (
							<p key={index} className="mb-2">
								<a
									href={file.url}
									download={file.label}
									className={cn('text-lg font-semibold text-brand-blue underline ')}
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