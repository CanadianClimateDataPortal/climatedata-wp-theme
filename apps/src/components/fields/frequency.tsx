import React from 'react';

import { __ } from '@/context/locale-provider';

import Dropdown from '@/components/ui/dropdown';

import {
	FrequencyType,
} from '@/types/climate-variable-interface';

const FrequencyField = {
	key: 'frequencies',
	label: __('Frequencies'),
	options: [
		{ value: FrequencyType.MONTHLY, label: __('Monthly') },
		{ value: FrequencyType.SEASONAL, label: __('Seasonal (3 months)') },
	],
};

export interface FrequencyFieldDropdownProps {
	tooltip?: React.ReactNode;
	value: FrequencyType | string;
	onChange: (value: FrequencyType | string) => void;
}

export const FrequencyFieldDropdown = (
	props: FrequencyFieldDropdownProps
) => {
	return (
		<Dropdown<FrequencyType | string>
			key={FrequencyField.key}
			placeholder={__('Select an option')}
			options={FrequencyField.options}
			label={FrequencyField.label}
			{...props}
		/>
	);
};

FrequencyFieldDropdown.displayName = 'FrequencyFieldDropdown';
