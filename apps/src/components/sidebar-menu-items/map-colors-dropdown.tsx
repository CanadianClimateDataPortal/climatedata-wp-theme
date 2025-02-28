/**
 * Map colors dropdown component.
 *
 * A dropdown component that allows the user to select a a map color.
 */
import React from 'react';
import { useI18n } from '@wordpress/react-i18n';

// components
import { SidebarMenuItem } from '@/components/ui/sidebar';
import Dropdown from '@/components/ui/dropdown';

// other
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setMapColor } from '@/features/map/map-slice';

const MapColorsDropdown: React.FC = () => {
	const { __ } = useI18n();

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
		<SidebarMenuItem>
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
		</SidebarMenuItem>
	);
};
MapColorsDropdown.displayName = 'MapColorsDropdown';

export { MapColorsDropdown };
