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
import { useClimateVariable } from "@/hooks/use-climate-variable";
import { InteractiveRegionConfig, InteractiveRegionOption } from "@/types/climate-variable-interface";

interface InteractiveRegionSelectProps {
  onChange?: (value: InteractiveRegionOption) => void;
}

const InteractiveRegionSelect: React.FC<InteractiveRegionSelectProps> = ({ onChange }) => {
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

  const handleChange = (value: InteractiveRegionOption) => {
    if (onChange) onChange(value);
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
