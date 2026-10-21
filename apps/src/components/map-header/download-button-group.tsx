import React from 'react';

import { Download, Camera } from 'lucide-react';

import { cn } from '@/lib/utils';
import { __ } from '@/context/locale-provider';

import { useMapHeaderDownload } from '@/hooks/use-map-header-download';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

export const MAP_HEADER_BUTTON_CLASS_NAME = [
	'text-md font-normal leading-6 tracking-[0.8px] uppercase',
	'rounded-full h-7 sm:h-9 max-sm:py-1.5 max-sm:px-3',
] as Readonly<string[]>;

/**
 * The download buttons of the map header.
 * The Map button saves a PNG image of the current map view, which the screenshot service makes.
 * The Data button opens the Download app in a new tab, with the current dataset and variable selected.
 * The two buttons sit close together, because both are about a download.
 */
export const DownloadButtonGroup = (
): React.ReactElement => {
	const {
		dataDownloadPageHref,
		mapImageDownloadPending,
		startMapImageDownload,
	} = useMapHeaderDownload();

	const buttonClassName = cn(MAP_HEADER_BUTTON_CLASS_NAME, 'gap-2 sm:gap-2');

	const handleDataDownloadPageOpen: React.MouseEventHandler<HTMLButtonElement> = (
	) => {
		window.open(dataDownloadPageHref);
	};

	// `aria-disabled` keeps the button focusable while the service generates the
	// image, so Enter and Space still reach this handler, which ignores them.
	// A native `disabled` would move keyboard focus to the page body instead.
	const handleMapImageDownloadActivate: React.MouseEventHandler<HTMLButtonElement> = (
	) => {
		if (mapImageDownloadPending) {
			return;
		}
		startMapImageDownload();
	};

	return (
		<div
			className="flex items-center gap-2"
			data-part="map-header-download-button-group"
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
				className={cn(buttonClassName, mapImageDownloadPending && 'opacity-50 pointer-events-none')}
				onClick={handleMapImageDownloadActivate}
				aria-disabled={mapImageDownloadPending}
			>
				<span className="hidden sm:block">
					{__('Map')}{' '}
				</span>
				<span className="sr-only">
					{__('Download image from viewport')}
				</span>
				{mapImageDownloadPending
					// `Spinner` passes on only `className` and `size`, not `aria-hidden`, so this wrapper hides it from assistive technology.
					? <span className="flex" aria-hidden="true"><Spinner className="stroke-white" size="1rem" /></span>
					: <Camera aria-hidden="true" />
				}
			</Button>
			<Button
				variant="destructive"
				className={buttonClassName}
				onClick={handleDataDownloadPageOpen}
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
				{mapImageDownloadPending ? __('Generating...') : ''}
			</span>
		</div>
	)
};

DownloadButtonGroup.displayName = 'DownloadButtonGroup';

export default DownloadButtonGroup;
