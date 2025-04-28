import { useMemo } from 'react';
import { PostData } from '@/types/types';

/**
 * Hook to handle variable filtering logic
 * 
 * @param variableList The complete list of variables
 * @param filterValues Filter values for taxonomies
 * @param searchQuery Optional search query string
 * @returns Filtered variables and filter state information
 */
export const useFilteredVariables = (
  variableList: PostData[],
  filterValues: Record<string, string>,
  searchQuery: string
) => {
  const filteredList = useMemo(() => {
    if (!variableList.length) return [];

    let filtered = [...variableList];

    // Apply search filter if exists
    if (searchQuery && searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => {
        const title = (item.title || '').toLowerCase();
        const description = (item.description || '').toLowerCase();
        return title.includes(query) || description.includes(query);
      });
    }

    // Apply sector filter if selected
    if (filterValues.sector) {
      filtered = filtered.filter(item => {
        const sectors = item.taxonomies?.sector || [];
        return sectors.some(sector => sector.id.toString() === filterValues.sector);
      });
    }

    // Apply variable type filter if selected
    if (filterValues['var-type']) {
      filtered = filtered.filter(item => {
        const varTypes = item.taxonomies?.['var-type'] || [];
        return varTypes.some(varType => varType.id.toString() === filterValues['var-type']);
      });
    }

    return filtered;
  }, [variableList, searchQuery, filterValues]);

  // Is filtering active
  const isFiltering = useMemo(() => {
    return Boolean(filterValues.sector || filterValues['var-type'] || searchQuery);
  }, [filterValues, searchQuery]);

  return {
    filteredList,
    isFiltering,
    filteredCount: filteredList.length,
    totalCount: variableList.length
  };
};

export default useFilteredVariables;