/**
 * Threshold values dropdown component.
 *
 * A dropdown component that allows the user to select a threshold value.
 */
import React from 'react';
import { useI18n } from '@wordpress/react-i18n';

// components
import { SidebarMenuItem } from '@/components/ui/sidebar';
import Dropdown from '@/components/ui/dropdown';

// other
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setFrequency } from '@/features/map/map-slice';

const FrequenciesDropdown: React.FC = () => {
	const { __ } = useI18n();

	const dispatch = useAppDispatch();
	const frequency = useAppSelector((state) => state.map.frequency);

	// TODO: fetch these values from the API
	const options = [
		{ label: __('Annual'), value: 'ann' },
		{ label: __('January'), value: 'jan' },
		{ label: __('February'), value: 'feb' },
		{ label: __('March'), value: 'mar' },
		{ label: __('April'), value: 'apr' },
		{ label: __('May'), value: 'may' },
		{ label: __('June'), value: 'jun' },
		{ label: __('July'), value: 'jul' },
		{ label: __('August'), value: 'aug' },
		{ label: __('September'), value: 'sep' },
		{ label: __('October'), value: 'oct' },
		{ label: __('November'), value: 'nov' },
		{ label: __('December'), value: 'dec' },
	];

	const Tooltip = () => (
		<div className="text-sm text-gray-500">
			{__('Select a threshold value.')}
		</div>
	);

	return (
		<SidebarMenuItem>
			<Dropdown
				placeholder={__('Select an option')}
				label={__('Frequencies')}
				tooltip={<Tooltip />}
				options={options}
				value={frequency}
				onChange={(value) => {
					dispatch(setFrequency(value));
				}}
			/>
		</SidebarMenuItem>
	);
};
FrequenciesDropdown.displayName = 'FrequenciesDropdown';

export { FrequenciesDropdown };
