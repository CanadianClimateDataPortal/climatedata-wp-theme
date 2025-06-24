import React from 'react';
import { RadioGroupFactory } from '@/components/ui/radio-group';
import {__} from "@/context/locale-provider.tsx";

/**
 * SelectionModeControls
 * --------------------
 * Renders radio buttons for selecting the map selection mode.
 */
export interface SelectionModeControlsProps {
  selectionMode: string;
  selectionModeOptions: { value: string; label: string }[];
  onChange: (value: string) => void;
}

const SelectionModeControls: React.FC<SelectionModeControlsProps> = ({ selectionMode, selectionModeOptions, onChange }) => {
  return (
    <RadioGroupFactory
      title={__('Ways to select on the map')}
      name="map-selection-mode"
      value={selectionMode}
      orientation="horizontal"
      className="mb-0"
      optionClassName="me-8"
      options={selectionModeOptions}
      onValueChange={onChange}
    />
  );
};

export default SelectionModeControls;
