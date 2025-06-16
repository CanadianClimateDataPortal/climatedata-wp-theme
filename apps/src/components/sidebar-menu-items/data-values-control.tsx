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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// other
import { useClimateVariable } from "@/hooks/use-climate-variable";
import { ColourType } from '@/types/climate-variable-interface';
import { InfoIcon } from "lucide-react";

const DataValuesControl: React.FC = () => {
	const { climateVariable, setDataValue, setColourType } = useClimateVariable();
	
	const deltaLabel = (
		<div className="flex items-center gap-x-1">
			<span>{__('Delta')}</span>
			<Popover>
				<PopoverTrigger>
					<InfoIcon size={15} fill="#657092" color="#fafafa" />
				</PopoverTrigger>
				<PopoverContent>
					<p className="font-semibold tracking-wider uppercase">
						{__('Delta with 1971-2000')}
					</p>
					<p>{__('Delta is the difference between the future value and the reference period (or baseline) value of a climate variable, as simulated by a climate model. The reference period used here is 1971-2000.')}</p>
				</PopoverContent>
			</Popover>
		</div>
	);

	const Tooltip = () => (
		<div className="text-sm text-gray-500">
			{__('Switch between Absolute and Delta values by clicking on either option. ' +
				  'Delta values represent the change in the selected variable between the future selected time period and the reference period (or baseline) value. ' +
				  'The reference period used here is 1971-2000.')}
		</div>
	);

	const options = [
		{ value: 'absolute', label: __('Absolute') },
		{ value: 'delta', label: deltaLabel },
	];

	const onDataValueChange = (value: string) => {
		setDataValue(value);

		// also, colour type should be set depending on the data value and the colour scheme
		const colourScheme = climateVariable?.getColourScheme() ?? 'default';
		const defaultsToDiscreteColourType = value === 'delta' && colourScheme === 'default';
		setColourType(defaultsToDiscreteColourType ? ColourType.DISCRETE : ColourType.CONTINUOUS);
	}

	return (
		<SidebarMenuItem>
			<RadioGroupFactory
				title={__('Values')}
				name="data-value"
				tooltip={<Tooltip />}
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
