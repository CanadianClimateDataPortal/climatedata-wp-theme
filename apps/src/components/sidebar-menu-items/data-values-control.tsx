/**
 * Data values control component.
 *
 * A component that allows the user to select a data value setting.
 */
import React from 'react';
import { __ } from '@/context/locale-provider';

// components
import { SidebarMenuItem } from '@/components/ui/sidebar';
import { RadioGroupFactory } from '@/components/ui/radio-group';

// other
import { useClimateVariable } from "@/hooks/use-climate-variable";
import { ColourType } from '@/types/climate-variable-interface';

const DataValuesControl: React.FC = () => {
	const { climateVariable, setDataValue, setColourType } = useClimateVariable();

	const options = [
		{ value: 'absolute', label: __('Absolute') },
		{ value: 'delta', label: __('Delta') },
	];

	const onDataValueChange = (value: string) => {
		setDataValue(value);

		// also, colour type should be set depending on the data value and the colour scheme
		const defaultsToDiscreteColourType = value === 'delta' && climateVariable?.getColourScheme() === 'default';
		setColourType(defaultsToDiscreteColourType ? ColourType.DISCRETE : ColourType.CONTINUOUS);
	}

	return (
		<SidebarMenuItem>
			<RadioGroupFactory
				title={__('Values')}
				name="data-value"
				options={options}
				value={climateVariable?.getDataValue() ?? options[0].value}
				disabled={climateVariable ? !climateVariable.hasDelta() : false}
				onValueChange={onDataValueChange}
			/>
		</SidebarMenuItem>
	);
};
DataValuesControl.displayName = 'DataValuesControl';

export { DataValuesControl };
