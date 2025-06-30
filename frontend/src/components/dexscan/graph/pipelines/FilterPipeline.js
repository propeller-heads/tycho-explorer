/**
 * FilterPipeline - Filter pools by selected tokens and protocols
 * Pure function with no state
 */

export function filterPools(pools, selectedTokens, selectedProtocols) {
  // No tokens selected = no pools to show
  if (selectedTokens.length === 0) return [];
  
  // Convert to object for O(1) lookup
  const poolsArray = Object.values(pools);
  
  // Filter pools that are subset of selectedTokens
  return poolsArray.filter(pool => {
    const hasSelectedToken = pool.tokens.every(token => 
      selectedTokens.includes(token.address)
    );
    
    // Check if pool protocol is selected
    const hasSelectedProtocol = selectedProtocols.length === 0 || 
      selectedProtocols.includes(pool.protocol_system);
    
    return hasSelectedToken && hasSelectedProtocol;
  });
}