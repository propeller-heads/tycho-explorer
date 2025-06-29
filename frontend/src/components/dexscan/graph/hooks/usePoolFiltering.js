import { useMemo } from 'react';
import { filterPools } from '@/components/dexscan/utils/poolFilters';

/**
 * Hook to filter pools based on selected tokens and protocols
 * @param {Object} pools - All pools from PoolDataContext
 * @param {string[]} selectedTokens - Selected token addresses
 * @param {string[]} selectedProtocols - Selected protocol names
 * @returns {Array} Filtered pools array
 */
export function usePoolFiltering(pools, selectedTokens, selectedProtocols) {
  return useMemo(() => {
    // Early exit if no tokens selected
    if (selectedTokens.length === 0) {
      return [];
    }

    // Convert pools object to array and filter
    const poolsArray = Object.values(pools);
    return filterPools(poolsArray, selectedTokens, selectedProtocols);
  }, [pools, selectedTokens, selectedProtocols]);
}