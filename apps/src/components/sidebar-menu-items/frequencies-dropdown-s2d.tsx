import React from 'react';
import { sprintf } from '@wordpress/i18n';

import { __ } from '@/context/locale-provider';
import { useClimateVariable } from '@/hooks/use-climate-variable';

import Dropdown from '@/components/ui/dropdown';
import {
	hasCookie,
	TOGGLE_COOKIE_DECADAL_FREQUENCY_OPTIONS,
} from '@/lib/feature-toggling';

import {
	S2DFrequencyTypes,
	type S2DFrequencyType,
} from '@/types/climate-variable-interface';

const formatLabelDecadalFrequencyField = (label: string): string => {
	return sprintf(
		__('Decadal (%s)'),
		sprintf(
			'%s; %s',
			__('5 years'),
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
	],
};

const S2D_FREQUENCIES_TO_ADD_SUPPORT = [
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
];

// Build this list once so it already contains every option if it becomes the
// dropdown's default list later.
//
// The decadal options stay hidden until they are ready for a public audience.
// `TOGGLE_COOKIE_DECADAL_FREQUENCY_OPTIONS` documents how to reveal them.
// Removing the toggle means merging these two option lists into one.
const FREQUENCY_OPTIONS_WITH_DECADAL = [
	...FrequencyField.options,
	...S2D_FREQUENCIES_TO_ADD_SUPPORT,
];

interface FrequenciesDropdownS2DProps {
	tooltip?: React.ReactNode;
	afterOnChange?: (value: S2DFrequencyType | string) => void;
}

export const FrequenciesDropdownS2D = (
	props: FrequenciesDropdownS2DProps,
): React.ReactNode => {
	const {
		climateVariable,
		setFrequency,
	} = useClimateVariable();
	const { afterOnChange, ...restProps } = props;

	const value = climateVariable?.getFrequency() ?? S2DFrequencyTypes.MONTHLY;

	const options = hasCookie(TOGGLE_COOKIE_DECADAL_FREQUENCY_OPTIONS)
		? FREQUENCY_OPTIONS_WITH_DECADAL
		: FrequencyField.options;

	const fieldProps = {
		label: FrequencyField.label,
		onChange: (value: S2DFrequencyType | string) => {
			setFrequency(value);
			afterOnChange?.(value);
		},
		value,
		...restProps,
	};

	return (
		<Dropdown<S2DFrequencyType | string>
			key={FrequencyField.key}
			placeholder={__('Select an option')}
			options={options}
			{...fieldProps}
		/>
	);
};

FrequenciesDropdownS2D.displayName = 'FrequenciesDropdownS2D'; // Explicit string literal, or this name would be lost in production.
