import { useState, useCallback } from 'react';

// Common popover state and logic
export const useFilterPopover = (initialOpen = false) => {
  const [open, setOpen] = useState(initialOpen);
  const [search, setSearch] = useState('');
  
  // Reset search when popover closes
  const handleOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearch('');
    }
  }, []);
  
  // Clear search
  const clearSearch = useCallback(() => {
    setSearch('');
  }, []);
  
  return {
    open,
    setOpen: handleOpenChange,
    search,
    setSearch,
    clearSearch
  };
};