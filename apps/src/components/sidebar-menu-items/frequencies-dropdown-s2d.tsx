import React from 'react';
import { sprintf } from '@wordpress/i18n';

import { __ } from '@/context/locale-provider';
import { useClimateVariable } from '@/hooks/use-climate-variable';

import Dropdown from '@/components/ui/dropdown';

import {
	S2DFrequencyTypes,
	type S2DFrequencyType,
} from '@/types/climate-variable-interface';
import { S2D_DECADAL_FREQUENCY_LABELS } from '@/lib/constants';

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
		{
			value: S2DFrequencyTypes.DECADAL_ANNUAL,
			label: formatLabelDecadalFrequencyField(S2D_DECADAL_FREQUENCY_LABELS[S2DFrequencyTypes.DECADAL_ANNUAL]!),
		},
		{
			value: S2DFrequencyTypes.DECADAL_MAY_SEP,
			label: formatLabelDecadalFrequencyField(S2D_DECADAL_FREQUENCY_LABELS[S2DFrequencyTypes.DECADAL_MAY_SEP]!),
		},
		{
			value: S2DFrequencyTypes.DECADAL_NOV_MAR,
			label: formatLabelDecadalFrequencyField(S2D_DECADAL_FREQUENCY_LABELS[S2DFrequencyTypes.DECADAL_NOV_MAR]!),
		},
	],
};

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

	const options = FrequencyField.options;

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
