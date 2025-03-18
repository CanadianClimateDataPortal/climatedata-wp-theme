/**
 * InteractiveRegionsDropdown component.
 *
 * A dropdown component that allows the user to select an interactive region.
 */
import React from 'react';
import { useI18n } from '@wordpress/react-i18n';

// components
import { SidebarMenuItem } from '@/components/ui/sidebar';
import Dropdown from '@/components/ui/dropdown';

// other
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setInteractiveRegion } from '@/features/map/map-slice';
import {
	REGION_GRID,
	REGION_CENSUS,
	REGION_HEALTH,
	REGION_WATERSHED,
} from '@/lib/constants';

const InteractiveRegionsDropdown: React.FC = () => {
	const { __ } = useI18n();

	const dispatch = useAppDispatch();
	const interactiveValue = useAppSelector(
		(state) => state.map.interactiveRegion
	);

	// TODO: fetch these values from the API
	const options: { value: string; label: string }[] = [
		{ value: REGION_GRID, label: __('Grid Cells') },
		{ value: REGION_CENSUS, label: __('Census Subdivisions') },
		{ value: REGION_HEALTH, label: __('Health Regions') },
		{ value: REGION_WATERSHED, label: __('Watersheds') },
	];

	const handleInteractiveRegionChange = (value: string) => {
		dispatch(setInteractiveRegion(value));
	};

	const Tooltip = () => (
		<div className="text-sm text-gray-500">
			{__('Select an interactive region.')}
		</div>
	);

	return (
		<SidebarMenuItem>
			<Dropdown
				placeholder={__('Select an option')}
				options={options}
				label={__('Interactive Regions')}
				tooltip={<Tooltip />}
				value={interactiveValue}
				onChange={handleInteractiveRegionChange}
			/>
		</SidebarMenuItem>
	);
};
InteractiveRegionsDropdown.displayName = 'InteractiveRegionsDropdown';

export { InteractiveRegionsDropdown };
