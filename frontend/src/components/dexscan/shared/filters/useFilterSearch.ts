import { useMemo } from 'react';

// Generic filter search logic
export const useFilterSearch = <T>(
  items: T[],
  search: string,
  searchFields: (item: T) => string[]
): T[] => {
  return useMemo(() => {
    if (!search.trim()) return items;
    
    const searchLower = search.toLowerCase();
    
    return items.filter(item => {
      const fields = searchFields(item);
      return fields.some(field => 
        field?.toLowerCase().includes(searchLower)
      );
    });
  }, [items, search, searchFields]);
};