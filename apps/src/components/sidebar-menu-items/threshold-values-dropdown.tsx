/**
 * Threshold values dropdown component.
 *
 * A dropdown component that allows the user to select a threshold value.
 */
import React from 'react';
import { __ } from '@/context/locale-provider';

// components
import { SidebarMenuItem } from '@/components/ui/sidebar';
import Dropdown from '@/components/ui/dropdown';

// other
import { useClimateVariable } from "@/hooks/use-climate-variable";

const ThresholdValuesDropdown: React.FC = () => {
	const { climateVariable, setThreshold } = useClimateVariable();

	const Tooltip = () => (
		<div>
			{__('Multiple threshold options are available for some variables, e.g., "Days above Tmax". Select a threshold from the options available in the dropdown menu.')}
		</div>
	);

	return (
		<SidebarMenuItem>
			<Dropdown
				key={climateVariable?.getId()}
				placeholder={__('Select an option')}
				options={climateVariable?.getThresholds() ?? []}
				label={__('Threshold Values')}
				tooltip={<Tooltip />}
				value={climateVariable?.getThreshold() ?? undefined}
				onChange={setThreshold}
			/>
		</SidebarMenuItem>
	);
};
ThresholdValuesDropdown.displayName = 'ThresholdValuesDropdown';

export { ThresholdValuesDropdown };
