/**
 * Threshold values dropdown component.
 *
 * A dropdown component that allows the user to select a threshold value.
 */
import React, { useContext } from 'react';
import { useI18n } from '@wordpress/react-i18n';

// components
import { SidebarMenuItem } from '@/components/ui/sidebar';

// other
import SectionContext from "@/context/section-provider";
import { useClimateVariable } from "@/hooks/use-climate-variable";
import { FrequencySelect } from "@/components/frequency-select";
import { FrequencyConfig } from "@/types/climate-variable-interface";

const FrequenciesDropdown: React.FC = () => {
	const { __ } = useI18n();
	const section = useContext(SectionContext);
	const { climateVariable, setFrequency } = useClimateVariable();
	const frequencyConfig = climateVariable?.getFrequencyConfig() ?? {} as FrequencyConfig;
	const defaultValue = climateVariable?.getFrequency() ?? undefined;

	const Tooltip = () => (
		<div className="text-sm text-gray-500">
			{__('Select a frequency.')}
		</div>
	);

	return (
		<SidebarMenuItem>
			<FrequencySelect
				title={'Frequencies'}
				config={frequencyConfig}
				section={section}
				value={defaultValue}
				placeholder={'Select an option'}
				tooltip={<Tooltip />}
				onValueChange={setFrequency}
			/>
		</SidebarMenuItem>
	);
};
FrequenciesDropdown.displayName = 'FrequenciesDropdown';

export { FrequenciesDropdown };
