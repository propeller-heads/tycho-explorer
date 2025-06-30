/**
 * DisplayPipeline - Display tooltips based on selection
 * Pure component with no state
 */

import React from 'react';
import { NodeTooltip } from '@/components/dexscan/graph/tooltips/NodeTooltip';
import { EdgeTooltip } from '@/components/dexscan/graph/tooltips/EdgeTooltip';
import { getNodeData, getConnectionData, getPoolData } from '@/components/dexscan/graph/utils/tooltipHelpers';

// Display tooltip based on current selection
export function DisplayTooltip({ selection, graphData, chain }) {
  if (!selection) return null;
  
  // Tooltip container style
  const containerStyle = {
    position: 'fixed',
    left: `${selection.position.x}px`,
    top: `${selection.position.y - 20}px`,
    zIndex: 9999,
    pointerEvents: 'none'
  };
  
  // Node tooltip
  if (selection.type === 'node') {
    const nodeData = getNodeData(selection.id, graphData.pools);
    const connectionData = getConnectionData(selection.id, graphData.edges);
    
    return (
      <div style={containerStyle}>
        <NodeTooltip
          nodeData={nodeData}
          connectionData={connectionData}
          selectedChain={chain}
        />
      </div>
    );
  }
  
  // Edge tooltip
  if (selection.type === 'edge') {
    const pool = getPoolData(selection.id, graphData.pools);
    
    if (!pool) return null;
    
    return (
      <div style={containerStyle}>
        <EdgeTooltip
          pool={pool}
          selectedChain={chain}
        />
      </div>
    );
  }
  
  return null;
}