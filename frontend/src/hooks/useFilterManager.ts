import { useState, useEffect, useCallback } from 'react';
import { usePersistedFilters } from './usePersistedFilters';

interface UseFilterManagerOptions {
  chain: string;
  availableProtocols?: string[];
}

export function useFilterManager({ chain, availableProtocols }: UseFilterManagerOptions) {
  const [selectedTokenAddresses, setSelectedTokenAddresses] = useState<string[]>([]);
  const [selectedProtocols, setSelectedProtocols] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const { loadFilters, saveFilters, clearFilters } = usePersistedFilters({
    chain
  });
  
  // Load filters on mount or chain change
  useEffect(() => {
    console.log(`[FilterManager] Loading filters for ${chain}`);
    const filters = loadFilters();
    setSelectedTokenAddresses(filters.selectedTokens);
    
    // Initialize protocols with all available only if no localStorage entry exists
    if (!filters.hasProtocolsEntry && availableProtocols && availableProtocols.length > 0) {
      console.log(`[FilterManager] No localStorage entry found, selecting all ${availableProtocols.length} available protocols`);
      setSelectedProtocols(availableProtocols);
    } else {
      setSelectedProtocols(filters.selectedProtocols);
    }
    
    setIsInitialized(true);
  }, [chain, loadFilters]); // Only depend on chain and loadFilters
  
  // Auto-select all protocols when they become available for the first time
  useEffect(() => {
    // Only auto-select if:
    // 1. No localStorage entry exists (hasProtocolsEntry from loadFilters was false)
    // 2. No protocols are currently selected
    // 3. Available protocols now exist
    if (!isInitialized) return; // Wait for initial load
    
    const filters = loadFilters();
    if (!filters.hasProtocolsEntry && 
        selectedProtocols.length === 0 && 
        availableProtocols && 
        availableProtocols.length > 0) {
      console.log(`[FilterManager] Protocols now available, selecting all ${availableProtocols.length}`);
      setSelectedProtocols(availableProtocols);
    }
  }, [availableProtocols, isInitialized, selectedProtocols.length, loadFilters]);
  
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