import React from 'react';

import { Download, Camera } from 'lucide-react';

import { cn } from '@/lib/utils';
import { __ } from '@/context/locale-provider';

import { Button } from '@/components/ui/button';

export const MAP_HEADER_BUTTON_CLASS_NAME = [
	'text-md font-normal leading-6 tracking-[0.8px] uppercase',
	'rounded-full h-7 sm:h-9 max-sm:py-1.5 max-sm:px-3',
] as Readonly<string[]>;

export const DownloadMapSplitButton = (
): React.ReactElement => {

	const buttonClassName = cn(MAP_HEADER_BUTTON_CLASS_NAME, 'gap-2 sm:gap-2');

	return (
		<div className="flex gap-2">
			<div className="py-2">{__('Download') + ':'}</div>
			<Button
				variant="destructive"
				className={buttonClassName}
			>
				<span className="hidden sm:block">
					{__('Map')}{' '}
					<span className="sr-only">
						{__('image from your viewport')}
					</span>
				</span>
				<Camera />
			</Button>
			<Button
				variant="destructive"
				className={buttonClassName}
			>
				<span className="hidden sm:block">
					{__('Data')}{' '}
					<span className="sr-only">
						{__('section to select data download')}
					</span>
				</span>
				<Download />
			</Button>
		</div>
	)
};

DownloadMapSplitButton.displayName = 'DownloadMapSplitButton';
