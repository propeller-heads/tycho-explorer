import { useState, useEffect, useCallback, useRef } from 'react';

interface UsePersistedFiltersOptions {
  chain: string;
}

interface FilterData {
  selectedProtocols: string[];
  selectedTokens: string[]; // Always stored as addresses
  hasProtocolsEntry?: boolean; // Indicates if protocols were found in localStorage
}

export function usePersistedFilters({ chain }: UsePersistedFiltersOptions) {
  const [isLoading, setIsLoading] = useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Construct storage keys based on chain
  const getStorageKey = useCallback((dataType: 'protocols' | 'tokens') => {
    return `tycho_selected${dataType.charAt(0).toUpperCase() + dataType.slice(1)}_${chain}`;
  }, [chain]);

  // Load filters from localStorage
  const loadFilters = useCallback((): FilterData => {
    try {
      const protocolsKey = getStorageKey('protocols');
      const tokensKey = getStorageKey('tokens');

      const protocolsJson = localStorage.getItem(protocolsKey);
      const tokensJson = localStorage.getItem(tokensKey);

      const protocols = protocolsJson ? JSON.parse(protocolsJson) : [];
      const tokens = tokensJson ? JSON.parse(tokensJson) : [];

      return {
        selectedProtocols: protocols,
        selectedTokens: tokens,
        hasProtocolsEntry: protocolsJson !== null
      };
    } catch (error) {
      console.error('[Persistence] Error loading filters:', error);
      return {
        selectedProtocols: [],
        selectedTokens: [],
        hasProtocolsEntry: false
      };
    } finally {
      setIsLoading(false);
    }
  }, [chain, getStorageKey]);

  // Save filters to localStorage with debouncing
  const saveFilters = useCallback((filters: FilterData) => {
    // Clear any pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce the save operation
    saveTimeoutRef.current = setTimeout(() => {
      try {
        const protocolsKey = getStorageKey('protocols');
        const tokensKey = getStorageKey('tokens');

        localStorage.setItem(protocolsKey, JSON.stringify(filters.selectedProtocols));
        localStorage.setItem(tokensKey, JSON.stringify(filters.selectedTokens));

      } catch (error) {
        console.error('[Persistence] Error saving filters:', error);
      }
    }, 500); // 500ms debounce
  }, [chain, getStorageKey]);

  // Clear filters from localStorage
  const clearFilters = useCallback(() => {
    try {
      const protocolsKey = getStorageKey('protocols');
      const tokensKey = getStorageKey('tokens');

      localStorage.removeItem(protocolsKey);
      localStorage.removeItem(tokensKey);

    } catch (error) {
      console.error('[Persistence] Error clearing filters:', error);
    }
  }, [chain, getStorageKey]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    loadFilters,
    saveFilters,
    clearFilters,
    isLoading
  };
}