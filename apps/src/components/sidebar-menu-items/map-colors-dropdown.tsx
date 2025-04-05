/**
 * Map colors dropdown component.
 *
 * A dropdown component that allows the user to select a map color.
 */
import React from 'react';
import { useI18n } from '@wordpress/react-i18n';

// components
import { SidebarMenuItem } from '@/components/ui/sidebar';
import Dropdown from '@/components/ui/dropdown';

// other
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setMapColor } from '@/features/map/map-slice';
import { RadioGroupFactory } from "@/components/ui/radio-group";
import { useClimateVariable } from "@/hooks/use-climate-variable";

const MapColorsDropdown: React.FC = () => {
	const { __ } = useI18n();
	const { climateVariable, setColourType } = useClimateVariable();

	const dispatch = useAppDispatch();
	const mapColor = useAppSelector((state) => state.map.mapColor);

	// TODO: find out the correct options for the dropdown
	const options = [
		{ value: 'default', label: __('Default') },
		{ value: 'warm', label: __('Warm Palette') },
		{ value: 'cool', label: __('Cool Palette') },
		{ value: 'custom', label: __('Custom Palette') },
	];

	const Tooltip = () => (
		<div className="text-sm text-gray-500">{__('Select a map color.')}</div>
	);

	return (
		<SidebarMenuItem className={"space-y-4"}>
			<Dropdown
				placeholder={__('Select an option')}
				options={options}
				label={__('Map Colors')}
				tooltip={<Tooltip />}
				value={mapColor}
				onChange={(value) => {
					dispatch(setMapColor(value));
				}}
			/>
			<RadioGroupFactory
				name="colour-type"
				orientation={"horizontal"}
				options={[{
					value: 'intervals',
					label: __('Discrete'),
				}, {
					value: 'ramp',
					label: __('Continuous'),
				}]}
				className={"space-x-2"}
				value={climateVariable?.getColourType() ?? 'ramp'}
				onValueChange={setColourType}
			/>
		</SidebarMenuItem>
	);
};
MapColorsDropdown.displayName = 'MapColorsDropdown';

export { MapColorsDropdown };
