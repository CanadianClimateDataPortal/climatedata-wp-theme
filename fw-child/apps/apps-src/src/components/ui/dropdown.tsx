/**
 * Dropdown Component
 *
 * A custom component for rendering an optionally searchable dropdown with
 * an optional heading title and tooltip (ControlTitle component).
 *
 */
import React, { useState, useEffect, useMemo, forwardRef } from "react";
import { useI18n } from "@wordpress/react-i18n";

import { Input } from "@/components/ui/input";
import { ControlTitle } from "@/components/ui/control-title";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { cn } from "@/lib/utils";
import { DropdownOption, DropdownProps } from "@/types/types";

const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(
  ({
    className,
    placeholder,
    options = [],
    searchable = false,
    searchPlaceholder,
    label,
    tooltip,
    value,
    onChange
   }, ref) => {
    const [selected, setSelected] = useState<string>(value)
    const [search, setSearch] = useState<string>('')

    const { __ } = useI18n();

    // translate default placeholders if they are not provided
    const searchPlaceholderTranslated = searchPlaceholder ?? __('Search...');
    const placeholderTranslated = placeholder ?? __('Select an option');

    useEffect(() => {
      if (onChange) {
        onChange(selected)
      }
    }, [selected])

    // when receiving an array of strings as options we will make them valid DropdownOption objects
    const normalizedOptions: DropdownOption[] = useMemo(() => {
      return options.map((option) =>
        typeof option === "string"
          ? { label: option, value: option }
          : option
      );
    }, [options]);

    // search functionality
    const filteredOptions = normalizedOptions.filter((option) =>
      String(option.label).toLowerCase().includes(search.toLowerCase())
    );

    const handleValueChanged = (value: string) => {
      if (value === 'all') {
        setSelected(placeholderTranslated);
        setSearch('');
      }
      else {
        setSelected(value);
      }
      onChange(value);
    }

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
    }

    return (
      <div ref={ref} className={cn("dropdown z-[99999]", className)}>
        {label && <ControlTitle title={label} tooltip={tooltip} />}
        <Select value={value} onValueChange={handleValueChanged}>
          <SelectTrigger className="w-full focus:ring-0 focus:ring-offset-0">
            <SelectValue placeholder={placeholderTranslated} />
          </SelectTrigger>
          <SelectContent className="z-[99999]">
            {/* TODO: this stopped working after fixing typescript errors.. revisit and unhide!! */}
            {searchable && (
              <div className="p-2 hidden">
                <Input
                  placeholder={searchPlaceholderTranslated}
                  value={search}
                  onChange={handleSearchInputChange}
                />
              </div>
            )}
            {selected && searchable && (
              <SelectItem value="all">{placeholder}</SelectItem>
            )}
            {filteredOptions.map((option, index) => (
              <SelectItem key={index} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

      </div>
    );
  }
)
Dropdown.displayName = "Dropdown";

export default Dropdown;