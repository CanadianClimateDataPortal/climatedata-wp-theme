import React from 'react';
import { Share2 } from 'lucide-react';
import { __ } from '@/context/locale-provider';
import { cn } from '@/lib/utils';

import DownloadButtonGroup, {
	MAP_HEADER_BUTTON_CLASS_NAME,
} from '@/components/map-header/download-button-group';
import { Button } from '@/components/ui/button';

interface ActionButtonsProps {
	onToggleShare: () => void;
	className: string;
}

/**
 * ActionButtons, the buttons on the right of the breadcrumb to do actions about the map.
 * Share button (instead of copying the map link) and Download buttons
 */

export const ActionButtons = (
	props: ActionButtonsProps,
): React.ReactElement => {
	const{
		onToggleShare,
		className,
	} = props;

	return (
		<div className={cn('flex gap-3', className)}>

			<Button
				variant="outline"
				className={cn(MAP_HEADER_BUTTON_CLASS_NAME, 'border border-cold-grey-4')}
				onClick={onToggleShare}
			>
				<div className="sr-only sm:not-sr-only text-dark-purple">
					{__('Share')}{' '}
					<span className="sr-only">
						{__('the current visible map')}
					</span>
				</div>
				<Share2 aria-hidden="true" />
			</Button>

			<DownloadButtonGroup />

		</div>
	);
};
ActionButtons.displayName = 'ActionButtons';
