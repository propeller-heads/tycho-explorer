import { Pool } from '@/components/dexscan/app/types';

/**
 * Filters pools based on selected tokens and protocols.
 * Token filtering uses AND logic - pools must contain ALL selected tokens.
 * Protocol filtering requires at least one protocol to be selected.
 */
export const filterPools = (
  pools: Pool[], 
  selectedTokenAddresses: string[], 
  selectedProtocols: string[]
): Pool[] => {
  return pools.filter(pool => {
    // Token filter: selected tokens must contain ALL pool tokens (AND logic)
    const tokenMatch = selectedTokenAddresses.length === 0 ||
      pool.tokens.every(t => selectedTokenAddresses.some(stAddr => stAddr === t.address));
    
    // Protocol filter: pool must match one of the selected protocols
    const protocolMatch = selectedProtocols.length > 0 &&
      selectedProtocols.includes(pool.protocol_system);
    
    // Both conditions must be true
    return tokenMatch && protocolMatch;
  });
};