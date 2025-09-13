import { useState, useMemo } from 'react';

interface UseSearchFilterOptions<T> {
  items: T[];
  searchFields: (keyof T)[];
  filterFunction?: (item: T, filters: string[]) => boolean;
  sortFunction?: (a: T, b: T) => number;
}

export function useSearchFilter<T>({
  items,
  searchFields,
  filterFunction,
  sortFunction
}: UseSearchFilterOptions<T>) {
  const [searchValue, setSearchValue] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const filteredItems = useMemo(() => {
    let filtered = items;

    // Apply search filter
    if (searchValue.trim()) {
      const searchLower = searchValue.toLowerCase();
      filtered = filtered.filter(item =>
        searchFields.some(field => {
          const value = item[field];
          return String(value).toLowerCase().includes(searchLower);
        })
      );
    }

    // Apply custom filters
    if (selectedFilters.length > 0 && filterFunction) {
      filtered = filtered.filter(item => filterFunction(item, selectedFilters));
    }

    // Apply sorting
    if (sortFunction) {
      filtered = [...filtered].sort(sortFunction);
    }

    return filtered;
  }, [items, searchValue, selectedFilters, searchFields, filterFunction, sortFunction]);

  return {
    searchValue,
    setSearchValue,
    selectedFilters,
    setSelectedFilters,
    filteredItems,
    totalItems: items.length,
    filteredCount: filteredItems.length
  };
}