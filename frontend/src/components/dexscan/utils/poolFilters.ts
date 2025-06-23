import { Pool } from '../types';

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
    // Token filter: pool must contain ALL selected tokens (AND logic)
    const tokenMatch = selectedTokenAddresses.length === 0 ||
      selectedTokenAddresses.every(addr => pool.tokens.some(pt => pt.address === addr));
    
    // Protocol filter: pool must match one of the selected protocols
    const protocolMatch = selectedProtocols.length > 0 &&
      selectedProtocols.includes(pool.protocol_system);
    
    // Both conditions must be true
    return tokenMatch && protocolMatch;
  });
};