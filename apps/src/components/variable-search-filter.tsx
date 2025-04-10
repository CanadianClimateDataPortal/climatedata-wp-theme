/**
 * VariableSearchFilter Component
 * 
 * The component renders a search input field with an icon for filtering variables.
 * Searches in the frontend and filters the variables based on the input value.
 */
import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setSearchQuery, selectSearchQuery } from '@/store/climate-variable-slice';
import { useDebounce } from '@/hooks/use-debounce';
import { useI18n } from '@wordpress/react-i18n';

export const VariableSearchFilter: React.FC = () => {
  const dispatch = useAppDispatch();
  const globalSearchQuery = useAppSelector(selectSearchQuery);
  const [localSearchQuery, setLocalSearchQuery] = useState(globalSearchQuery);
  const debouncedSearchQuery = useDebounce(localSearchQuery, 300);
  const { __ } = useI18n();

  // Update Redux state when debounced value changes
  useEffect(() => {
    if (debouncedSearchQuery !== globalSearchQuery) {
      dispatch(setSearchQuery(debouncedSearchQuery));
    }
  }, [debouncedSearchQuery, dispatch, globalSearchQuery]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchQuery(e.target.value);
  };

  const handleClear = () => {
    setLocalSearchQuery('');
    dispatch(setSearchQuery(''));
  };
  return (
    <div className="relative w-full py-3">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        placeholder={__('Search')}
        value={localSearchQuery}
        onChange={handleChange}
        className="pl-10 pr-10 w-full py-2 bg-transparent focus:outline-none border-0 border-b border-gray-200 focus:border-gray-400"
      />
      {localSearchQuery && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer">
          <X
            className="h-5 w-5 text-gray-400 hover:text-gray-600"
            onClick={handleClear}
          />
        </div>
      )}
    </div>
  );
};