import React from 'react';
import { sprintf } from '@wordpress/i18n';

import { __, _n } from '@/context/locale-provider';
import { useClimateVariable } from '@/hooks/use-climate-variable';

import Dropdown from '@/components/ui/dropdown';

import {
	S2DFrequencyTypes,
	type S2DFrequencyType,
} from '@/types/climate-variable-interface';

const formatLabelDecadalFrequencyField = (label: string): string => {
	return sprintf(
		__('Decadal (%s)'),
		sprintf(
			'%s; %s',
			sprintf(_n('%s year', '%s years', 5), 5),
			__(label),
		)
	);
};

const FrequencyField = {
	key: 'frequencies',
	label: __('Frequencies'),
	options: [
		{
			value: S2DFrequencyTypes.MONTHLY,
			label: __('Monthly'),
		},
		{
			value: S2DFrequencyTypes.SEASONAL,
			label: __('Seasonal (3 months)'),
		},
		{
			value: S2DFrequencyTypes.DECADAL_ANNUAL,
			label: formatLabelDecadalFrequencyField('Annual'),
		},
		{
			value: S2DFrequencyTypes.DECADAL_MAY_SEP,
			label: formatLabelDecadalFrequencyField('May-Sep'),
		},
		{
			value: S2DFrequencyTypes.DECADAL_NOV_MAR,
			label: formatLabelDecadalFrequencyField('Nov-Mar'),
		},
	],
};

export interface S2DFrequencyFieldDropdownProps {
	tooltip?: React.ReactNode;
	afterOnChange?: (value: S2DFrequencyType | string) => void;
}

export const S2DFrequencyFieldDropdown = (
	props: S2DFrequencyFieldDropdownProps,
): React.ReactNode => {
	const {
		climateVariable,
		setFrequency,
	} = useClimateVariable();
	const { afterOnChange, ...restProps } = props;

	const value = climateVariable?.getFrequency() ?? S2DFrequencyTypes.MONTHLY;

	const fieldProps = {
		label: FrequencyField.label,
		onChange: (value: S2DFrequencyType | string) => {
			setFrequency(value);
			afterOnChange?.(value);
		},
		value,
		...restProps,
	};

	// BEGIN: We probably DO NOT WANT THIS (no we don't!)
	for (const option of FrequencyField.options) {
		if (/Annuelle/.test(option.label)) {
			option.label = option.label.replace('Annuelle', 'annuelle');
		}
	}
	// END: We probably DO NOT WANT THIS

	return (
		<Dropdown<S2DFrequencyType | string>
			key={FrequencyField.key}
			placeholder={__('Select an option')}
			options={FrequencyField.options}
			{...fieldProps}
		/>
	);
};

S2DFrequencyFieldDropdown.displayName = 'S2DFrequencyFieldDropdown'; // Explicit string literal, or this name would be lost in production.
