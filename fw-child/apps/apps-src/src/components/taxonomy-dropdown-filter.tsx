import React, { useEffect, useState } from "react";
import { useI18n } from "@wordpress/react-i18n";

import Dropdown from "@/components/ui/dropdown";
import { fetchTaxonomyData } from "@/services/services";

const TaxonomyDropdownFilter: React.FC<{
  slug: string;
  value?: string;
  label: string;
  tooltip?: string;
  placeholder?: string;
  className?: string;
  onFilterChange: (value: string) => void;
}> = ({
  slug,
  value = "",
  label,
  tooltip,
  placeholder = 'All',
  className,
  onFilterChange,
}) => {
  const [options, setOptions] = useState<{ value: string; label: string }[]>([]);

  const { __ } = useI18n();

  useEffect(() => {
    (async () => {
      const data = await fetchTaxonomyData(slug);
      setOptions(
        data.map((option: any) => ({
          value: String(option.id),
          label: option.name,
        }))
      );
    })();
  }, []);

  return (
    <Dropdown
      className={className}
      searchable
      value={value}
      label={__(label)}
      tooltip={tooltip && __(tooltip)}
      placeholder={__(placeholder)}
      options={options}
      onChange={(selectedValue) => {
        onFilterChange(selectedValue === __(placeholder) ? '' : selectedValue);
      }}
    />
  );
};
TaxonomyDropdownFilter.displayName = "TaxonomyDropdownFilter";

export default TaxonomyDropdownFilter;