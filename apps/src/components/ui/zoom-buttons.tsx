/**
 * ZoomControl Component
 *
 * A custom control for zooming in and out on the map.
 *
 */
import React, {
	useMemo,
} from 'react';
import { nanoid } from 'nanoid';
import { Plus, Minus } from 'lucide-react';

import { __ } from '@/context/locale-provider';

import { cn } from '@/lib/utils';

interface ZoomButtonsProps {
	className?: string;
	onZoomIn: () => void;
	onZoomOut: () => void;
	wrapperClass?: string;
}

const ZoomButtons = (
	props: ZoomButtonsProps,
): React.ReactElement => {
	const {
		onZoomIn,
		onZoomOut,
		className,
		wrapperClass,
	} = props;

	// we need a unique id for the search control container for cases where multiple maps
	// are rendered on the same page -- ie. comparing emission scenarios
	const uniqueId = useMemo(() => {
		const suffix = nanoid(5);
		return 'zoom-buttons-' + suffix;
	}, []);

	const classNameForButton = cn(
		'flex items-center justify-center',
		'w-9 h-9',
		'bg-white hover:bg-cold-gray-3',
		'border-cold-gray-3',
		'shadow-sm'
	);

	return (
		<div
			className="absolute bottom-6 left-6 z-20 overflow-y-auto"
			data-raster="false"
			id={uniqueId}
		>
			<div
				className={cn(
					'zoom-control',
					'flex flex-col items-center gap-1',
					wrapperClass
				)}
			>
				<button
					onClick={onZoomIn}
					className={cn(classNameForButton, className)}
					aria-label={__('Zoom In')}
				>
					<Plus className="w-4 h-4 text-zinc-900" />
				</button>
				<button
					onClick={onZoomOut}
					className={cn(classNameForButton, className)}
					aria-label={__('Zoom Out')}
				>
					<Minus className="w-4 h-4 text-zinc-900" />
				</button>
			</div>
		</div>
	);
};

ZoomButtons.displayName = 'ZoomButtons'; // Explicit string literal, or this name would be lost in production.

export default ZoomButtons;
