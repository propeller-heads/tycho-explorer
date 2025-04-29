// src/components/dexscan/hooks/useGraphData.ts
import { useMemo } from 'react';
import { usePoolData } from '../../context/PoolDataContext';

export function useGraphData() {
  const { pools } = usePoolData();
  
  return useMemo(() => {
    const tokenMap = new Map();
    const poolEdges = [];
    
    // Extract unique tokens from pools
    Object.values(pools).forEach(pool => {
      pool.tokens.forEach(token => {
        if (!tokenMap.has(token.address)) {
          tokenMap.set(token.address, {
            id: token.address,
            label: token.symbol,
          });
        }
      });
      
      // Create pool edge
      if (pool.tokens.length >= 2) {
        poolEdges.push({
          id: pool.id,
          from: pool.tokens[0].address,
          to: pool.tokens[1].address,
          width: 3, // Could be based on volume or liquidity
          protocol: pool.protocol_system,
          spotPrice: pool.spotPrice
        });
      }
    });

    const tokenNodes = Array.from(tokenMap.values());

    console.log("Transformed data:", {
      nodes: tokenNodes,
      edges: poolEdges,
      poolsCount: Object.keys(pools).length
    });
    
    return {
      tokenNodes,
      poolEdges
    };
  }, [pools]);
}