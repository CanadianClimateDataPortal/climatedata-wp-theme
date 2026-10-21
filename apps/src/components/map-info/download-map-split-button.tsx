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

	// `aria-disabled` keeps the button focusable while the service generates the
	// image, so Enter and Space still reach this handler, which ignores them.
	// A native `disabled` would move keyboard focus to the page body instead.
	const mapDownloadOnClick: React.MouseEventHandler<HTMLButtonElement> = (
	) => {
		if (imageDownloadButtonWorking) {
			return;
		}
		imageDownloadOnClick();
	};

	return (
		<div
			className="flex items-center gap-2"
			data-part="download-map-split-button"
		>
			{/* Each button's accessible name already says it downloads, so this label would only repeat it. */}
			<div
				className="max-sm:text-sm"
				aria-hidden="true"
			>
				{__('Download:')}
			</div>
			<Button
				variant="destructive"
				className={cn(buttonClassName, imageDownloadButtonWorking && 'opacity-50 pointer-events-none')}
				onClick={mapDownloadOnClick}
				aria-disabled={imageDownloadButtonWorking}
			>
				<span className="hidden sm:block">
					{__('Map')}{' '}
				</span>
				<span className="sr-only">
					{__('Download image from viewport')}
				</span>
				{imageDownloadButtonWorking
					// `Spinner` takes no other props, so this wrapper hides it from assistive technology.
					? <span className="flex" aria-hidden="true"><Spinner className="stroke-white" size="1rem" /></span>
					: <Camera aria-hidden="true" />
				}
			</Button>
			<Button
				variant="destructive"
				className={buttonClassName}
				onClick={goToDataDownloadOnClick}
			>
				<span className="hidden sm:block">
					{__('Data')}{' '}
				</span>
				<span className="sr-only">
					{__('Go to download sections (opens in a new tab)')}
				</span>
				<Download aria-hidden="true" />
			</Button>
			<span
				role="status"
				className="sr-only"
			>
				{imageDownloadButtonWorking ? __('Generating...') : ''}
			</span>
		</div>
	)
};

DownloadMapSplitButton.displayName = 'DownloadMapSplitButton';
