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
import { useAppDispatch } from '@/app/hooks';
import { setThresholdValue } from '@/features/map/map-slice';

const ThresholdValuesDropdown: React.FC = () => {
	const { __ } = useI18n();

	const dispatch = useAppDispatch();

	// TODO: fetch these values from the API
	const options = {
		unit: '°C',
		values: [5, 10, 15, 20, 25, 30],
	};

	const Tooltip = () => (
		<div className="text-sm text-gray-500">
			{__('Select a threshold value.')}
		</div>
	);

	return (
		<SidebarMenuItem>
			<Dropdown
				placeholder={__('Select an option')}
				options={options.values.map((value) => ({
					value,
					label: `${value} ${options.unit}`,
				}))}
				label={__('Threshold Values')}
				tooltip={<Tooltip />}
				onChange={(value) => {
					dispatch(setThresholdValue(value));
				}}
			/>
		</SidebarMenuItem>
	);
};
ThresholdValuesDropdown.displayName = 'ThresholdValuesDropdown';

export { ThresholdValuesDropdown };
