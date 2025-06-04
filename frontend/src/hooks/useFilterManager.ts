import { useState, useEffect, useCallback } from 'react';
import { usePersistedFilters } from './usePersistedFilters';

interface UseFilterManagerOptions {
  viewType: 'graph' | 'list';
  chain: string;
}

export function useFilterManager({ viewType, chain }: UseFilterManagerOptions) {
  const [selectedTokenAddresses, setSelectedTokenAddresses] = useState<string[]>([]);
  const [selectedProtocols, setSelectedProtocols] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const { loadFilters, saveFilters, clearFilters } = usePersistedFilters({
    viewType,
    chain
  });
  
  // Load filters on mount or chain change
  useEffect(() => {
    console.log(`[FilterManager] Loading filters for ${viewType} view on ${chain}`);
    const filters = loadFilters();
    setSelectedTokenAddresses(filters.selectedTokens);
    setSelectedProtocols(filters.selectedProtocols);
    setIsInitialized(true);
  }, [chain, viewType]); // Only depend on chain and viewType, not the function refs
  
  // Save filters when they change (after initialization)
  useEffect(() => {
    if (!isInitialized) return;
    
    saveFilters({
      selectedTokens: selectedTokenAddresses,
      selectedProtocols: selectedProtocols
    });
  }, [selectedTokenAddresses, selectedProtocols, saveFilters, isInitialized]);
  
  // Token toggle with built-in duplicate prevention
  const toggleToken = useCallback((address: string, isSelected: boolean) => {
    setSelectedTokenAddresses(prev => {
      if (isSelected) {
        if (prev.includes(address)) {
          console.log(`[FilterManager] Token ${address} already selected, skipping`);
          return prev; // Prevent duplicates
        }
        return [...prev, address];
      } else {
        return prev.filter(a => a !== address);
      }
    });
  }, []);
  
  // Protocol toggle with built-in duplicate prevention
  const toggleProtocol = useCallback((protocol: string, isSelected: boolean) => {
    setSelectedProtocols(prev => {
      if (isSelected) {
        if (prev.includes(protocol)) {
          console.log(`[FilterManager] Protocol ${protocol} already selected, skipping`);
          return prev; // Prevent duplicates
        }
        return [...prev, protocol];
      } else {
        return prev.filter(p => p !== protocol);
      }
    });
  }, []);
  
  const resetFilters = useCallback(() => {
    setSelectedTokenAddresses([]);
    setSelectedProtocols([]);
    clearFilters();
  }, [clearFilters]);
  
  return {
    selectedTokenAddresses,
    selectedProtocols,
    toggleToken,
    toggleProtocol,
    resetFilters,
    isInitialized
  };
}