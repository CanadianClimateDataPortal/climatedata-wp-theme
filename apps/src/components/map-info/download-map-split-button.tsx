import React from 'react';

import { Download, Camera } from 'lucide-react';

import { cn } from '@/lib/utils';
import { __ } from '@/context/locale-provider';

import { useMapHeaderButtonsDownload } from '@/hooks/use-map-header-buttons-download';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

export const MAP_HEADER_BUTTON_CLASS_NAME = [
	'text-md font-normal leading-6 tracking-[0.8px] uppercase',
	'rounded-full h-7 sm:h-9 max-sm:py-1.5 max-sm:px-3',
] as Readonly<string[]>;

export const DownloadMapSplitButton = (
): React.ReactElement => {
	const {
		downloadDataHref,
		imageDownloadOnClick,
		imageDownloadButtonWorking,
	} = useMapHeaderButtonsDownload();

	const buttonClassName = cn(MAP_HEADER_BUTTON_CLASS_NAME, 'gap-2 sm:gap-2');

	const goToDataDownloadOnClick: React.MouseEventHandler<HTMLButtonElement> = (
	) => {
		window.open(downloadDataHref);
	};

	return (
		<div
			className="flex gap-2"
			data-part="download-map-split-button"
		>
			<div className="py-2">{__('Download') + ':'}</div>
			<Button
				variant="destructive"
				className={buttonClassName + (imageDownloadButtonWorking ? ' opacity-50 pointer-events-none' : '')}
				onClick={imageDownloadOnClick}
				disabled={imageDownloadButtonWorking}
			>
				<span className="hidden sm:block">
					{__('Map')}{' '}
					<span className="sr-only">
						{__('image from your viewport')}
					</span>
				</span>
				{imageDownloadButtonWorking ? <Spinner className="stroke-white" /> : <Camera />}
			</Button>
			<Button
				variant="destructive"
				className={buttonClassName}
				onClick={goToDataDownloadOnClick}
				aria-label={__(
					'Go to download sections (opens in a new tab)'
				)}
			>
				<span className="hidden sm:block">
					{__('Data')}{' '}
				</span>
				<Download />
			</Button>
		</div>
	)
};

DownloadMapSplitButton.displayName = 'DownloadMapSplitButton';
