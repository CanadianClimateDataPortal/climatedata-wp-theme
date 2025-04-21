/**
 * SelectAnalyzedField Component
 *
 * A wrapper around the Dropdown component that:
 * - Supports optional label, tooltip, description, and placeholder.
 * - Emits selected value changes using a consistent key/value or value-only callback.
 * - Uses generic typing to support typed option values.
 */

import Dropdown from '@/components/download/ui/download-dropdown';
import { SelectAnalyzedFieldProps } from '@/types/types';

export const SelectAnalyzedField = <T extends string>(
	{
		name,
		placeholder,
		options,
		value,
		onChange,
	}: SelectAnalyzedFieldProps<T>) => {
	return (
		<div className="mb-4">
			{/* Dropdown */}
			<Dropdown
				name={name}
				placeholder={placeholder}
				options={options}
				value={value}
				onChange={onChange}
			/>
		</div>
	);
};
