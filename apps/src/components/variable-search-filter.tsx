/**
 * VariableSearchFilter Component
 * 
 * The component renders a search input field with an icon for filtering variables.
 * Searches in the frontend and filters the variables based on the input value.
 */
import React from 'react';
import { Search } from 'lucide-react';

interface VariableSearchFilterProps {
  onSearch: (value: string) => void;
  value: string;
}

export const VariableSearchFilter: React.FC<VariableSearchFilterProps> = ({
  onSearch,
  value
}) => {
  return (
    <div className="relative w-full py-3">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        placeholder="Search"
        value={value}
        onChange={(e) => onSearch(e.target.value)}
        className="pl-10 w-full py-2 bg-transparent focus:outline-none border-0 border-b border-gray-200 focus:border-gray-400"
      />
    </div>
  );
};