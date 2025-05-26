/**
 * ZoomControl Component
 *
 * A custom control for zooming in and out on the map.
 *
 */
import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { __ } from '@/context/locale-provider';

import { ZoomControlProps } from '@/types/types';
import { cn } from '@/lib/utils';

const ZoomButtons: React.FC<ZoomControlProps> = ({
	onZoomIn,
	onZoomOut,
	className,
	wrapperClass,
}) => {
	const buttonClasses = cn(
		'flex items-center justify-center',
		'w-9 h-9',
		'bg-white hover:bg-cold-gray-3',
		'border-cold-gray-3',
		'shadow-sm'
	);

	return (
		<div id="map-zoom-control" className="absolute bottom-6 left-6 z-20 overflow-y-auto">
			<div
				className={cn(
					'zoom-control',
					'flex flex-col items-center gap-1',
					wrapperClass
				)}
			>
				<button
					onClick={onZoomIn}
					className={cn(buttonClasses, className)}
					aria-label={__('Zoom In')}
				>
					<Plus className="w-4 h-4 text-zinc-900" />
				</button>
				<button
					onClick={onZoomOut}
					className={cn(buttonClasses, className)}
					aria-label={__('Zoom Out')}
				>
					<Minus className="w-4 h-4 text-zinc-900" />
				</button>
			</div>
		</div>
	);
};

export default ZoomButtons;
