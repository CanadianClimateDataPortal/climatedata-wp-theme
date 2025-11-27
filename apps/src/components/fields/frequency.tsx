import React from 'react';

import { __ } from '@/context/locale-provider';
import { useClimateVariable } from '@/hooks/use-climate-variable';

import Dropdown from '@/components/ui/dropdown';

import { FrequencyType } from '@/types/climate-variable-interface';

const FrequencyField = {
	key: 'frequencies',
	label: __('Frequencies'),
	options: [
		{ value: FrequencyType.MONTHLY, label: __('Monthly') },
		{ value: FrequencyType.SEASONAL, label: __('Seasonal (3 months)') },
	],
};

export interface S2DFrequencyFieldDropdownProps {
	tooltip?: React.ReactNode;
	afterOnChange?: (value: FrequencyType | string) => void;
}

export const S2DFrequencyFieldDropdown = (
	props: S2DFrequencyFieldDropdownProps,
) => {
	const {
		climateVariable,
		setFrequency,
	} = useClimateVariable();
	const { afterOnChange, ...restProps } = props;

	const value = climateVariable?.getFrequency() ?? FrequencyType.MONTHLY;

	const fieldProps = {
		label: FrequencyField.label,
		onChange: (value: FrequencyType | string) => {
			setFrequency(value);
			afterOnChange?.(value);
		},
		value,
		...restProps,
	};

	return (
		<Dropdown<FrequencyType | string>
			key={FrequencyField.key}
			placeholder={__('Select an option')}
			options={FrequencyField.options}
			{...fieldProps}
		/>
	);
};

S2DFrequencyFieldDropdown.displayName = 'S2DFrequencyFieldDropdown';
