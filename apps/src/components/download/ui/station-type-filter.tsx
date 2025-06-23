import React from 'react';
import { CheckboxFactory } from '@/components/ui/checkbox';
import { AHCCD_SQUARE_ICON, AHCCD_TRIANGLE_ICON, AHCCD_CIRCLE_ICON } from '@/lib/constants';
import {__} from "@/context/locale-provider.tsx";

/**
 * StationTypeFilter
 * -----------------
 * Checkbox group for selecting AHCCD station types (Temperature, Precipitation, Both).
 * Used in the raster download map for filtering stations.
 */
export interface StationTypeFilterProps {
  stationTypes: string[];
  setStationTypes: (types: string[]) => void;
  loading?: boolean;
  disabled?: boolean;
}

const StationTypeFilter: React.FC<StationTypeFilterProps> = ({ stationTypes, setStationTypes, loading, disabled }) => {
  return (
    <CheckboxFactory
			title={__('Station type')}
      name="ahccd-type"
      values={stationTypes}
      options={[
        { value: 'T', label: <span className="flex items-center gap-2">{AHCCD_SQUARE_ICON} {__('Temperature')}</span> },
        { value: 'P', label: <span className="flex items-center gap-2">{AHCCD_TRIANGLE_ICON} {__('Precipitation')}</span> },
        { value: 'B', label: <span className="flex items-center gap-2">{AHCCD_CIRCLE_ICON} {__('Both')}</span> },
      ]}
      onChange={setStationTypes}
      orientation="vertical"
      className="mb-4"
      {...(loading || disabled ? { disabled: true } : {})}
    />
  );
};

export default StationTypeFilter;
