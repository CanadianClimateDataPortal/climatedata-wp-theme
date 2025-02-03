/**
 * Dropdown Component
 *
 * A custom component for rendering an optionally searchable dropdown with
 * an optional heading title and tooltip (ControlTitle component).
 *
 */
import React, { useState, useEffect, useMemo, forwardRef } from 'react';
import { useI18n } from '@wordpress/react-i18n';

import { Input } from '@/components/ui/input';
import { ControlTitle } from '@/components/ui/control-title';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

import { cn } from '@/lib/utils';
import { DropdownOption, DropdownProps } from '@/types/types';

// using generics like this because forwardRef does not support generic types
const DropdownGeneric = <T extends string | undefined>(
	{
		className,
		placeholder,
		options = [],
		searchable = false,
		searchPlaceholder,
		label,
		tooltip,
		value,
		onChange,
	}: DropdownProps<T>,
	ref: React.Ref<HTMLDivElement>
) => {
	const [selected, setSelected] = useState<T | undefined>(value);
	const [search, setSearch] = useState<string>('');

	const { __ } = useI18n();

	// translate default placeholders if they are not provided
	const searchPlaceholderTranslated = searchPlaceholder ?? __('Search...');
	const placeholderTranslated = placeholder ?? __('Select an option');

	useEffect(() => {
		if (onChange) {
			onChange(selected as T);
		}
	}, [selected, onChange]);

	// when receiving an array of strings as options we will make them valid DropdownOption objects
	const normalizedOptions: DropdownOption[] = useMemo(() => {
		return options.map((option) => {
			const dropdownOption =
				typeof option === 'string'
					? { label: option, value: option }
					: option;

			return dropdownOption as DropdownOption;
		});
	}, [options]);

	// search functionality
	const filteredOptions = normalizedOptions.filter((option) =>
		String(option.label).toLowerCase().includes(search.toLowerCase())
	);

	const handleValueChanged = (value: string) => {
		if (value === 'all') {
			setSelected(placeholderTranslated as T);
			setSearch('');
		} else {
			setSelected(value as T);
		}
	};

	const handleSearchInputChange = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		setSearch(e.target.value);
	};

	return (
		<div ref={ref} className={cn('dropdown z-[99999]', className)}>
			{label && <ControlTitle title={label} tooltip={tooltip} />}
			<Select value={value} onValueChange={handleValueChanged}>
				<SelectTrigger className="w-full focus:ring-0 focus:ring-offset-0">
					<SelectValue placeholder={placeholderTranslated} />
				</SelectTrigger>
				<SelectContent className="z-[99999]">
					{/* TODO: this stopped working after fixing typescript errors.. revisit and unhide!! */}
					{searchable && (
						<div className="p-2 hidden">
							<Input
								placeholder={searchPlaceholderTranslated}
								value={search}
								onChange={handleSearchInputChange}
							/>
						</div>
					)}
					{/*
            the `!!selected` part explicitly converts `selected` to boolean...
            this ensures that falsy values like `0` are correctly treated as `false`
            and do not cause unintended rendering of this component
          */}
					{!!selected && searchable && (
						<SelectItem value="all">{placeholder}</SelectItem>
					)}
					{filteredOptions.map((option, index) => (
						<SelectItem key={index} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
};
DropdownGeneric.displayName = 'Dropdown';

const Dropdown = forwardRef(DropdownGeneric) as <T>(
	props: DropdownProps<T> & { ref?: React.Ref<HTMLDivElement> }
) => React.ReactElement;

export default Dropdown;
