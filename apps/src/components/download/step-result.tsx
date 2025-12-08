import React, { useEffect, useState } from 'react';
import { __ } from '@/context/locale-provider';

import { StepContainer, StepContainerDescription } from '@/components/download/step-container';
import { useClimateVariable } from "@/hooks/use-climate-variable";
import {
	ClimateVariableInterface,
	DownloadFile,
	DownloadType,
	FrequencyType,
} from '@/types/climate-variable-interface';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/app/hooks';
import { sprintf } from "@wordpress/i18n";
import { trackIDFDownload, trackPrecalculatedDownload, trackStationDataDownload } from '@/lib/google-analytics';
import useS2D from '@/hooks/use-s2d';

/**
 * Track a Google Tag Manager event for a downloaded variable.
 *
 * @param climateVariable - The climate variable that has been downloaded.
 * @param fileLink - The link object of the downloaded file.
 */
function trackDownloadClick(
	climateVariable: ClimateVariableInterface,
	fileLink: DownloadFile
) {
	const downloadType = climateVariable.getDownloadType();
	const frequency = climateVariable.getFrequency();
	const mode = climateVariable?.getInteractiveMode();

	const isPrecalculated =
		downloadType === DownloadType.PRECALCULATED &&
		frequency !== FrequencyType.DAILY;
	const isStation = (mode !== 'region');

	if (!isPrecalculated) {
		// Finch requests are tracked in the steps.tsx file, when clicking on
		// the submit button
		return;
	}

	if (isStation) {
		if (climateVariable.getId() === 'short_duration_rainfall_idf_data') {
			trackIDFDownload(fileLink.label, fileLink.url);
		} else {
			trackStationDataDownload(climateVariable);
		}
	} else {
		trackPrecalculatedDownload(climateVariable);
	}
}

/**
 * Result step, the final one, allows the user to make download file or see a success message.
 */
const StepResult = React.forwardRef(() => {
	const { climateVariable } = useClimateVariable();
	const {
		requestResult,
		downloadLinks,
		requestStatus,
	} = useAppSelector((state) => state.download);
	const { isS2DVariable } = useS2D();
	const isEmptyStationDataList = climateVariable?.getId() === 'station_data'
		&& downloadLinks?.length === 0
		&& requestStatus === 'no-data';
	const externalLinkAttrs = [
		'target="_blank"',
		'rel="noopener noreferrer"',
		'class="hover:underline text-brand-blue"',
		].join(' ');

	const [containerTitle, setContainerTitle] = useState<string | null>(null);
	const [containerDescription, setContainerDescription] = useState<string | null>(null);

	// For precalculated climate variables
	const [files, setFiles] = useState<DownloadFile[]>([]);

	// Set title, description and file
	useEffect(() => {
		const isFinchRequest =
			climateVariable?.getDownloadType() === DownloadType.ANALYZED ||
			climateVariable?.getFrequency() === FrequencyType.DAILY;

		if (isFinchRequest && requestResult) {
			if (requestResult?.status === 'accepted') {
				setContainerTitle(__('Your request has been sent.'));
				setContainerDescription(__('It may take 30 to 90 minutes to complete, depending on available resources.'));
			}
		} else if (climateVariable?.getDownloadType() === DownloadType.PRECALCULATED && downloadLinks) {
			setContainerTitle(__('Your file is ready to download.'));
			setContainerDescription(__('Click the button below to start the download.'));
			setFiles(downloadLinks);
		}
	}, [climateVariable, requestResult, downloadLinks]);

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

	function handleDownloadLinkClick(file: DownloadFile) {
		if (climateVariable) {
			trackDownloadClick(climateVariable, file);
		}
	}

	return (
		<StepContainer title={containerTitle ?? ''} isLastStep>
			<StepContainerDescription>
				{containerDescription ?? ''}
			</StepContainerDescription>

			<div className="step-result">
				{downloadLinks && downloadLinks.length > 0 && (
					<div className="mt-4 overflow-auto" style={{ maxHeight: '50vh' }}>
						{downloadLinks.map((file, index) => (
							<p key={index} className="mb-2">
								<a
									{...file.linkAttributes}
									href={file.url}
									onClick={() => handleDownloadLinkClick(file)}
									download={file.fileName}
									className={cn(
										'text-lg font-semibold text-brand-blue underline',
										file.linkAttributes?.className,
									)}
									target="_blank"
								>
									{file.label}
								</a>
							</p>
						))}
					</div>
				)}
				{isEmptyStationDataList && (
					<p className="mt-4">
						<span>⚠️ </span>
						<span dangerouslySetInnerHTML={{ __html:
							sprintf(
								__(
									"The selected station(s) don't have data for the selected time period, please " +
									'consult the <a href="https://api.weather.gc.ca/collections/climate-stations/items?f=csv&limit=10000" %s>station list</a> ' +
									'for more information. The "Search by proximity" tab on the ' +
									'<a href="https://climate.weather.gc.ca/historical_data/search_historic_data_e.html" %s>Historical ' +
									'Data - Climate</a> webpage can be used to locate nearby weather stations that ' +
									'include data for a specified time period.'
								),
								externalLinkAttrs,
								externalLinkAttrs,
							)
						}}
						/>
					</p>
				)}
				{climateVariable?.getId() === 'msc_climate_normals' && (
					<p className="mt-4" dangerouslySetInnerHTML={{ __html:
						sprintf(
							__(
								'Additional Climate Normals variables are available from the ' +
								'<a href="https://climate-change.canada.ca/climate-data/#/climate-normals" %s>' +
								'Canadian Centre for Climate Services</a> and the ' +
								'<a href="https://climate.weather.gc.ca/climate_normals/index_e.html" %s>' +
								'Government of Canada Historical Climate Data</a> websites.'
							),
							externalLinkAttrs,
							externalLinkAttrs,
						)
					}}
					/>
				)}
				{isS2DVariable && (
					<p className="mt-4" dangerouslySetInnerHTML={{ __html:
						sprintf(
							__(
								'For access to global S2D forecast data or to set up automated downloads, please ' +
								'visit <a href="https://eccc-msc.github.io/open-data/msc-data/nwp_cansips/readme_cansips_en/" %s>GeoMet</a> ' +
								'(Environment and Climate Change Canada site).'
							),
							externalLinkAttrs,
						)
					}}
					/>
				)}
			</div>
		</StepContainer>
	);
});
StepResult.displayName = 'StepResult';

export default StepResult;
