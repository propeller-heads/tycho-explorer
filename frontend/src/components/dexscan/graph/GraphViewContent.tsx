// src/components/dexscan/PoolGraphView.tsx
import React from 'react';
import GraphView from './GraphView';
import { useGraphData } from './hooks/useGraphData';
import { protocolColorMap } from './protocolColors';

const PoolGraphView: React.FC = () => {
  const { tokenNodes, poolEdges } = useGraphData();
  
  return (
    <GraphView
      tokenNodes={tokenNodes}
      poolEdges={poolEdges}
      protocolColorMap={protocolColorMap}
    />
  );
};

export default PoolGraphView;