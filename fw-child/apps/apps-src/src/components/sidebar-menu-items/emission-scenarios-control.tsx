/**
 * Emission scenarios component.
 *
 * A dropdown component that allows the user to select an emission scenario and compare it
 * with another from a secondary dropdown.
 */
import React from "react";
import { useI18n } from "@wordpress/react-i18n";

// components
import { SidebarMenuItem } from "@/components/ui/sidebar";
import { Checkbox } from "@/components/ui/checkbox";
import Dropdown from "@/components/ui/dropdown";

// other
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  setEmissionScenario,
  setEmissionScenarioCompare,
  setEmissionScenarioCompareTo,
} from "@/features/map/map-slice";

const EmissionScenariosControl: React.FC = () => {
  const { __ } = useI18n();
  const dispatch = useAppDispatch();

  const { emissionScenario, emissionScenarioCompare } = useAppSelector(state => state.map);

  // TODO: fetch these values from the API
  const emissionScenariosOptions = [
    { value: 'very-high', label: __('SSP5-8.5 (Very High)') },
    { value: 'high', label: __('SSP3-7.0 (High)') },
    { value: 'medium', label: __('SSP2-4.5 (Medium)') },
    { value: 'low', label: __('SSP1-2.6 (Low)') },
  ];

  const handleEmissionScenarioChange = (value: string) => {
    dispatch(setEmissionScenario(value));
  };

  const handleEmissionScenarioCompareChange = (checked: boolean) => {
    dispatch(setEmissionScenarioCompare(checked));
  };

  const handleEmissionScenarioCompareToChange = (value: string) => {
    dispatch(setEmissionScenarioCompareTo(value));
  };

  const Tooltip = () => (
    <div className="text-sm text-gray-500">
      {__('Select an emission scenario.')}
    </div>
  );

  return (
    <SidebarMenuItem>
      <div className="flex flex-col gap-4">
        <Dropdown
          label={__('Emissions Scenarios')}
          tooltip={<Tooltip />}
          placeholder={__('Select an option')}
          options={emissionScenariosOptions}
          onChange={handleEmissionScenarioChange}
        />

        <div className="flex items-center space-x-2">
          <Checkbox
            id="compare-scenarios"
            className="text-brand-red"
            checked={emissionScenarioCompare}
            onCheckedChange={handleEmissionScenarioCompareChange}
          />
          <label
            htmlFor="compare-scenarios"
            className="text-sm font-medium leading-none cursor-pointer"
          >
            {__('Compare scenarios')}
          </label>
        </div>

        {emissionScenarioCompare && (
          <Dropdown
            options={emissionScenariosOptions.filter(option => option.value !== emissionScenario)}
            onChange={handleEmissionScenarioCompareToChange}
          />
        )}
      </div>
    </SidebarMenuItem>
  );
};
EmissionScenariosControl.displayName = "EmissionScenariosControl";

export { EmissionScenariosControl };