/**
 * GraphPipeline - Main orchestrator for the graph visualization
 * Minimal state: only what React requires
 */

import React, { useRef, useMemo } from 'react';
import { filterPools } from '@/components/dexscan/graph/pipelines/FilterPipeline';
import { transformToGraph } from '@/components/dexscan/graph/pipelines/TransformPipeline';
import { useEnrichedGraph } from '@/components/dexscan/graph/pipelines/EnrichPipeline';
import { useNetwork } from '@/components/dexscan/graph/pipelines/RenderPipeline';
import { useInteractions } from '@/components/dexscan/graph/pipelines/InteractPipeline';
import { DisplayTooltip } from '@/components/dexscan/graph/pipelines/DisplayPipeline';

export function GraphPipeline({ 
  pools, 
  selectedTokens, 
  selectedProtocols, 
  selectedChain,
  currentBlockNumber 
}) {
  const containerRef = useRef();
  
  // Memoize pure transformations to prevent unnecessary recalculations
  const filtered = useMemo(
    () => filterPools(pools, selectedTokens, selectedProtocols),
    [pools, selectedTokens, selectedProtocols]
  );

  console.warn(`filtered: ${JSON.stringify(filtered.length)}`);
  
  const graph = useMemo(
    () => transformToGraph(filtered, currentBlockNumber, selectedProtocols),
    [filtered, currentBlockNumber, selectedProtocols]
  );
  
  // EnrichPipeline already uses hooks internally, so it handles its own memoization
  const enriched = useEnrichedGraph(graph, filtered);

  // Stateful rendering (minimal necessary state)
  const { network, isReady } = useNetwork(containerRef.current, enriched);
  const selection = useInteractions(network);
  
  // Memoize pools object for tooltip data
  const poolsObject = useMemo(() => {
    const obj = {};
    filtered.forEach(pool => {
      obj[pool.id] = pool;
    });
    return obj;
  }, [filtered]);
  
  return (
    <>
      <div ref={containerRef} className="h-full w-full" />
      <DisplayTooltip
        selection={selection}
        graphData={{ 
          pools: poolsObject,
          edges: enriched.edges 
        }}
        chain={selectedChain}
      />
    </>
  );
}