/**
 * EnrichPipeline - Add visual properties and logos to graph
 * Minimal state: only logo cache via useTokenLogos
 */

import { useMemo } from 'react';
import { useTokenLogos } from '@/components/dexscan/graph/hooks/useTokenLogos';
import { getTokenLogoUrlSync } from '@/components/dexscan/shared/hooks/useTokenLogo';
import { protocolColors } from '@/components/dexscan/graph/config/protocolColors';
import { useParallelEdgeSmoothness } from '@/components/dexscan/graph/hooks/useParallelEdgeSmoothness';

// Default gray circle SVG for nodes without logos
const DEFAULT_NODE_IMAGE = 'data:image/svg+xml;base64,' + btoa(
  '<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">' +
  '<circle cx="16" cy="16" r="16" fill="#D3D3D3"/></svg>'
);

// Enrich graph with visual properties
export function useEnrichedGraph(graph, filteredPools) {
  // Fetch missing logos (minimal state)
  const apiLogos = useTokenLogos(filteredPools);
  
  // Apply parallel edge smoothness
  const smoothedEdges = useParallelEdgeSmoothness(graph.edges);
  
  return useMemo(() => {
    // Apply logos to nodes
    const enrichedNodes = graph.nodes.map(node => ({
      ...node,
      shape: 'circularImage',
      image: apiLogos[node.id] || getTokenLogoUrlSync(node.symbol) || DEFAULT_NODE_IMAGE,
      brokenImage: DEFAULT_NODE_IMAGE,
      size: 32,
      font: { size: 16 }
    }));
    
    // Apply protocol colors to edges
    const enrichedEdges = smoothedEdges.map(edge => {
      const protocol = edge.protocol || 'unknown';
      // Use protocol color if selected, gray if not
      const color = edge.isProtocolSelected
        ? (protocolColors[protocol.toLowerCase()] || '#CCCCCC')
        : '#848484';
      
      return {
        ...edge,
        color: color
        // Width is already set in TransformPipeline based on protocol selection & current block
      };
    });
    
    return { nodes: enrichedNodes, edges: enrichedEdges };
  }, [graph, apiLogos, smoothedEdges]);
}