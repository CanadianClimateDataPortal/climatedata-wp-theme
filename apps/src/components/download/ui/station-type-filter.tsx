import React from 'react';
import { CheckboxFactory } from '@/components/ui/checkbox';
import { AHCCD_SQUARE_ICON, AHCCD_TRIANGLE_ICON, AHCCD_CIRCLE_ICON } from '@/lib/constants';

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
      title="Station type"
      name="ahccd-type"
      values={stationTypes}
      options={[
        { value: 'T', label: <span className="flex items-center gap-2">{AHCCD_SQUARE_ICON} Temperature</span> },
        { value: 'P', label: <span className="flex items-center gap-2">{AHCCD_TRIANGLE_ICON} Precipitation</span> },
        { value: 'B', label: <span className="flex items-center gap-2">{AHCCD_CIRCLE_ICON} Both</span> },
      ]}
      onChange={setStationTypes}
      orientation="vertical"
      className="mb-4"
      {...(loading || disabled ? { disabled: true } : {})}
    />
  );
};

export default StationTypeFilter;