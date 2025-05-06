// src/components/dexscan/hooks/useGraphData.ts
import { useMemo, useRef } from 'react';
import { usePoolData } from '../../context/PoolDataContext';

// Compare objects by JSON stringifying them (deep equality)
const deepEqual = (a: any, b: any) => {
  if (a === b) return true;
  return JSON.stringify(a) === JSON.stringify(b);
};

export function useGraphData() {
  const { pools } = usePoolData();
  const prevPoolsRef = useRef<any>(null);
  const prevResultRef = useRef<{tokenNodes: any[], poolEdges: any[]} | null>(null);
  const runCountRef = useRef(0);
  
  return useMemo(() => {
    runCountRef.current++;
    console.log("DEBUG: useGraphData running memoization", `#${runCountRef.current}`, new Date().toISOString());
    
    // Deep compare the pools to see if they've actually changed structurally
    const poolsEqual = deepEqual(pools, prevPoolsRef.current);
    console.log("DEBUG: Pools structurally equal to previous?", poolsEqual);
    
    // If pools haven't changed, return the previous result to maintain reference equality
    if (poolsEqual && prevResultRef.current) {
      console.log("DEBUG: Pools unchanged, returning previous result");
      return prevResultRef.current;
    }
    
    // Save the current pools for future comparison
    prevPoolsRef.current = pools;
    
    console.log("DEBUG: Generating new graph data");
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
    
    const result = {
      tokenNodes,
      poolEdges
    };
    
    // Save the result for future comparison
    prevResultRef.current = result;
    
    return result;
  }, [pools]);
}