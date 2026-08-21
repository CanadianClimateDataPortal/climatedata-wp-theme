import React from 'react';
import { sprintf } from '@wordpress/i18n';

import { __, _n } from '@/context/locale-provider';
import { useClimateVariable } from '@/hooks/use-climate-variable';

import Dropdown from '@/components/ui/dropdown';
import { hasCookie } from '@/lib/feature-toggling';

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

/**
 * Feature toggle for the decadal frequencies.
 *
 * The decadal frequencies already work when requested through the URL, with
 * `&freq=decadal-ann`, `&freq=decadal-may-sep` or `&freq=decadal-nov-mar`.
 * This toggle keeps them out of the dropdown until they are ready for a public
 * audience.
 *
 * Enable it from the DevTools console, then reload the page.
 * `document.cookie = 'S2D_FREQUENCIES_TO_ADD_SUPPORT=yes'`
 *
 * Removing the toggle means deleting this constant and merging the two option
 * lists into one.
 */
const TOGGLE_COOKIE_DECADAL_FREQUENCY_OPTIONS = 'S2D_FREQUENCIES_TO_ADD_SUPPORT';

// Built once, so when/if made part of rendering the dropdown it'll have everything.
const FREQUENCY_OPTIONS_WITH_DECADAL = [
	...FrequencyField.options,
	...S2D_FREQUENCIES_TO_ADD_SUPPORT,
];

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

S2DFrequencyFieldDropdown.displayName = 'S2DFrequencyFieldDropdown'; // Explicit string literal, or this name would be lost in production.
