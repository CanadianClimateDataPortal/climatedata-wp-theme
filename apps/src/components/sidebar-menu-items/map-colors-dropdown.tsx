/**
 * Map colors dropdown component.
 *
 * A dropdown component that allows the user to select a map color.
 */
import React from 'react';
import { useI18n } from '@wordpress/react-i18n';

// components
import { SidebarMenuItem } from '@/components/ui/sidebar';

// other
import { RadioGroupFactory } from "@/components/ui/radio-group";
import { useClimateVariable } from "@/hooks/use-climate-variable";
import { ColourSchemeDropdown } from "@/components/sidebar-menu-items/colour-scheme-dropdown";
import { ColourType } from "@/types/climate-variable-interface";

const MapColorsDropdown: React.FC = () => {
	const { __ } = useI18n();
	const { climateVariable, setColourType, setColourScheme } = useClimateVariable();

	const Tooltip = () => (
		<div className="text-sm text-gray-500">{__('Select a map color.')}</div>
	);

	return (
		<SidebarMenuItem className={"space-y-4"}>
			<ColourSchemeDropdown
				title={'Map colours'}
				placeholder={__('Select an option')}
				tooltip={<Tooltip />}
				value={climateVariable?.getColourScheme() ?? 'default'}
				onValueChange={setColourScheme}
			/>
			<RadioGroupFactory
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
				value={climateVariable?.getColourType() ?? ColourType.CONTINUOUS}
				onValueChange={setColourType}
			/>
		</SidebarMenuItem>
	);
};
MapColorsDropdown.displayName = 'MapColorsDropdown';

export { MapColorsDropdown };
