import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

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
 */
const LocationModal = React.forwardRef<HTMLDivElement, LocationModalProps>(
	({ isOpen, onClose, className, children, ...props }, ref) => {
		if (!isOpen) return null;

		return (
			<div
				ref={ref}
				className={cn(
					'fixed z-30 top-1/2 -translate-y-1/2 max-w-md w-full flex flex-col gap-6 p-6 bg-white rounded-lg shadow-lg',
					'md:right-28 md:left-auto md:translate-x-0',
					'left-1/2 -translate-x-1/2', // Center horizontally by default (sm and below)
					className
				)}
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
