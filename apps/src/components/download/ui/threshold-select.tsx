/**
 * Threshold values dropdown component.
 *
 * A dropdown component that allows the user to select a threshold value.
 */
import React from 'react';
import { __ } from '@/context/locale-provider';

import Dropdown from '@/components/ui/dropdown';

import { useClimateVariable } from '@/hooks/use-climate-variable';

const ThresholdSelect: React.FC = () => {
	const { climateVariable, setThreshold } = useClimateVariable();
	const isReturnPeriod = climateVariable?.getClass() === 'ReturnPeriodClimateVariable';
	let options = climateVariable?.getThresholds() ?? [];
	options = options.map((option) => ({ label: __(option.label), value: option.value }));

	const Tooltip = () => (
		<div>
			{__(
				'Multiple threshold options are available for some ' +
				'variables, e.g., "Days above Tmax". Select a threshold from ' +
				'the options available in the dropdown menu.'
			)}
		</div>
	);

	return (
		<Dropdown
			className="sm:w-64"
			placeholder={__('Select an option')}
			options={options}
			label={__(isReturnPeriod ? 'Return Periods' : 'Threshold Values')}
			tooltip={isReturnPeriod ? null : <Tooltip />}
			value={climateVariable?.getThreshold() ?? undefined}
			onChange={setThreshold}
		/>
	);
};
ThresholdSelect.displayName = 'ThresholdSelect';

export { ThresholdSelect };
