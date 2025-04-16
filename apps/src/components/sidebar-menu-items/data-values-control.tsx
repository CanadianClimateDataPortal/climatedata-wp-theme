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
import { useClimateVariable } from "@/hooks/use-climate-variable";

const DataValuesControl: React.FC = () => {
	const { __ } = useI18n();
	const { climateVariable, setDataValue } = useClimateVariable();

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
				value={climateVariable?.getDataValue() ?? options[0].value}
				disabled={climateVariable ? !climateVariable.hasDelta() : false}
				onValueChange={setDataValue}
			/>
		</SidebarMenuItem>
	);
};
DataValuesControl.displayName = 'DataValuesControl';

export { DataValuesControl };
