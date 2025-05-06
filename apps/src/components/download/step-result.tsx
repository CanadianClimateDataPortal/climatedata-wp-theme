import React, { useState, useEffect } from 'react';
import { useI18n } from '@wordpress/react-i18n';

import {
	StepContainer,
	StepContainerDescription,
} from '@/components/download/step-container';
import { useClimateVariable } from "@/hooks/use-climate-variable";
import { DownloadType } from '@/types/climate-variable-interface';
import { cn } from '@/lib/utils';

/**
 * Result step, the final one, allows the user to make download file or see a success message.
 */
const StepResult = React.forwardRef(() => {
	const { __ } = useI18n();
	const { climateVariable } = useClimateVariable();

	const [containerTitle, setContainerTitle] = useState<string | null>(null);
	const [containerDescription, setContainerDescription] = useState<string | null>(null);

	// For download climate variables
	const [fileUrl, setFileUrl] = useState<string | null>(null);
	const [downloaded, setDownloaded] = useState(false);

	// Set title, description and file
	useEffect(() => {
		if (climateVariable?.getDownloadType() === DownloadType.PRECALCULATED) {
			// Download climate variable
			setContainerTitle(__('Download your file'));
			setContainerDescription(__('Your request is being sent...'));

			// Generate the file to be downloaded.
			climateVariable.getDownloadUrl()
			.then((url) => {
				setDownloaded(false);
				setFileUrl(url);

				setContainerDescription(__('Your file is ready to download. Click the button below to start the download.'));
			})
			.catch(() => {
				setContainerDescription(__('An error occurred while preparing your file. Please try again later.'));
			});
		} else {
			// Analyzed climate variable
			setContainerTitle(__('Sent request'));
			setContainerDescription(__('Your request has been sent. It may take 30 to 90 minutes to complete, depending on available resources.'));

			// TODO: analyze climate variable part
		}
	}, [climateVariable, __]);

	// Cleanup fileUrl when the component unmounts
	useEffect(() => {
		return () => {
			if (fileUrl !== null) {
				URL.revokeObjectURL(fileUrl);
			}
		};
	}, [fileUrl]);

	// Handle the download click event
	const handleDownloadClick = () => {
	if (fileUrl) {
	  setDownloaded(true);
		
	  setTimeout(() => {
			URL.revokeObjectURL(fileUrl);
			setFileUrl(null);
	  }, 1000); // Delay revoking the URL to allow the download to start
	}
  };

	return (
		<StepContainer title={containerTitle ?? ''} isLastStep>
			<StepContainerDescription>
				{containerDescription ?? ''}
			</StepContainerDescription>

			<div className="step-result">
				{fileUrl && (
					<p className="mt-4">
						<a href={fileUrl} 
							download="file.zip" 
							onClick={handleDownloadClick}
							className={cn(
								'inline-block w-64 mx-auto sm:mx-0 py-2 rounded-full uppercase text-white tracking-wider',
								'text-center bg-brand-red hover:bg-brand-red/75'
							)}
						>
							{__('Download file')} &rarr;
						</a>
					</p>
				)}

				{downloaded && (
					<p className="mt-4 text-green-500">
						{__('File downloaded successfully!')}
					</p>
				)}
			</div>
		</StepContainer>
	);
});
StepResult.displayName = 'StepResult';

export default StepResult;