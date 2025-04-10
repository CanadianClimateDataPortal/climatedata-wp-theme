/**
 * VariableSearchFilter Component
 * 
 * The component renders a search input field with an icon for filtering variables.
 * Searches in the frontend and filters the variables based on the input value.
 */
import React from 'react';
import { Search, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setSearchQuery } from '@/store/climate-variable-slice';

export const VariableSearchFilter: React.FC = () => {
  const dispatch = useAppDispatch();
  const searchQuery = useAppSelector(state => state.climateVariable.searchQuery);
  return (
    <div className="relative w-full py-3">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        placeholder="Search"
        value={searchQuery}
        onChange={(e) => dispatch(setSearchQuery(e.target.value))}
        className="pl-10 pr-10 w-full py-2 bg-transparent focus:outline-none border-0 border-b border-gray-200 focus:border-gray-400"
      />
      {searchQuery && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer">
          <X
            className="h-5 w-5 text-gray-400 hover:text-gray-600"
            onClick={() => dispatch(setSearchQuery(''))}
          />
        </div>
      )}
    </div>
  );
};