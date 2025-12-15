import React, {
	useEffect,
	useRef,
	useState,
} from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LocationModalProps {
	isOpen: boolean;
	onClose: () => void;
	className?: string;
	children: React.ReactNode;
}

// MUST ALWAYS BE THERE
const LOCATION_MODAL_CLASS_LIST_0 = 'location-modal';
// Font and text
const LOCATION_MODAL_CLASS_LIST_1 = 'font-sans';
// Background and effects
const LOCATION_MODAL_CLASS_LIST_2 = 'bg-white rounded-lg shadow-lg';
// Positioning mode and display type (flex)
const LOCATION_MODAL_CLASS_LIST_3 = 'absolute z-30 flex flex-col';
// Size constraints
const LOCATION_MODAL_CLASS_LIST_4 = 'max-w-md w-full';
// Spacing between elements and padding
const LOCATION_MODAL_CLASS_LIST_5 = 'gap-6 p-6';
// Vertical centering
const LOCATION_MODAL_CLASS_LIST_6 = 'top-1/2 -translate-y-1/2';
// Static adjustments for ...
const LOCATION_MODAL_CLASS_LIST_7 = 'md:left-auto md:translate-x-0 md:right-28';
// Static adjustments for small screens and below
const LOCATION_MODAL_CLASS_LIST_8 = 'sm:left-1/2 sm:-translate-x-1/2'; // Center horizontally by default (sm and below) -- Was missing :sm

const figureOutClassList = (
	fromOutside: string,
) => {
	return cn(
		/**
		 * Reminder that cn's first argument has different treatment than the rest.
		 */
		[
			LOCATION_MODAL_CLASS_LIST_0,
			LOCATION_MODAL_CLASS_LIST_1,
			LOCATION_MODAL_CLASS_LIST_2,
			LOCATION_MODAL_CLASS_LIST_3,
		].join(' '),
		[
			LOCATION_MODAL_CLASS_LIST_4,
			LOCATION_MODAL_CLASS_LIST_5,
			LOCATION_MODAL_CLASS_LIST_6,
			LOCATION_MODAL_CLASS_LIST_7,
			LOCATION_MODAL_CLASS_LIST_8,
		].join(' '),
		fromOutside,
	);
};


const INITIAL_LOCATION_MODAL_CLASS_NAME_LIST = figureOutClassList('');

/**
 * LocationModal Component
 * ---------------------------
 * A modal component specifically designed for displaying location information.
 * It's positioned on the right side of the screen, vertically centered.
 */
const LocationModal = React.forwardRef<HTMLDivElement, LocationModalProps>(
	({ isOpen, onClose, className, children, ...props }, ref) => {
		const [locationModalClassNameList, locationModalClassNameListSet] = useState<string>(INITIAL_LOCATION_MODAL_CLASS_NAME_LIST);

		useEffect(() => {
			console.log('locationModalClassNameListSet');
			locationModalClassNameListSet(figureOutClassList(className ?? ''));
			Reflect.set(window, 'setter', (mine: string) => locationModalClassNameListSet(figureOutClassList(mine + ' ' + (className ?? ''))) );
		}, [
			className,
		]);

		if (!isOpen) return null;

		return (
			<div
				ref={ref}
				className={locationModalClassNameList}
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
