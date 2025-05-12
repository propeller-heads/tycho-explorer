// src/components/dexscan/graph/hooks/useGraphData.ts
import { useMemo, useRef } from 'react';
import { usePoolData } from '../../context/PoolDataContext';

// Compare objects by JSON stringifying them (deep equality)
const deepEqual = (a: any, b: any) => {
  if (a === b) return true;
  return JSON.stringify(a) === JSON.stringify(b);
};

export function useGraphData() {
  const { pools, blockNumber, lastBlockTimestamp, estimatedBlockDuration } = usePoolData(); // Added new values
  const prevPoolsRef = useRef<any>(null);
  // Update the type of prevResultRef to include the new fields
  const prevResultRef = useRef<{
    tokenNodes: any[], 
    poolEdges: any[], 
    currentBlockNumber: number,
    lastBlockTimestamp: number | null,
    estimatedBlockDuration: number
  } | null>(null);
  const runCountRef = useRef(0);
  
  // The main data (nodes, edges) depends on `pools`.
  // Other values (blockNumber, timestamps) are passed through but also trigger re-memoization if they change.
  return useMemo(() => {
    runCountRef.current++;
    console.log("DEBUG: useGraphData running memoization", `#${runCountRef.current}`, new Date().toISOString());
    
    // Deep compare the pools to see if they've actually changed structurally
    const poolsEqual = deepEqual(pools, prevPoolsRef.current);
    console.log("DEBUG: Pools structurally equal to previous?", poolsEqual);
    
    // If pools haven't changed, and other pass-through values are the same, return cached result.
    // This caching logic might need refinement if blockNumber/timestamps change frequently without pool changes
    // but for now, any change in dependencies will recompute.
    // const poolsEqual = deepEqual(pools, prevPoolsRef.current);
    // if (poolsEqual && prevResultRef.current && 
    //     prevResultRef.current.currentBlockNumber === blockNumber &&
    //     prevResultRef.current.lastBlockTimestamp === lastBlockTimestamp &&
    //     prevResultRef.current.estimatedBlockDuration === estimatedBlockDuration
    // ) {
    //   console.log("DEBUG: Data unchanged, returning previous result from useGraphData");
    //   return prevResultRef.current;
    // }
    // Simpler: always recompute if dependencies change, rely on downstream memoization if needed.
    // The main cost is nodes/edges generation, which is tied to `pools`.

    // prevPoolsRef.current = pools; // Store for deep equality check if re-enabled
    
    console.log("DEBUG: Generating new graph data in useGraphData");
    const tokenMap = new Map();
    const poolEdges = [];
    
    // Extract unique tokens from pools
    Object.values(pools).forEach(pool => {
      pool.tokens.forEach(token => {
        if (!tokenMap.has(token.address)) {
          // Format token label with address bytes
          const address = token.address || '';
          const tokenName = token.symbol;
          
          // Get first and last byte if address is available
          const firstByte = address ? address.slice(2, 4) : '';
          const lastByte = address ? address.slice(-2) : '';
          
          // Format like in ListView: TokenName (0xab..cd)
          const formattedLabel = `${tokenName}${firstByte && lastByte ? ` (0x${firstByte}..${lastByte})` : ''}`;
            
          tokenMap.set(token.address, {
            id: token.address,
            // Use just the token symbol for graph nodes (to be modified in GraphView.tsx)
            label: token.symbol,
            symbol: token.symbol, // Keep original symbol separately
            formattedLabel: formattedLabel, // Store formatted label for reference
            address: token.address // Keep raw address for reference
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
          spotPrice: pool.spotPrice,
          lastUpdatedAtBlock: pool.lastUpdatedAtBlock || 0
        });
      }
    });

    const tokenNodes = Array.from(tokenMap.values());
    
    const result = {
      tokenNodes,
      poolEdges,
      currentBlockNumber: blockNumber,
      lastBlockTimestamp: lastBlockTimestamp, // Added
      estimatedBlockDuration: estimatedBlockDuration // Added
    };
    
    // prevResultRef.current = result; // Store for deep equality check if re-enabled
    
    return result;
  }, [pools, blockNumber, lastBlockTimestamp, estimatedBlockDuration]); // Add new dependencies
}
