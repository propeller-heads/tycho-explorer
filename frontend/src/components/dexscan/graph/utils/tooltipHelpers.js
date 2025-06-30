/**
 * Helper functions for tooltip data extraction
 */

// Get node data for tooltip
export function getNodeData(nodeId, rawPoolsData) {
  if (!rawPoolsData) return { poolCount: 0, address: nodeId };
  
  let poolCount = 0;
  for (const poolId in rawPoolsData) {
    const pool = rawPoolsData[poolId];
    if (pool.tokens.some(token => token.address === nodeId)) {
      poolCount++;
    }
  }
  
  return { poolCount, address: nodeId };
}

// Get connection data for node tooltip
export function getConnectionData(nodeId, edges) {
  const connectedEdges = edges.filter(edge => 
    edge.from === nodeId || edge.to === nodeId
  );
  
  // Count connections by protocol
  const connectionsByProtocol = {};
  connectedEdges.forEach(edge => {
    const protocol = edge.protocol || 'unknown';
    connectionsByProtocol[protocol] = (connectionsByProtocol[protocol] || 0) + 1;
  });
  
  return {
    totalConnections: connectedEdges.length,
    connectionsByProtocol
  };
}

// Get pool data for edge tooltip
export function getPoolData(edgeId, rawPoolsData) {
  // Edge ID is the pool ID in our case
  return rawPoolsData[edgeId] || null;
}