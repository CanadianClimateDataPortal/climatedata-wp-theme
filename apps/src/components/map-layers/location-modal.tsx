import React, {
	useEffect,
	useRef,
	useState,
} from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

import type { LegendStateChangeDetail } from '@/components/map-layers/map-legend';

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
		const [shouldShiftLeft, setShouldShiftLeft] = useState(false);
		const modalRef = useRef<HTMLDivElement>(null);

		/**
		 * Listen for legend state changes and adjust position if overlapping.
		 * Only shifts when legend is open AND in forecast mode (requirement).
		 */
		useEffect(() => {
			console.log('location-modal useEffect');
			if (!isOpen) {
				// Reset position when modal closes
				setShouldShiftLeft(false);
				return;
			}

			const handleLegendStateChange = (e: Event) => {
				console.log('location-modal useEffect handleLegendStateChange event', e);

				const customEvent = e as CustomEvent<LegendStateChangeDetail>;
				const { isOpen: legendIsOpen, rect: legendRect, isForecastMode } = customEvent.detail;

				// Only adjust if legend is open AND in forecast mode (requirement)
				if (!legendIsOpen || !isForecastMode) {
					setShouldShiftLeft(false);
					return;
				}

				// Check if modal and legend overlap
				const modalRect = modalRef.current?.getBoundingClientRect();
				if (!modalRect) return;

				const overlaps = !(
					legendRect.right < modalRect.left ||
					legendRect.left > modalRect.right ||
					legendRect.bottom < modalRect.top ||
					legendRect.top > modalRect.bottom
				);

				setShouldShiftLeft(overlaps);
			};

			document.addEventListener('legend:statechange', handleLegendStateChange);

			return () => {
				document.removeEventListener('legend:statechange', handleLegendStateChange);
			};
		}, [isOpen]);

		if (!isOpen) return null;


		return (
			<div
				ref={(node) => {
					// Store internal ref
					if (modalRef.current !== node) {
						(modalRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
					}
					// Forward to external ref
					if (typeof ref === 'function') {
						ref(node);
					} else if (ref) {
						(ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
					}
				}}
				className={cn(
					'location-modal font-sans',
					'absolute z-30 top-1/2 -translate-y-1/2 max-w-md w-full flex flex-col gap-6 p-6 bg-white rounded-lg shadow-lg',
					// Conditional positioning based on overlap
					shouldShiftLeft
						? 'md:right-[480px]' // Shifted left to avoid legend
						: 'md:right-28',      // Original position
					'md:left-auto md:translate-x-0',
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
