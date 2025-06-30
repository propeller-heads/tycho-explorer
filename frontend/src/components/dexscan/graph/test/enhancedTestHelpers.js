import { testPools } from '@/components/dexscan/graph/test/testPoolData';
import { mockPools } from '@/components/dexscan/graph/test/mockPoolData';

// Get node data for tooltip
export const getNodeData = (nodeId) => {
  // Try testPools first, then fall back to mockPools
  const pools = { ...testPools, ...mockPools };
  let poolCount = 0;
  Object.values(pools).forEach(pool => {
    if (pool.tokens.some(token => token.address === nodeId)) {
      poolCount++;
    }
  });
  return { poolCount, address: nodeId };
};

// Get connection data for node tooltip
export const getConnectionData = (nodeId, edges) => {
  const connections = edges.filter(e => e.from === nodeId || e.to === nodeId);
  const byProtocol = {};
  const pools = { ...testPools, ...mockPools };
  
  connections.forEach(edge => {
    // Extract pool ID from edge ID (format: poolId-i-j)
    const poolId = edge.poolId || edge.id.split('-')[0];
    const pool = pools[poolId];
    if (pool) {
      const protocol = edge.protocol || pool.protocol_system;
      byProtocol[protocol] = (byProtocol[protocol] || 0) + 1;
    }
  });
  
  return {
    totalConnections: connections.length,
    connectionsByProtocol: byProtocol
  };
};

// Get pool data for edge tooltip
export const getPoolData = (edgeId) => {
  const pools = { ...testPools, ...mockPools };
  // Extract pool ID from edge ID (format: poolId-i-j)
  const poolId = edgeId.split('-')[0];
  const pool = pools[poolId];
  
  if (pool) {
    console.log(`Found pool for edge ${edgeId}`);
  } else {
    console.log(`No pool found for edge ${edgeId}, poolId: ${poolId}`);
  }
  
  return pool || null;
};