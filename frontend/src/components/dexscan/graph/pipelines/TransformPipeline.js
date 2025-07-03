/**
 * TransformPipeline - Transform filtered pools into graph nodes and edges
 * Pure transformation with no state
 */

// Extract unique tokens as nodes
function extractNodes(filteredPools) {
  const tokenMap = new Map();
  
  filteredPools.forEach(pool => {
    pool.tokens.forEach(token => {
      if (!tokenMap.has(token.address)) {
        tokenMap.set(token.address, {
          id: token.address,
          label: token.symbol,
          symbol: token.symbol,
          poolCount: 0
        });
      }
      // Increment pool count
      tokenMap.get(token.address).poolCount++;
    });
  });
  
  return Array.from(tokenMap.values());
}

// Transform pools to graph structure
export function transformToGraph(filteredPools, currentBlockNumber, selectedProtocols) {
  const nodes = extractNodes(filteredPools);
  
  // Create edges from pools
  const edges = filteredPools.map(pool => {
    const protocol = pool.protocol_system;
    const isProtocolSelected = selectedProtocols.some(
      sp => sp.toLowerCase() === protocol.toLowerCase()
    );
    return {
      id: pool.id,
      from: pool.tokens[0].address,
      to: pool.tokens[1].address,
      protocol: protocol,
      poolId: pool.id,
      lastUpdatedAtBlock: pool.lastUpdatedAtBlock || 0,
      isProtocolSelected: isProtocolSelected,
      // Visual properties
      smooth: { 
        enabled: true, 
        type: 'curvedCW' 
      },
      width: pool.lastUpdatedAtBlock === currentBlockNumber && currentBlockNumber > 0 ? 10 : 1,
      // Determine if pool is old (for visual styling)
      dashes: pool.createdAtBlock && currentBlockNumber
        ? currentBlockNumber - pool.createdAtBlock > 1000000
        : false
    };
  });
  
  return { nodes, edges };
}