/**
 * AnimatedPanel
 *
 * A reusable, animated sliding panel component that can slide in from any direction.
 * It supports custom positioning, animation directions, and additional styling via class names.
 *
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X as CloseIcon } from 'lucide-react';
import { __ } from '@/context/locale-provider';

import { Button } from '@/components/ui/button';

import { cn } from '@/lib/utils';
import { AnimatedPanelProps } from '@/types/types';

const AnimatedPanel: React.FC<AnimatedPanelProps> = ({
	isOpen,
	onClose,
	direction = 'right',
	position,
	className,
	children,
}) => {
	// TODO: allow for custom animations other than "slide"
	const getAnimationProps = () => {
		switch (direction) {
			case 'right':
				return {
					initial: { x: '100%' },
					animate: { x: 0 },
					exit: { x: '100%' },
				};
			case 'left':
				return {
					initial: { x: '-100%' },
					animate: { x: 0 },
					exit: { x: '-100%' },
				};
			case 'top':
				return {
					initial: { y: '-100%' },
					animate: { y: 0 },
					exit: { y: '-100%' },
				};
			case 'bottom':
				return {
					initial: { y: '100%' },
					animate: { y: 0 },
					exit: { y: '100%' },
				};
			default:
				return {};
		}
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					<motion.div
						className='overlay absolute w-full h-full top-0 left-0 bg-gray-500/60 z-30'
						onClick={onClose}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.25 }}
					>
					</motion.div>
					<motion.div
						{...getAnimationProps()}
						transition={{ duration: 0.25 }}
						style={{
							left: direction === 'left' ? 0 : undefined, // default to all the way to the left
							right: direction === 'right' ? 0 : undefined, // default to all the way to the right
							...position, // may override left/right defaults if provided
							height: position?.top ? `calc(100% - ${position.top}px)` : undefined, // position from the top if specified
						}}
						className={cn(
							'absolute bg-white shadow-sm z-40 overflow-y-auto',
							className
						)}
					>
						<Button
							onClick={onClose}
							variant="link"
							className="absolute top-4 right-4 text-zinc-900 hover:text-dark-purple h-auto p-0 [&_svg]:size-6"
						>
							<span className="sr-only">{__('Close panel')}</span>
							<CloseIcon aria-hidden="true" focusable="false" />
						</Button>
						{children}
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
};
AnimatedPanel.displayName = 'AnimatedPanel';

export default AnimatedPanel;
