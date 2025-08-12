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
import { getInteractiveRegionName } from '@/lib/utils';

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
		InteractiveRegionOption.GRIDDED_DATA,
		InteractiveRegionOption.CENSUS,
		InteractiveRegionOption.HEALTH,
		InteractiveRegionOption.WATERSHED,
	].map((type) => ({
		value: type,
		label: getInteractiveRegionName(type),
	}));

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
