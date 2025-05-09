/**
 * TagSelector component
 *
 * A reusable multi-select component that displays selected items as removable tags and allows selection
 * from a dropdown. Supports keyboard navigation and accessible interactions.
 */
import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface TagSelectorOption {
  value: string;
  label: string;
}

interface TagSelectorProps {
  options: TagSelectorOption[];
  value: string[];
  onChange: (newValues: string[]) => void;
  placeholder?: string;
  className?: string;
}

const TagSelector: React.FC<TagSelectorProps> = ({
  options,
  value,
  onChange,
  placeholder = '',
  className = '',
}) => {
  // State for dropdown open/close and focused option
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter out already selected options for the dropdown
  const availableOptions = options.filter(opt => !value.includes(opt.value));

  // Helper to get the label for a given value
  const getLabel = (val: string) => options.find(opt => opt.value === val)?.label || val;

  // Handle click outside to close dropdown
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
        setFocusedIndex(null);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  // Keyboard navigation for dropdown
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Open dropdown on ArrowDown or Enter if closed
    if (!dropdownOpen && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setDropdownOpen(true);
      setFocusedIndex(0); // Focus first option
      e.preventDefault();
      return;
    }

    // If dropdown is closed or no options, do nothing
    if (!dropdownOpen) return;
    if (availableOptions.length === 0) return;

    if (e.key === 'ArrowDown') {
      // Move focus down to the next option, stay if already in last option
      setFocusedIndex(idx => {
        if (idx === null) return 0;
        return Math.min(idx + 1, availableOptions.length - 1);
      });
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      // Move focus up to previous option, stay if already in first option
      setFocusedIndex(idx => {
        if (idx === null) return 0;
        return Math.max(idx - 1, 0);
      });
      e.preventDefault();
    } else if (e.key === 'Enter') {
      // Select the focused option if any, close dropdown
      if (focusedIndex !== null && availableOptions[focusedIndex]) {
        onChange([...value, availableOptions[focusedIndex].value]);
        setDropdownOpen(false);
        setFocusedIndex(null);
      }
      e.preventDefault();
    } else if (e.key === 'Escape') {
      // Close dropdown and clear focus on Escape
      setDropdownOpen(false);
      setFocusedIndex(null);
      e.preventDefault();
    }
  };

  // Scroll focused option into view when navigating with the keyboard
  React.useEffect(() => {
    if (dropdownOpen && focusedIndex !== null && dropdownRef.current) {
      const optionEl = dropdownRef.current.querySelectorAll('[role="option"]')[focusedIndex] as HTMLElement;
      if (optionEl) {
        optionEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [dropdownOpen, focusedIndex]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'tag-selector border border-cold-gray-1 rounded-md px-2 py-2 flex flex-wrap items-center gap-2 bg-white relative',
        className
      )}
      tabIndex={0}
      onClick={() => setDropdownOpen(true)}
      onFocus={() => setDropdownOpen(true)}
      onKeyDown={handleKeyDown}
      aria-haspopup="listbox"
      aria-expanded={dropdownOpen}
    >
      {/* Render selected tags as removable items */}
      {value.length === 0 && (
        <span className="text-neutral-grey-medium select-none">{placeholder}</span>
      )}
      {value.map(val => (
        <span
          key={val}
          className="bg-cold-grey-2 rounded px-3 text-base font-medium text-neutral-grey-medium mr-1"
        >
          {/* Remove button for tag */}
          <button
            type="button"
            className="mr-2 focus:outline-none"
            onClick={e => {
              e.stopPropagation();
              onChange(value.filter(v => v !== val));
            }}
            aria-label={`Remove ${getLabel(val)}`}
          >
            ×
          </button>
          {getLabel(val)}
        </span>
      ))}
      {/* Dropdown for selecting more options */}
      {dropdownOpen && availableOptions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute left-0 top-full mt-2 w-full bg-white border border-cold-grey-2 rounded shadow-lg z-50 max-h-60 overflow-auto"
          role="listbox"
        >
          {availableOptions.map((opt, idx) => (
            <div
              key={opt.value}
              role="option"
              aria-selected={focusedIndex === idx}
              className={cn(
                'px-4 py-2 cursor-pointer text-base text-neutral-grey-medium',
                focusedIndex === idx ? 'bg-brand-blue/20' : 'hover:bg-brand-blue/10'
              )}
              onClick={e => {
                e.stopPropagation();
                onChange([...value, opt.value]);
                setDropdownOpen(false);
                setFocusedIndex(null);
              }}
              onMouseEnter={() => setFocusedIndex(idx)}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagSelector;