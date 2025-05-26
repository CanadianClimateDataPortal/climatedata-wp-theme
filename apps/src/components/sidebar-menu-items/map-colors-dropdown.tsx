/**
 * Map colors dropdown component.
 *
 * A dropdown component that allows the user to select a map color.
 */
import React, { useMemo } from 'react';
import { __ } from '@/context/locale-provider';

// components
import { SidebarMenuItem } from '@/components/ui/sidebar';

// other
import { RadioGroupFactory } from "@/components/ui/radio-group";
import { useClimateVariable } from "@/hooks/use-climate-variable";
import { ColourSchemeDropdown } from "@/components/sidebar-menu-items/colour-scheme-dropdown";
import { ColourType } from "@/types/climate-variable-interface";

const MapColorsDropdown: React.FC = () => {
	const { climateVariable, setColourType, setColourScheme } = useClimateVariable();

	const Tooltip = () => (
		<div className="text-sm text-gray-500">{__('Select a map color.')}</div>
	);

	const defaultColourType = useMemo(() => {
		if (climateVariable?.getColourScheme() && climateVariable?.getColourScheme() !== 'default') {
			return ColourType.CONTINUOUS;
		}

		return climateVariable?.getDataValue() === 'delta' ? ColourType.DISCRETE : ColourType.CONTINUOUS;
	}, [climateVariable]);

	const onColourSchemeChange = (value: string) => {
		setColourScheme(value);

		// also reset the colour type if the colour scheme is the default
		if (value === 'default') {
			setColourType(climateVariable?.getDataValue() === 'delta' ? ColourType.DISCRETE : ColourType.CONTINUOUS);
		}
	}

	return (
		<SidebarMenuItem className={"space-y-4"}>
			<ColourSchemeDropdown
				title={'Map colours'}
				placeholder={__('Select an option')}
				tooltip={<Tooltip />}
				value={climateVariable?.getColourScheme() ?? 'default'}
				onValueChange={onColourSchemeChange}
			/>
			{climateVariable?.getColourScheme() && climateVariable?.getColourScheme() !== 'default' && <RadioGroupFactory
				name="colour-type"
				orientation={"horizontal"}
				options={[{
					value: ColourType.DISCRETE,
					label: __('Discrete'),
				}, {
					value: ColourType.CONTINUOUS,
					label: __('Continuous'),
				}]}
				className={"space-x-2"}
				value={climateVariable?.getColourType() ?? defaultColourType}
				onValueChange={setColourType}
			/>}
		</SidebarMenuItem>
	);
};
MapColorsDropdown.displayName = 'MapColorsDropdown';

export { MapColorsDropdown };
