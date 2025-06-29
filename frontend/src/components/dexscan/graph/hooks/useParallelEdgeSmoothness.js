import { useMemo } from 'react';

// Apply smoothness for parallel edges (fanning effect)
export function useParallelEdgeSmoothness(edges) {
  return useMemo(() => {
    const edgesByPair = new Map();
    
    // Group edges by node pair
    edges.forEach(edge => {
      const pairKey = [edge.from, edge.to].sort().join('-');
      if (!edgesByPair.has(pairKey)) {
        edgesByPair.set(pairKey, []);
      }
      edgesByPair.get(pairKey).push(edge);
    });
    
    const processedEdges = [];
    edgesByPair.forEach(pairGroup => {
      if (pairGroup.length <= 1) {
        // Single edge - nearly straight
        pairGroup.forEach(edge => processedEdges.push({
          ...edge,
          smooth: { enabled: true, type: 'continuous', roundness: 0.05 }
        }));
      } else {
        // Multiple parallel edges - apply fanning
        pairGroup.sort((a, b) => a.id.localeCompare(b.id));
        pairGroup.forEach((edge, index) => processedEdges.push({
          ...edge,
          smooth: {
            enabled: true,
            type: index % 2 === 0 ? 'curvedCW' : 'curvedCCW',
            roundness: Math.min(0.8, 0.05 + Math.floor(index / 2) * 0.15)
          }
        }));
      }
    });
    
    return processedEdges;
  }, [edges]);
}