import { useMemo } from 'react';
import { protocolColors } from '@/components/dexscan/graph/protocolColors';

// Generate edges from filtered pools with protocol styling
export function useEdgeGeneration(filteredPools, selectedProtocols, currentBlockNumber) {
  return useMemo(() => {
    const edges = [];
    
    filteredPools.forEach(pool => {
      if (pool.tokens.length < 2) return;
      
      for (let i = 0; i < pool.tokens.length; i++) {
        for (let j = i + 1; j < pool.tokens.length; j++) {
          const protocol = pool.protocol_system;
          const isProtocolSelected = selectedProtocols.some(
            sp => sp.toLowerCase() === protocol.toLowerCase()
          );
          const isCurrentBlock = pool.lastUpdatedAtBlock === currentBlockNumber && currentBlockNumber > 0;
          
          edges.push({
            id: `${pool.id}-${i}-${j}`,
            from: pool.tokens[i].address,
            to: pool.tokens[j].address,
            protocol,
            lastUpdatedAtBlock: pool.lastUpdatedAtBlock || 0,
            poolId: pool.id,
            color: isProtocolSelected 
              ? (protocolColors[protocol.toLowerCase()] || '#CCCCCC')
              : '#848484',
            width: isProtocolSelected && isCurrentBlock ? 10 : 1
          });
        }
      }
    });
    
    return edges;
  }, [filteredPools, selectedProtocols, currentBlockNumber]);
}