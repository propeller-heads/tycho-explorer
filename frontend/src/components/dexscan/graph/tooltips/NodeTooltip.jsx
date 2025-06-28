import React, { useState } from 'react';
import { NodeInfo, AddressInfo } from '@/components/dexscan/graph/tooltips/NodeTooltipParts';
import { ProtocolConnections } from '@/components/dexscan/graph/tooltips/ProtocolConnections';
import { tooltipClasses } from '@/components/dexscan/graph/tooltips/NodeTooltipStyles';

/**
 * Tooltip component for graph nodes
 */
export const NodeTooltip = ({ 
  nodeData, 
  connectionData, 
  selectedChain,
  style = {} 
}) => {
  const [copyText, setCopyText] = useState('Copy');
  
  const handleCopy = async (e) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(nodeData.address);
    setCopyText('Copied!');
    setTimeout(() => setCopyText('Copy'), 1500);
  };

  const sortedProtocols = Object.entries(connectionData.connectionsByProtocol || {})
    .sort(([, a], [, b]) => b - a);

  return (
    <div className={tooltipClasses} style={style}>
      <NodeInfo label="Pools" value={nodeData.poolCount} />
      <AddressInfo 
        address={nodeData.address} 
        chain={selectedChain}
        onCopy={handleCopy}
        copyText={copyText}
      />
      <NodeInfo label="Connections in view" value={connectionData.totalConnections} />
      <ProtocolConnections protocols={sortedProtocols} total={connectionData.totalConnections} />
    </div>
  );
};