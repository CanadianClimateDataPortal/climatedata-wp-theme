/**
 * @description A reusable modal dialog component with customizable content. It supports screen reader accessibility and dynamic styling.
 * Designed for use in various contexts, allowing additional styling via the `className` prop.
 */

import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModalProps } from '@/types/types';

/**
 * Modal Component
 * ---------------------------
 * A reusable modal dialog component with customizable content.
 *
 * @param {ModalProps} props - The props for the Modal component.
 * @property {boolean} isOpen - Controls whether the modal is visible.
 * @property {() => void} onClose - Callback function to close the modal.
 * @property {string} [className] - Optional additional classes for styling the modal.
 * @property {React.ReactNode} children - Content to display inside the modal.
 * @returns {JSX.Element | null} The rendered modal or null if not visible.
 */
const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
	({ isOpen, onClose, className, children, ...props }, ref) => {
		if (!isOpen) return null;

		return (
			<div
				className="modal fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]"
				onClick={onClose}
				role="presentation" // Indicates the backdrop is a background presentation element
				aria-hidden={!isOpen} // Ensures the backdrop is ignored by screen readers when modal is not open
			>
				<div
					ref={ref}
					className={cn(
						'p-6 bg-white rounded-md shadow-lg max-w-md mx-auto relative flex flex-col gap-6',
						className
					)}
					onClick={(e: React.MouseEvent<HTMLDivElement>) =>
						e.stopPropagation()
					} // Prevent closing modal when clicking inside
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
			</div>
		);
	}
);

Modal.displayName = 'Modal';

export default Modal;
