/**
 * Checkbox component
 *
 * A custom checkbox component built with Radix UI's Checkbox primitives.
 */
import React, { useState, forwardRef } from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';
import { normalizeOptions } from '@/lib/format';
import { ControlTitle } from '@/components/ui/control-title';
import { CheckedState } from '@radix-ui/react-checkbox';

const Checkbox = forwardRef<
	React.ElementRef<typeof CheckboxPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
		onCheckedChange?: (checked: boolean) => void;
	}
>(({ onCheckedChange, className, ...props }, ref) => (
	<CheckboxPrimitive.Root
		ref={ref}
		className={cn(
			'checkbox',
			'peer',
			'h-4 w-4',
			'shrink-0',
			'rounded-sm border border-brand-red',
			'ring-offset-background',
			'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
			'disabled:cursor-not-allowed disabled:opacity-50',
			'data-[state=checked]:bg-brand-red data-[state=checked]:text-primary-foreground',
			className
		)}
		onCheckedChange={onCheckedChange}
		{...props}
	>
		<CheckboxPrimitive.Indicator
			className={cn('flex items-center justify-center text-current')}
		>
			<Check className="h-4 w-4" />
		</CheckboxPrimitive.Indicator>
	</CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

const CheckboxFactory: React.FC<{
	name: string;
	options: { value: string; label: string }[] | string[] | number[];
	optionClassName?: string;
	className?: string;
	title?: string;
	tooltip?: React.ReactNode;
	orientation?: string;
	onChange?: (selectedValues: string[]) => void;
	values?: string[];
}> = ({
	name,
	options,
	optionClassName,
	className,
	title,
	tooltip,
	orientation = 'vertical',
	onChange,
	values = [],
}) => {
	const [selectedValues, setSelectedValues] = useState<string[]>(values);

	const handleCheckboxChange = (
		checked: CheckedState | boolean,
		optionValue: string
	) => {
		const updatedValues = checked
			? [...selectedValues, optionValue] // Add the value if checked
			: selectedValues.filter((v) => v !== optionValue); // Remove the value if unchecked

		setSelectedValues(updatedValues); // Update local state
		onChange?.(updatedValues); // Trigger the callback with updated values
	};

	// when receiving an array of strings or numbers as options we will convert them valid value/label objects
	const normalizedOptions = normalizeOptions(options);

	const orientationClasses: { [key: string]: string } = {
		vertical: 'sm:flex-col',
		horizontal: '',
	};

	return (
		<div className={cn('checkbox-factory space-y-2 mb-2', className)}>
			{title && <ControlTitle title={title} tooltip={tooltip} />}
			<div
				className={cn(
					'flex flex-wrap gap-y-2 gap-x-0',
					orientationClasses[orientation]
				)}
			>
				{normalizedOptions.map((option, index) => (
					<label
						key={index}
						htmlFor={`checkbox-${name}-${index}`}
						className={cn(
							'flex items-center space-x-2 cursor-pointer',
							optionClassName ?? ''
						)}
					>
						<Checkbox
							id={`checkbox-${name}-${index}`}
							checked={selectedValues.includes(option.value)}
							onCheckedChange={(checked) =>
								handleCheckboxChange(checked, option.value)
							}
						/>
						<span className="text-zinc-900 text-sm leading-5 cursor-pointer">
							{option.label}
						</span>
					</label>
				))}
			</div>
		</div>
	);
};

export { Checkbox, CheckboxFactory };
