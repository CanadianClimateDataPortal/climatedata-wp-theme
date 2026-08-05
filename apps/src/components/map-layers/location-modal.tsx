import React, {
	useEffect,
	useMemo,
	useRef,
} from 'react';
import { nanoid } from 'nanoid';
import { X } from 'lucide-react';
import L from 'leaflet';
import { LOCATION_MODAL_BASE_CLASS_NAMES } from '@/lib/location-modal-class-names';
import { cn } from '@/lib/utils';
import { __ } from '@/context/locale-provider';

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
		const internalRef = useRef<HTMLDivElement>(null);

		// Unique id, needed when multiple maps are rendered on the same page
		// -- e.g. comparing emission scenarios side by side.
		// The `location-modal-` prefix is a contract: `getLocationModalInnerHTML`
		// selects on it to scrape this markup into the map-image export payload.
		// Renaming the prefix here without renaming it there exports a map with
		// no popup on it.
		const uniqueId = useMemo(() => {
			const suffix = nanoid(5);
			return 'location-modal-' + suffix;
		}, []);

		// Prevent Leaflet from capturing mouse events, to allow the user
		// to scroll inside the modal, and select the text
		useEffect(() => {
			const element = internalRef.current;
			if (element) {
				L.DomEvent.disableClickPropagation(element);
				L.DomEvent.disableScrollPropagation(element);
			}
		}, [isOpen]);

		if (!isOpen) return null;

		// classNames for the top-level element of this component.
		const topElementClassNames = cn(
			...LOCATION_MODAL_BASE_CLASS_NAMES,
			// External overrides from className prop
			className
		);

		return (
			<div
				ref={(node) => {
					// Handle both the forwarded ref and the internal ref
					if (typeof ref === 'function') {
						ref(node);
					} else if (ref) {
						ref.current = node;
					}
					// @ts-expect-error: internalRef is used for DOM manipulation
					internalRef.current = node;
				}}
				className={topElementClassNames}
				role="dialog"
				aria-modal="true"
				aria-labelledby="modal-title" // Links to the title for accessibility
				aria-describedby="modal-description" // Links to the description for accessibility
				id={uniqueId}
				{...props}
			>
				<button
					className={cn(
						'absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none'
					)}
					data-raster="false"
					onClick={onClose}
					aria-label={__('Close Modal')}
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
