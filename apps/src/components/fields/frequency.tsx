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
}

export const S2DFrequencyFieldDropdown = (
	props: S2DFrequencyFieldDropdownProps,
) => {
	const {
		climateVariable,
		setFrequency,
	} = useClimateVariable();

	const value = climateVariable?.getFrequency() ?? FrequencyType.MONTHLY;

	const fieldProps = {
		label: FrequencyField.label,
		onChange: setFrequency,
		value,
		...props,
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
