/**
 * VariableSearchFilter Component
 * 
 * An accessible search input field for filtering variables.
 * Handles keyboard navigation and proper ARIA attributes.
 */
import React, { useState, useEffect, useRef, useContext } from 'react';
import { Search, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setSearchQuery, selectSearchQuery } from '@/store/climate-variable-slice';
import { useDebounce } from '@/hooks/use-debounce';
import { __ } from '@/context/locale-provider';
import { setVariableListLoading as setMapVariableListLoading } from '@/features/map/map-slice';
import { setVariableListLoading as setDownloadVariableListLoading } from '@/features/download/download-slice';
import SectionContext from "@/context/section-provider";

export const VariableSearchFilter: React.FC = () => {
  const dispatch = useAppDispatch();
  const globalSearchQuery = useAppSelector(selectSearchQuery);
  const [localSearchQuery, setLocalSearchQuery] = useState(globalSearchQuery);
  const debouncedSearchQuery = useDebounce(localSearchQuery, 300);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { dataset: mapDataset } = useAppSelector((state) => state.map);
  const { dataset: downloadDataset } = useAppSelector((state) => state.download);
  const section = useContext(SectionContext);
  const dataset = section === 'map' ? mapDataset : downloadDataset;

  // Update Redux state when debounced value changes
  useEffect(() => {
    if (debouncedSearchQuery !== globalSearchQuery) {
      dispatch(setSearchQuery(debouncedSearchQuery));
      // If we have a dataset, set loading state to true when search query changes
      if (dataset) {
        if (section === 'map') {
          dispatch(setMapVariableListLoading(true));
        } else {
          dispatch(setDownloadVariableListLoading(true));
        }
      }
    }
  }, [debouncedSearchQuery, dispatch, globalSearchQuery, dataset, section]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchQuery(e.target.value);
  };

  const handleClear = () => {
    setLocalSearchQuery('');
    dispatch(setSearchQuery(''));
    // If we have a dataset, set loading state
    if (dataset) {
      if (section === 'map') {
        dispatch(setMapVariableListLoading(true));
      } else {
        dispatch(setDownloadVariableListLoading(true));
      }
    }
    searchInputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle escape key to clear search
    if (e.key === 'Escape' && localSearchQuery) {
      handleClear();
    }
  };

  return (
    <div
      role="search"
      aria-label={__('Filter variables')}
      className="relative w-full py-3"
    >
      <label htmlFor="variable-search" className="sr-only">
        {__('Search for variables')}
      </label>

      <div className="relative">
        <div
          className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
          aria-hidden="true"
        >
          <Search className="h-5 w-5 text-gray-400" />
        </div>

        <input
          ref={searchInputRef}
          id="variable-search"
          type="search"
          role="searchbox"
          placeholder={__('Search')}
          value={localSearchQuery}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10 w-full py-2 bg-white focus:outline-none border-0 border-b border-gray-200 focus:border-gray-400"
        />

        {localSearchQuery && (
          <button
            type="button"
            onClick={handleClear}
            aria-label={__('Clear search')}
            className="absolute inset-y-0 right-0 flex items-center pr-3 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
          >
            <X className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
};