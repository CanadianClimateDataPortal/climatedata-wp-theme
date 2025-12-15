import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/app/hooks';

interface LocationModalProps {
	isOpen: boolean;
	onClose: () => void;
	className?: string;
	children: React.ReactNode;
}

/**
 * LocationModal Component
 * ---------------------------
 * A modal component specifically designed for displaying location information.
 * It's positioned on the right side of the screen, vertically centered.
 *
 * Positioning adjusts automatically based on legend state:
 * - When legend is closed: `md:right-28` (~112px from right)
 * - When legend is open: `md:right-[480px]` (~480px from right to avoid overlap)
 */
const LocationModal = React.forwardRef<HTMLDivElement, LocationModalProps>(
	({ isOpen, onClose, className, children, ...props }, ref) => {
		const isLegendOpen = useAppSelector((state) => state.map.legend.isOpen);

		if (!isOpen) return null;

		// classNames for the top-level element of this component.
		const topElementClassNames = cn(
			'location-modal',
			'font-sans',
			'bg-white rounded-lg shadow-lg',
			'absolute z-30 flex flex-col',
			'max-w-md w-full',
			'gap-6 p-6',
			'top-1/2 -translate-y-1/2',
			// Small screens: center horizontally
			'left-1/2 -translate-x-1/2', // TODO: Check why these aren't prefixed with "sm:"
			// Medium screens and up: position from right, adjust based on legend state
			'md:left-auto md:translate-x-0',
			isLegendOpen ? 'md:right-[480px]' : 'md:right-28',
			// External overrides from className prop
			className
		);

		return (
			<div
				ref={ref}
				className={topElementClassNames}
				role="dialog"
				aria-modal="true"
				aria-labelledby="modal-title" // Links to the title for accessibility
				aria-describedby="modal-description" // Links to the description for accessibility
				{...props}
			>
				<button
					className={cn(
						'absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none'
					)}
					onClick={onClose}
					aria-label="Close Modal"
				>
					<X className="h-4 w-4" />
				</button>
				{children}
			</div>
		);
	}
);

LocationModal.displayName = 'LocationModal';

export default LocationModal;
