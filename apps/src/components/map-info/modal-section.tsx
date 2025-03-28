import React, { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/**
 * A wrapper for a block of content in a modal for the map info header.
 */
const ModalSection: React.FC<HTMLAttributes<HTMLDivElement>> = ({
	children,
	className,
	...props
}) => (
	<div
		className={cn(
			className,
			'[&>*:first-child>h3]:mb-2 [&>*:not(:first-child)>h3]:mb-1.5'
		)}
		{...props}
	>
		{children}
	</div>
);

ModalSection.displayName = 'ModalSection';

/**
 * A section block for the modal section.
 */
const ModalSectionBlock: React.FC<HTMLAttributes<HTMLDivElement>> = ({
	children,
	className,
	...props
}) => (
	<div className={cn('mb-6 last:mb-0', className)} {...props}>
		{children}
	</div>
);
ModalSectionBlock.displayName = 'ModalSectionBlock';

/**
 * Title for the modal section block.
 */
const ModalSectionBlockTitle: React.FC<HTMLAttributes<HTMLHeadingElement>> = ({
	children,
	className,
	...props
}) => (
	<h3
		className={cn('text-cdc-black font-semibold leading-4', className)}
		{...props}
	>
		{children}
	</h3>
);
ModalSectionBlockTitle.displayName = 'ModalSectionBlockTitle';

/**
 * Description for the modal section block.
 */
const ModalSectionBlockDescription: React.FC<
	HTMLAttributes<HTMLParagraphElement>
> = ({ children, className, ...props }) => (
	<p
		className={cn(
			'text-neutral-grey-medium text-sm leading-5 mb-2.5',
			className
		)}
		{...props}
	>
		{children}
	</p>
);
ModalSectionBlockDescription.displayName = 'ModalSectionBlockDescription';

export {
	ModalSection,
	ModalSectionBlock,
	ModalSectionBlockTitle,
	ModalSectionBlockDescription,
};
