import { Pool } from '@/components/dexscan/app/types';

/**
 * Filters pools based on selected tokens and protocols.
 * 
 * @param pools - Array or object of pools to filter
 * @param selectedTokenAddresses - Selected token addresses
 * @param selectedProtocols - Selected protocols (must have at least one)
 * @param emptyTokensShowsNoPools - If true, returns empty when no tokens selected (GraphView behavior)
 * @returns Filtered array of pools
 */
export const filterPools = (
  pools: Pool[] | Record<string, Pool>, 
  selectedTokenAddresses: string[], 
  selectedProtocols: string[],
  emptyTokensShowsNoPools: boolean = false
): Pool[] => {
  // Must have at least one protocol selected
  if (selectedProtocols.length === 0) {
    return [];
  }
  
  // Handle empty tokens based on flag (GraphView vs ListView behavior)
  if (selectedTokenAddresses.length === 0 && emptyTokensShowsNoPools) {
    return [];
  }
  
  // Handle both array and object inputs
  const poolsArray = Array.isArray(pools) ? pools : Object.values(pools);
  
  return poolsArray.filter(pool => {
    // Token filter: if tokens selected, pool tokens must be subset of selected
    const tokenMatch = selectedTokenAddresses.length === 0 ||
      pool.tokens.every(token => 
        selectedTokenAddresses.includes(token.address)
      );
    
    // Protocol filter: pool must match one of selected protocols
    const protocolMatch = selectedProtocols.includes(pool.protocol_system);
    
    return tokenMatch && protocolMatch;
  });
};