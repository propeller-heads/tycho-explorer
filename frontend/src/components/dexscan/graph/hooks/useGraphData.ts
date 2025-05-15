// src/components/dexscan/graph/hooks/useGraphData.ts
import { useMemo } from 'react';
import { usePoolData } from '../../context/PoolDataContext';
import { protocolColors } from '../protocolColors'; // Import color definitions

// // Compare objects by JSON stringifying them (deep equality) - No longer needed with refined memo dependencies
// const deepEqual = (a: any, b: any) => {
//   if (a === b) return true;
//   return JSON.stringify(a) === JSON.stringify(b);
// };

export function useGraphData(
  selectedTokens: string[],
  selectedProtocols: string[]
) {
  const { 
    pools, 
    blockNumber: currentBlockNumber, // Renamed for clarity within this hook
    lastBlockTimestamp, 
    estimatedBlockDuration 
  } = usePoolData();
  
  return useMemo(() => {
    // console.log("DEBUG: useGraphData running memoization", { selectedTokens, selectedProtocols, currentBlockNumber });

    // Early Exit: If no tokens are selected, return empty graph structure.
    if (selectedTokens.length === 0) {
      // console.log("DEBUG: No tokens selected, returning empty graph data.");
      return {
        nodes: [],
        edges: [],
        currentBlockNumber,
        lastBlockTimestamp,
        estimatedBlockDuration
      };
    }

    // 1. Generate all base tokenNodes from pools data
    const tokenMap = new Map();
    Object.values(pools).forEach(pool => {
      pool.tokens.forEach(token => {
        if (!tokenMap.has(token.address)) {
          const address = token.address || '';
          const tokenName = token.symbol;
          const firstByte = address ? address.slice(2, 4) : '';
          const lastByte = address ? address.slice(-2) : '';
          const formattedLabel = `${tokenName}${firstByte && lastByte ? ` (0x${firstByte}..${lastByte})` : ''}`;
            
          tokenMap.set(token.address, {
            id: token.address,
            label: token.symbol, // Graph node label
            symbol: token.symbol,
            formattedLabel: formattedLabel,
            address: token.address
          });
        }
      });
    });
    const allTokenNodes = Array.from(tokenMap.values());

    // 2. Filter tokenNodes based on selectedTokens
    const finalNodes = allTokenNodes.filter(node => selectedTokens.includes(node.id));
    const finalNodeIdsSet = new Set(finalNodes.map(node => node.id));

    // 3. Generate, Filter, and Style Edges
    const finalEdges = [];
    for (const pool of Object.values(pools)) {
      if (pool.tokens.length < 2) continue;

      const fromId = pool.tokens[0].address;
      const toId = pool.tokens[1].address;

      // A. Filter by Selected Tokens: Ensure both 'from' and 'to' nodes are in `finalNodeIdsSet`
      if (!finalNodeIdsSet.has(fromId) || !finalNodeIdsSet.has(toId)) {
        continue; 
      }

      const currentPoolEdge = {
        id: pool.id, // Use pool's unique ID for the edge ID
        from: fromId,
        to: toId,
        protocol: pool.protocol_system,
        lastUpdatedAtBlock: pool.lastUpdatedAtBlock || 0,
        // Include other original pool data if needed by vis-network or tooltips later
        // For example: spotPrice: pool.spotPrice 
      };

      // B. Filter by Selected Protocols & Apply Styling
      const isProtocolSelected = selectedProtocols.length === 0 ||
        selectedProtocols.some(sp => sp.toLowerCase() === currentPoolEdge.protocol.toLowerCase());

      const isUpdatedInCurrentBlock =
        currentPoolEdge.lastUpdatedAtBlock === currentBlockNumber && currentBlockNumber > 0;

      let determinedColor;
      const defaultEdgeWidth = 1;
      const updatedEdgeWidth = 15;
      let determinedWidth;
      
      const determinedLabel = undefined; // No label at any time

      if (isProtocolSelected) {
        const colorKey = currentPoolEdge.protocol.toLowerCase(); // Ensure consistency with keys in protocolColors
        determinedColor = protocolColors[colorKey] || '#CCCCCC'; // Protocol color, fallback to light gray
        determinedWidth = isUpdatedInCurrentBlock ? updatedEdgeWidth : defaultEdgeWidth;
      } else {
        // Protocol is NOT selected, but the edge connects selected tokens
        determinedColor = '#848484'; // Standard gray for non-selected protocols
        determinedWidth = defaultEdgeWidth; // Always default width if protocol not selected
      }

      finalEdges.push({
        ...currentPoolEdge,
        color: determinedColor,
        width: determinedWidth,
        label: determinedLabel,
        // Add default vis-network edge properties if not already present or to override
        smooth: { enabled: true, type: 'continuous' }, // Example default
        // arrows: { to: { enabled: true, scaleFactor: 0.7 } } // Example if arrows are desired
      });
    }
    
    // console.log("DEBUG: Generated final graph data", { finalNodes, finalEdges });
    return {
      nodes: finalNodes,
      edges: finalEdges,
      currentBlockNumber,
      lastBlockTimestamp,
      estimatedBlockDuration
    };
  }, [pools, selectedTokens, selectedProtocols, currentBlockNumber, lastBlockTimestamp, estimatedBlockDuration]);
}
