import { useMemo } from 'react';
import { usePoolData } from '@/components/dexscan/context/PoolDataContext';
import { usePoolFiltering } from '@/components/dexscan/graph/hooks/usePoolFiltering';
import { useNodeGeneration } from '@/components/dexscan/graph/hooks/useNodeGeneration';
import { useEdgeGeneration } from '@/components/dexscan/graph/hooks/useEdgeGeneration';
import { useParallelEdgeSmoothness } from '@/components/dexscan/graph/hooks/useParallelEdgeSmoothness';
import { useTokenLogos } from '@/components/dexscan/graph/hooks/useTokenLogos';

// Orchestrate graph data generation using smaller focused hooks
export function useGraphData(selectedTokens, selectedProtocols) {
  const {
    pools,
    blockNumber: currentBlockNumber,
    lastBlockTimestamp,
    estimatedBlockDuration,
  } = usePoolData();

  // 1. Filter pools based on selections
  const filteredPools = usePoolFiltering(pools, selectedTokens, selectedProtocols);
  
  // 2. Fetch missing logos from API
  const apiLogos = useTokenLogos(filteredPools);
  
  // 3. Generate nodes from filtered pools
  const nodes = useNodeGeneration(filteredPools, apiLogos);
  
  // 4. Generate edges with protocol styling
  const edges = useEdgeGeneration(filteredPools, selectedProtocols, currentBlockNumber);
  
  // 5. Apply parallel edge smoothness
  const smoothEdges = useParallelEdgeSmoothness(edges);

  return useMemo(() => ({
    nodes,
    edges: smoothEdges,
    rawPoolsData: pools,
    currentBlockNumber,
    lastBlockTimestamp,
    estimatedBlockDuration
  }), [nodes, smoothEdges, pools, currentBlockNumber, lastBlockTimestamp, estimatedBlockDuration]);
}