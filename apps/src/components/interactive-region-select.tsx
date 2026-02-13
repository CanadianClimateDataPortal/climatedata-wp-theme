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
import { useShapefile } from '@/hooks/use-shapefile';

interface InteractiveRegionSelectProps {
	onChange?: (value: InteractiveRegionOption) => void;
	displayMode: InteractiveRegionDisplay;
}

const InteractiveRegionSelect: React.FC<InteractiveRegionSelectProps> = ({
	onChange,
	displayMode,
}) => {
	const { climateVariable, setInteractiveRegion } = useClimateVariable();
	const { reset: resetShapefile } = useShapefile();

	const options: { value: InteractiveRegionOption; label: string }[] = [
		InteractiveRegionOption.GRIDDED_DATA,
		InteractiveRegionOption.CENSUS,
		InteractiveRegionOption.HEALTH,
		InteractiveRegionOption.WATERSHED,
		// InteractiveRegionOption.USER,
	].map((type) => ({
		value: type,
		label: getInteractiveRegionName(type),
	}));

	// TEMPORARY
	// The "Custom Shapefile" option is temporarily available only if the
	// `shapefile=1` GET parameter is present in the URL.
	// Once we are ready to make this option available to all users, we
	// have to delete this temporary code and uncomment the
	// `InteractiveRegionOption.USER` in the creation of the `options` array
	// above.
	const urlParams = new URLSearchParams(window.location.search);
	if (urlParams.get('shapefile') === '1') {
		options.push({
			value: InteractiveRegionOption.USER,
			label: getInteractiveRegionName(InteractiveRegionOption.USER),
		});
	}
	// END TEMPORARY

	const interactiveRegionConfig =
		climateVariable?.getInteractiveRegionConfig() ??
		({} as InteractiveRegionConfig);

	// Filter options based on the config.
	const availableOptions = options.filter((option) => {
		const optionDisplay =
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

		// If changing from the shapefile option, we clear the shapefile state.
		if (climateVariable?.getInteractiveRegion() === InteractiveRegionOption.USER) {
			resetShapefile();
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
