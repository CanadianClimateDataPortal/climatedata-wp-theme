/**
 * `ZoomButtons` — the plus/minus pair for zooming a map in and out.
 *
 * Presentation only: it renders buttons and reports clicks.
 * `ZoomControlLayer` in `components/map-layers/zoom-control.tsx` is what binds
 * those clicks to a Leaflet map.
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

	// Unique id for this control's wrapper, needed when multiple maps are
	// rendered on the same page -- e.g. comparing emission scenarios side by side.
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
		// `data-raster="false"` drops the zoom control from the exported map image,
		// where a button does nothing.
		// Vocabulary: `apps/src/lib/map/image-rastering/README.md`.
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
