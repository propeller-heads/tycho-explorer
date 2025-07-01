import { mockPools, edgePoolMap } from '@/components/dexscan/graph/test/mockPoolData';

// Get node data for tooltip
export const getNodeData = (nodeId) => {
  let poolCount = 0;
  Object.values(mockPools).forEach(pool => {
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
  
  connections.forEach(edge => {
    const poolId = edgePoolMap[edge.id];
    const pool = mockPools[poolId];
    if (pool) {
      byProtocol[pool.protocol_system] = (byProtocol[pool.protocol_system] || 0) + 1;
    }
  });
  
  return {
    totalConnections: connections.length,
    connectionsByProtocol: byProtocol
  };
};

// Get pool data for edge tooltip
export const getPoolData = (edgeId) => {
  const poolId = edgePoolMap[edgeId];
  return mockPools[poolId] || null;
};