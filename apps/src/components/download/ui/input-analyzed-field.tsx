/**
 * InputAnalyzedField Component
 *
 * A reusable input field with:
 * - Optional description and tooltip (via ControlTitle).
 * - Configurable input type and placeholder.
 * - Emits changes via a key-value callback.
 */

import React from 'react';
import { Input } from '@/components/ui/input';
import { ControlTitle } from '@/components/ui/control-title';
import { InputAnalyzedFieldProps } from '@/types/types';

export const InputAnalyzedField: React.FC<InputAnalyzedFieldProps> = (
	{
		className,
		keyName,
		label,
		value,
		description,
		tooltip,
		placeholder,
		attributeType = 'text',
		onChange,
	}) => {
	return (
		<div className="mb-4">
			{/* Optional description shown above the label */}
			{description && (
				<div className="text-sm text-neutral-grey-medium max-w-lg mb-1">
					{description}
				</div>
			)}

			{/* Label and optional tooltip */}
			<div className="flex items-center mb-1">
				<ControlTitle title={label} tooltip={tooltip || null} />
			</div>

			{/* Input field */}
			<Input
				className={className}
				type={attributeType}
				name={keyName}
				value={value}
				id={keyName}
				placeholder={placeholder}
				onChange={(e) => onChange(keyName, e.target.value)}
			/>
		</div>
	);
};
