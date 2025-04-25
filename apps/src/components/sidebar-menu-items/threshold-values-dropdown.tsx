/**
 * Threshold values dropdown component.
 *
 * A dropdown component that allows the user to select a threshold value.
 */
import React from 'react';
import { useI18n } from '@wordpress/react-i18n';

// components
import { SidebarMenuItem } from '@/components/ui/sidebar';
import Dropdown from '@/components/ui/dropdown';

// other
import { useClimateVariable } from "@/hooks/use-climate-variable";

const ThresholdValuesDropdown: React.FC = () => {
	const { __ } = useI18n();
	const { climateVariable, setThreshold } = useClimateVariable();

	const Tooltip = () => (
		<div className="text-sm text-gray-500">
			{__('Select a threshold value.')}
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
