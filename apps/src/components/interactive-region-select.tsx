/**
 * InteractiveRegionSelect component.
 *
 * A dropdown component that allows the user to select an interactive region.
 */
import React from 'react';
import { __ } from '@/context/locale-provider';

// components
import Dropdown from '@/components/ui/dropdown';

// other
import { useClimateVariable } from '@/hooks/use-climate-variable';
import {
	InteractiveRegionConfig,
	InteractiveRegionDisplay,
	InteractiveRegionOption,
} from '@/types/climate-variable-interface';

interface InteractiveRegionSelectProps {
	onChange?: (value: InteractiveRegionOption) => void;
	displayMode: InteractiveRegionDisplay;
}

const InteractiveRegionSelect: React.FC<InteractiveRegionSelectProps> = ({
	onChange,
	displayMode,
}) => {
	const { climateVariable, setInteractiveRegion } = useClimateVariable();

	const options: { value: InteractiveRegionOption; label: string }[] = [
		{
			value: InteractiveRegionOption.GRIDDED_DATA,
			label: __('Grid Cells'),
		},
		{
			value: InteractiveRegionOption.CENSUS,
			label: __('Census Subdivisions'),
		},
		{
			value: InteractiveRegionOption.HEALTH,
			label: __('Health Regions'),
		},
		{
			value: InteractiveRegionOption.WATERSHED,
			label: __('Watersheds'),
		},
	];

	const interactiveRegionConfig =
		climateVariable?.getInteractiveRegionConfig() ??
		({} as InteractiveRegionConfig);

	// Filter options based on the config.
	const availableOptions = options.filter((option) => {
		let optionDisplay =
			interactiveRegionConfig[option.value];
		return (
			optionDisplay &&
			(optionDisplay === InteractiveRegionDisplay.ALWAYS ||
				optionDisplay === displayMode)
		);
	});

	const Tooltip = () => (
		<div>
			{__(
				'Some gridded datasets have been averaged over different regions of interest. ' +
					'For climate model ensembles, these averages were calculated for each ' +
					'individual model simulation before being summarized into percentiles. ' +
					'Select a region from the options in the dropdown menu.'
			)}
		</div>
	);

	const handleChange = (value: InteractiveRegionOption) => {
		if (onChange) {
			onChange(value);
		}
		setInteractiveRegion(value);
	};

	return (
		<Dropdown
			key={climateVariable?.getId()}
			placeholder={__('Select an option')}
			options={availableOptions}
			label={__('Interactive Regions')}
			tooltip={<Tooltip />}
			value={climateVariable?.getInteractiveRegion() ?? undefined}
			onChange={handleChange}
		/>
	);
};

InteractiveRegionSelect.displayName = 'InteractiveRegionSelect';

export default InteractiveRegionSelect;
