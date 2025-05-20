// src/components/dexscan/graph/hooks/useGraphData.ts
import { useMemo, useState, useEffect } from 'react';
import { usePoolData } from '../../context/PoolDataContext';
import { protocolColors } from '../protocolColors'; // Import color definitions
import { getCoinId, getCoinImageURL } from '../../../../lib/coingecko';

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
    estimatedBlockDuration,
  } = usePoolData();

  // State to store fetched image URLs: Map<tokenId, imageUrl | null>
  const [tokenImageUrls, setTokenImageUrls] = useState<Map<string, string | null>>(new Map());

  // Effect to fetch token images when selectedTokens or pools change
  useEffect(() => {
    // Create a unique set of token IDs that are currently selected and present in pools
    const relevantTokenIds = new Set<string>();
    if (selectedTokens.length > 0) {
      Object.values(pools).forEach(pool => {
        pool.tokens.forEach(token => {
          if (selectedTokens.includes(token.address)) {
            relevantTokenIds.add(token.address);
          }
        });
      });
    }

    // Use a for...of loop to handle async operations sequentially with delays
    const processTokenIds = async () => {
      for (const tokenId of relevantTokenIds) {
        // Fetch only if not already fetched or being fetched
        if (tokenImageUrls.has(tokenId) && tokenImageUrls.get(tokenId) !== undefined) {
          continue; // Already processed or successfully fetched
        }
        if (tokenImageUrls.get(tokenId) === undefined && tokenImageUrls.has(tokenId)) {
            // Already fetching, skip
            continue;
        }


        // Placeholder to prevent re-fetching while in progress
        setTokenImageUrls(prev => new Map(prev).set(tokenId, undefined)); // 'undefined' means "fetching"
        
        // Introduce a delay before this token's fetch sequence
        // Commenting out for now as /coins/list is the main issue, can be re-enabled if needed for individual image calls
        // await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay

        // Find the symbol for this tokenId (needed for getCoinId if it expects symbol)
        // This assumes token symbols are relatively stable for a given address in `pools`
        let tokenSymbol: string | undefined;
        for (const pool of Object.values(pools)) {
          const foundToken = pool.tokens.find(t => t.address === tokenId);
          if (foundToken) {
            tokenSymbol = foundToken.symbol;
            break;
          }
        }

        if (tokenSymbol) {
          const coingeckoId = await getCoinId(tokenSymbol); // This is the call to /coins/list (potentially cached)
          if (coingeckoId) {
            // Add a small delay before fetching the actual image to not burst CoinGecko for images
            await new Promise(resolve => setTimeout(resolve, 250)); // 250ms delay before image URL fetch
            const imageUrl = await getCoinImageURL(coingeckoId);
            setTokenImageUrls(prev => new Map(prev).set(tokenId, imageUrl));
          } else {
            setTokenImageUrls(prev => new Map(prev).set(tokenId, null)); // Not found on CoinGecko
          }
        } else {
          setTokenImageUrls(prev => new Map(prev).set(tokenId, null)); // Symbol not found in pools
        }
      }
    };

    if (relevantTokenIds.size > 0) {
      processTokenIds();
    }

  }, [pools, selectedTokens]); // Rerun when pools or selectedTokens change


  return useMemo(() => {
    // console.log("DEBUG: useGraphData running memoization", { selectedTokens, selectedProtocols, currentBlockNumber, tokenImageUrls });

    // Early Exit: If no tokens are selected, return empty graph structure.
    if (selectedTokens.length === 0) {
      // console.log("DEBUG: No tokens selected, returning empty graph data.");
      return {
        nodes: [],
        edges: [],
        rawPoolsData: pools, // Expose the raw pools data
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
    const allTokenNodesInitial = Array.from(tokenMap.values());

    // 2. Filter tokenNodes based on selectedTokens and add image data
    const finalNodes = allTokenNodesInitial
      .filter(node => selectedTokens.includes(node.id))
      .map(node => {
        const imageUrl = tokenImageUrls.get(node.id);
        
        // If imageUrl is a valid string, use circularImage
        if (typeof imageUrl === 'string' && imageUrl) {
          return {
            ...node, // Spread existing node properties (like id, symbol, address, formattedLabel)
            shape: 'circularImage',
            image: imageUrl,
            label: node.symbol, // The text symbol will be the label
            size: 24, // Explicitly set size to ensure consistency
            font: { size: 16 }, // Explicitly set font size
          };
        } else { 
          // Fallback for when imageUrl is null (fetch failed/no image) or undefined (still fetching)
          return {
            ...node,
            shape: 'circle', // Default shape
            label: node.symbol, // Text label
            size: 24, // Explicitly set size
            font: { size: 16 }, // Explicitly set font size
          };
        }
      });

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
      const isProtocolSelected = selectedProtocols.some(sp => sp.toLowerCase() === currentPoolEdge.protocol.toLowerCase());

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
      rawPoolsData: pools, // Expose the raw pools data
      currentBlockNumber,
      lastBlockTimestamp,
      estimatedBlockDuration
    };
  }, [pools, selectedTokens, selectedProtocols, currentBlockNumber, lastBlockTimestamp, estimatedBlockDuration, tokenImageUrls]);
}
