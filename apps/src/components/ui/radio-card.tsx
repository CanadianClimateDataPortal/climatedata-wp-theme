/**
 * RadioCard Component
 *
 * A custom `RadioCard` component for rendering a styled radio button as a card.
 */
import React from 'react';
import { Circle } from 'lucide-react';

import { cn } from '@/lib/utils';
import { RadioCardProps } from '@/types/types';

const RadioCard: React.FC<RadioCardProps> = ({
	value,
	radioGroup, // used as the `name` attribute for the radio input
	title,
	description,
	selected,
	onSelect,
	className,
	thumbnail,
	children,
	...props
}) => {
	const renderSelectedStatusIcon = () => {
		if (selected) {
			return (
				<div className="w-4 h-4 bg-brand-red rounded-full">
					<Circle size="16" className="text-white" />
				</div>
			);
		}

		return (
			<div className="w-4 h-4">
				<Circle size="16" className="text-neutral-grey-medium" />
			</div>
		);
	};

	return (
		<div
			className={cn(
				'radio-card',
				'flex flex-col bg-white hover:bg-neutral-grey-light border border-cold-grey-2 transition-colors duration-100',
				selected ? 'bg-neutral-grey-light border-brand-blue' : '',
				className
			)}
			{...props}
		>
			<label className="flex cursor-pointer relative">
				{thumbnail && (
					<span
						className="absolute left-0 top-0 h-full w-[40px] bg-no-repeat bg-cover bg-center"
						style={{ backgroundImage: `url(${thumbnail})` }}
					/>
				)}

				<div className={cn('p-2', thumbnail ? 'ml-[50px] h-28' : '')}>
					<div className="flex items-start">
						<div className="grow text-base text-zinc-950 font-semibold leading-4 mr-4">
							{title}
						</div>
						<input
							type="radio"
							name={radioGroup}
							value={value as string}
							checked={selected}
							onChange={onSelect}
							className="hidden"
						/>
						{renderSelectedStatusIcon()}
					</div>
					{description && (
						<div
							className="line-clamp-3 text-sm text-neutral-grey-medium leading-5 my-2"
							dangerouslySetInnerHTML={{ __html: description }}
						/>
					)}
				</div>
			</label>
			{children}
		</div>
	);
};
RadioCard.displayName = 'RadioCard';

/**
 * A custom `RadioCardFooter` component for rendering the footer of the `RadioCard`.
 */
const RadioCardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
	className,
	children,
	...props
}) => (
	<div
		className={cn(
			'radio-card-footer',
			'mt-auto p-2 border-t border-gray-200',
			className
		)}
		{...props}
	>
		{children}
	</div>
);
RadioCardFooter.displayName = 'RadioCardFooter';

export { RadioCard, RadioCardFooter };
