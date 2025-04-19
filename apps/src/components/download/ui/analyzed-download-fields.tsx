/**
 * Threshold values dropdown component.
 *
 * A dropdown component that allows the user to select a Precalculated (Analyzed) value.
 */

import React from 'react';
import { useI18n } from '@wordpress/react-i18n';

// Hooks
import { useClimateVariable } from '@/hooks/use-climate-variable';

// Components
import { SelectAnalyzedField } from '@/components/download/ui/select-analyzed-field';
import { InputAnalyzedField } from '@/components/download/ui/input-analyzed-field';
import { DateInput } from '@/components/ui/date-input';
import { AnalyzedFieldProps } from '@/types/types';

/**
 * Renders a single analysis field based on its type.
 * Displays optional description and tooltip, and handles both input and dropdown types.
 */
const AnalyzedField: React.FC<AnalyzedFieldProps> = (
	{
		keyName,
		type,
		label,
		description,
		help,
		attributeType = 'text',
		placeholder,
		value,
		onChange,
		__,
		options = [],
	}) => {
	return (
		<div className="mb-4" key={keyName}>
			{/* Optional field description */}
			{description && (
				<div className="text-sm text-neutral-grey-medium max-w-lg mb-1">
					{__(description)}
				</div>
			)}

			{/* Input field */}
			{type === 'input' && attributeType === 'date' ? (
				<DateInput
					className="sm:w-64"
					name={keyName}
					value={value}
					placeholder={placeholder ? __(placeholder) : undefined}
					onChange={e => onChange(keyName, e.target.value)}
					format="MM-DD"
				/>
			) : type === 'input' ? (
				<InputAnalyzedField
					keyName={keyName}
					label={__(label)}
					value={value}
					tooltip={help ? __(help) : null}
					className="sm:w-64"
					attributeType={attributeType}
					placeholder={placeholder ? __(placeholder) : undefined}
					onChange={onChange}
				/>
			) : null}

			{/* Dropdown field */}
			{type === 'select' && options.length > 0 && (
				<SelectAnalyzedField
					name={keyName}
					label={__(label)}
					tooltip={help ? __(help) : null}
					options={options}
					value={value || options[0]?.value || ''}
					placeholder={placeholder ? __(placeholder) : undefined}
					onChange={onChange}
				/>
			)}
		</div>
	);
};

/**
 * Displays a dynamic list of configurable analysis fields based on the selected climate variable.
 * Uses `useClimateVariable()` to retrieve data and propagate changes.
 */
const AnalyzedDownloadFields: React.FC = () => {
	const { __ } = useI18n();
	const { climateVariable, setAnalysisFieldValue } = useClimateVariable();

	if (!climateVariable) return null;

	const analyzedFields = climateVariable.getAnalysisFields()?.map((field) => {
		const { key, type, label, description, help, attributes, options } = field;
		const { type: attributeType, placeholder } = attributes || {};
		const value = climateVariable.getAnalysisFieldValue(key) ?? '';

		return (
			<AnalyzedField
				key={key}
				keyName={key}
				type={type}
				label={label}
				description={description}
				help={help}
				attributeType={attributeType}
				placeholder={placeholder}
				value={value}
				options={options}
				onChange={setAnalysisFieldValue}
				__={__}
			/>
		);
	}) ?? [];

	return <>{analyzedFields}</>;
};

AnalyzedDownloadFields.displayName = 'AnalyzedDownloadFields';

export { AnalyzedDownloadFields };
