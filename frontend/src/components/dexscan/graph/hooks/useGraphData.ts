// src/components/dexscan/graph/hooks/useGraphData.ts
import { useMemo } from 'react';
import { usePoolData } from '../../context/PoolDataContext';
import { protocolColors } from '../protocolColors'; // Import color definitions

// // Compare objects by JSON stringifying them (deep equality) - No longer needed with refined memo dependencies
// const deepEqual = (a: any, b: any) => {
//   if (a === b) return true;
//   return JSON.stringify(a) === JSON.stringify(b);
// };

// Interface for Vis.js edges, including the optional smooth property
interface VisEdge {
  id: string;
  from: string;
  to: string;
  protocol: string;
  lastUpdatedAtBlock: number;
  color: string;
  width: number;
  smooth?: {
    enabled: boolean;
    type: string;
    roundness: number;
  };
  // Add any other custom properties your edges might have
}

/**
 * Processes an array of Vis.js edges to apply specific smoothness options
 * for fanning out parallel edges (multiple edges connecting the same two nodes).
 * Single edges between a pair of nodes are given a default, nearly straight curve.
 * Parallel edges are assigned alternating 'curvedCW' (clockwise) and 'curvedCCW'
 * (counter-clockwise) types with incrementally increasing roundness to create a
 * visual fanning effect, making all edges visible.
 *
 * @param edges - An array of VisEdge objects that have been filtered and styled
 *                but do not yet have specific smoothness for parallel fanning.
 * @returns A new array of VisEdge objects with appropriate `smooth` properties applied,
 *          especially for fanning out parallel edges.
 */
function applyParallelEdgeSmoothness(edges: VisEdge[]): VisEdge[] {
  const edgesByPair = new Map<string, VisEdge[]>();

  // Group edges by the pair of nodes they connect
  edges.forEach(edge => {
    const pairKey = [edge.from, edge.to].sort().join('-');
    if (!edgesByPair.has(pairKey)) {
      edgesByPair.set(pairKey, []);
    }
    edgesByPair.get(pairKey)!.push(edge);
  });

  const processedEdges: VisEdge[] = [];
  edgesByPair.forEach(pairGroup => {
    const numEdgesInGroup = pairGroup.length;

    if (numEdgesInGroup <= 1) {
      // Single edge, add it with default (or slightly curved) smoothness
      pairGroup.forEach(edge => {
        processedEdges.push({
          ...edge,
          smooth: {
            enabled: true,
            type: 'continuous', 
            roundness: 0.05 // Nearly straight, allows global options to potentially override if more specific
          }
        });
      });
    } else {
      // Multiple (parallel) edges, apply fanning logic
      // Sort by a consistent criteria (e.g., edge.id) for stable CW/CCW assignment
      pairGroup.sort((a, b) => a.id.localeCompare(b.id));

      const baseRoundness = 0.05; // Initial roundness for the first curve pair
      const roundnessIncrement = 0.15; // How much to increase for subsequent curve pairs
      const maxRoundness = 0.80; // Maximum roundness to prevent overly wide fans

      pairGroup.forEach((edge, index) => {
        const type = (index % 2 === 0) ? 'curvedCW' : 'curvedCCW';
        const roundnessTier = Math.floor(index / 2);
        const currentRoundness = Math.min(maxRoundness, baseRoundness + (roundnessTier * roundnessIncrement));

        processedEdges.push({
          ...edge,
          smooth: {
            enabled: true,
            type: type,
            roundness: currentRoundness
          }
        });
      });
    }
  });

  return processedEdges;
}


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
    const tempFinalEdges: VisEdge[] = []; // Changed to VisEdge[] and temp name
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
      const updatedEdgeWidth = 10; 
      let determinedWidth;
      
      if (isProtocolSelected) {
        const colorKey = currentPoolEdge.protocol.toLowerCase(); // Ensure consistency with keys in protocolColors
        determinedColor = protocolColors[colorKey] || '#CCCCCC'; // Protocol color, fallback to light gray
        determinedWidth = isUpdatedInCurrentBlock ? updatedEdgeWidth : defaultEdgeWidth;
      } else {
        // Protocol is NOT selected, but the edge connects selected tokens
        determinedColor = '#848484'; // Standard gray for non-selected protocols
        determinedWidth = defaultEdgeWidth; // Always default width if protocol not selected
      }

      tempFinalEdges.push({ // Push to tempFinalEdges
        ...currentPoolEdge,
        color: determinedColor,
        width: determinedWidth,
      });
    }

    // Apply smoothness for parallel edges
    const finalEdgesWithSmoothness = applyParallelEdgeSmoothness(tempFinalEdges);
    
    return {
      nodes: finalNodes,
      edges: finalEdgesWithSmoothness, // Use the processed edges
      currentBlockNumber,
      lastBlockTimestamp,
      estimatedBlockDuration
    };
  }, [pools, selectedTokens, selectedProtocols, currentBlockNumber, lastBlockTimestamp, estimatedBlockDuration]);
}
