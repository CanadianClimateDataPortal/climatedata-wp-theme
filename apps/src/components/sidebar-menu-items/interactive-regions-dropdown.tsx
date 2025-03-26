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
import { useClimateVariable } from "@/hooks/use-climate-variable";
import { InteractiveRegionConfig, InteractiveRegionOption } from "@/types/climate-variable-interface";

const InteractiveRegionsDropdown: React.FC = () => {
	const { __ } = useI18n();
	const { climateVariable, setInteractiveRegion } = useClimateVariable();

	const options: { value: InteractiveRegionOption; label: string }[] = [
		{ value: InteractiveRegionOption.GRIDDED_DATA, label: __('Grid Cells') },
		{ value: InteractiveRegionOption.CENSUS, label: __('Census Subdivisions') },
		{ value: InteractiveRegionOption.HEALTH, label: __('Health Regions') },
		{ value: InteractiveRegionOption.WATERSHED, label: __('Watersheds') },
	];

	const interactiveRegionConfig = climateVariable?.getInteractiveRegionConfig() ?? {} as InteractiveRegionConfig;

	// Filter options based on the config.
	const availableOptions = options.filter((option) =>
		(option.value in interactiveRegionConfig) && interactiveRegionConfig[option.value as InteractiveRegionOption]
	);

	const Tooltip = () => (
		<div className="text-sm text-gray-500">
			{__('Select an interactive region.')}
		</div>
	);

	return (
		<SidebarMenuItem>
			<Dropdown
				placeholder={__('Select an option')}
				options={availableOptions}
				label={__('Interactive Regions')}
				tooltip={<Tooltip />}
				value={climateVariable?.getInteractiveRegion() ?? undefined}
				onChange={setInteractiveRegion}
			/>
		</SidebarMenuItem>
	);
};
InteractiveRegionsDropdown.displayName = 'InteractiveRegionsDropdown';

export { InteractiveRegionsDropdown };
