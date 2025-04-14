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
		label,
		description,
		tooltip,
		placeholder,
		options,
		value,
		onChange,
	}: SelectAnalyzedFieldProps<T>) => {
	return (
		<div className="mb-4">
			{/* Optional description shown above the dropdown */}
			{description && (
				<div className="text-sm text-neutral-grey-medium max-w-lg mb-1">
					{description}
				</div>
			)}

			{/* Dropdown with optional tooltip and placeholder */}
			<Dropdown
				name={name}
				label={label}
				tooltip={tooltip || null}
				placeholder={placeholder}
				options={options}
				value={value}
				onChange={onChange}
			/>
		</div>
	);
};
