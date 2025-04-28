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
import { InputAnalyzedFieldProps } from '@/types/types';

export const InputAnalyzedField: React.FC<InputAnalyzedFieldProps> = (
	{
		className,
		keyName,
		value,
		placeholder,
		attributeType = 'text',
		onChange,
	}) => {
	return (
		<div className="mb-4">
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
