/**
 * Data values control component.
 *
 * A component that allows the user to select a data value setting.
 */
import React from 'react';
import { useI18n } from '@wordpress/react-i18n';

// components
import { SidebarMenuItem } from '@/components/ui/sidebar';
import { RadioGroupFactory } from '@/components/ui/radio-group';

// other
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setDataValue } from '@/features/map/map-slice';

const DataValuesControl: React.FC = () => {
	const { __ } = useI18n();

	const dispatch = useAppDispatch();
	const dataValue = useAppSelector((state) => state.map.dataValue);

	const options = [
		{ value: 'absolute', label: __('Absolute') },
		{ value: 'delta', label: __('Delta') },
	];

	return (
		<SidebarMenuItem>
			<RadioGroupFactory
				title={__('Values')}
				name="data-value"
				options={options}
				value={dataValue}
				onValueChange={(value) => {
					dispatch(setDataValue(value));
				}}
			/>
		</SidebarMenuItem>
	);
};
DataValuesControl.displayName = 'DataValuesControl';

export { DataValuesControl };
