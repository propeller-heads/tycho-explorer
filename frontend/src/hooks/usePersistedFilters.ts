import { useState, useEffect, useCallback, useRef } from 'react';

interface UsePersistedFiltersOptions {
  viewType: 'graph' | 'list';
  chain: string;
}

interface FilterData {
  selectedProtocols: string[];
  selectedTokens: string[]; // Always stored as addresses
}

export function usePersistedFilters({ viewType, chain }: UsePersistedFiltersOptions) {
  const [isLoading, setIsLoading] = useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Construct storage keys based on view type and chain
  const getStorageKey = (dataType: 'protocols' | 'tokens') => {
    return `tycho_${viewType}View_selected${dataType.charAt(0).toUpperCase() + dataType.slice(1)}_${chain}`;
  };

  // Load filters from localStorage
  const loadFilters = useCallback((): FilterData => {
    try {
      const protocolsKey = getStorageKey('protocols');
      const tokensKey = getStorageKey('tokens');

      const protocolsJson = localStorage.getItem(protocolsKey);
      const tokensJson = localStorage.getItem(tokensKey);

      const protocols = protocolsJson ? JSON.parse(protocolsJson) : [];
      const tokens = tokensJson ? JSON.parse(tokensJson) : [];

      console.log(`[Persistence] Loaded filters for ${viewType} view on ${chain}:`, {
        protocols,
        tokens
      });

      return {
        selectedProtocols: protocols,
        selectedTokens: tokens
      };
    } catch (error) {
      console.error('[Persistence] Error loading filters:', error);
      return {
        selectedProtocols: [],
        selectedTokens: []
      };
    } finally {
      setIsLoading(false);
    }
  }, [viewType, chain]);

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

        console.log(`[Persistence] Saved filters for ${viewType} view on ${chain}:`, {
          protocols: filters.selectedProtocols,
          tokens: filters.selectedTokens,
          protocolsKey,
          tokensKey
        });
      } catch (error) {
        console.error('[Persistence] Error saving filters:', error);
      }
    }, 500); // 500ms debounce
  }, [viewType, chain]);

  // Clear filters from localStorage
  const clearFilters = useCallback(() => {
    try {
      const protocolsKey = getStorageKey('protocols');
      const tokensKey = getStorageKey('tokens');

      localStorage.removeItem(protocolsKey);
      localStorage.removeItem(tokensKey);

      console.log(`[Persistence] Cleared filters for ${viewType} view on ${chain}`);
    } catch (error) {
      console.error('[Persistence] Error clearing filters:', error);
    }
  }, [viewType, chain]);

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