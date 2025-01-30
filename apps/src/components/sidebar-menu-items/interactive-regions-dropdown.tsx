/**
 * InteractiveRegionsDropdown component.
 *
 * A dropdown component that allows the user to select an interactive region.
 */
import React from "react";
import { useI18n } from "@wordpress/react-i18n";

// components
import { SidebarMenuItem } from "@/components/ui/sidebar";
import Dropdown from "@/components/ui/dropdown";

// other
import { useAppDispatch } from "@/app/hooks";
import { setInteractiveRegion } from "@/features/map/map-slice";

const InteractiveRegionsDropdown: React.FC = () => {
  const { __ } = useI18n();

  const dispatch = useAppDispatch();

  // TODO: fetch these values from the API
  const options = [
    { value: 'gridded_data', label: __('Grid Cells') },
    { value: 'census', label: __('Census Subdivisions') },
    { value: 'health', label: __('Health Regions') },
    { value: 'watershed', label: __('Watersheds') },
  ];

  const handleInteractiveRegionChange = (value: string) => {
    dispatch(setInteractiveRegion(value));
  };

  const Tooltip = () => (
    <div className="text-sm text-gray-500">
      {__('Select an interactive region.')}
    </div>
  );

  return (
    <SidebarMenuItem>
      <Dropdown
        placeholder={__('Select an option')}
        options={options}
        label={__('Interactive Regions')}
        tooltip={<Tooltip />}
        onChange={handleInteractiveRegionChange}
      />
    </SidebarMenuItem>
  );
};
InteractiveRegionsDropdown.displayName = "InteractiveRegionsDropdown";

export { InteractiveRegionsDropdown };
