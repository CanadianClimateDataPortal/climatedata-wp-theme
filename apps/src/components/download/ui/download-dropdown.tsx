/**
 * Dropdown Component
 *
 * A customizable dropdown component that supports:
 * - Optional heading and tooltip via ControlTitle.
 * - A list of options passed in via props.
 * - Controlled selection via value and onChange.
 * - Ref forwarding for integration with other components.
 */

import React, { forwardRef, useEffect, useState } from 'react';

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select.tsx';

import { cn } from '@/lib/utils.ts';
import { DownloadDropdownProps } from '@/types/types';

// Inner component used with forwardRef.
// Generic props are passed through DownloadDropdownProps.
const DownloadDropdown = (
	{
		className,
		options = [],
		value,
		onChange,
		name,
	}: DownloadDropdownProps,
	ref: React.Ref<HTMLDivElement>
) => {
	const [selected, setSelected] = useState(value);

	// Sync internal state with onChange when selection changes
	useEffect(() => {
		if (onChange && selected !== undefined) {
			onChange(name, selected);
		}
	}, [selected, name, onChange]);

	// Handle value change from the Select component
	const handleValueChanged = (newValue: string) => {
		setSelected(newValue);
	};

	return (
		<div ref={ref} className={cn('dropdown z-50 sm:w-64', className)}>
			<Select value={selected} onValueChange={handleValueChanged}>
				<SelectTrigger className="w-full focus:ring-0 focus:ring-offset-0 text-cdc-black [&>svg]:text-brand-blue [&>svg]:opacity-100">
					<SelectValue placeholder="Select an option" />
				</SelectTrigger>
				<SelectContent>
					{options.map((option, index) => (
						<SelectItem key={index} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
};

DownloadDropdown.displayName = 'DownloadDropdown';

// Wrap component with forwardRef and apply generic type support
const Dropdown = forwardRef(DownloadDropdown) as <T>(
	props: DownloadDropdownProps<T> & { ref?: React.Ref<HTMLDivElement> }
) => React.ReactElement;

export default Dropdown;
