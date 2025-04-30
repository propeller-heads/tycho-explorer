// src/components/dexscan/graph/GraphViewContent.tsx
import React, { useState, useMemo } from 'react';
import GraphView from './GraphView';
import { useGraphData } from './hooks/useGraphData';
import { protocolColorMap } from './protocolColors';
import { GraphControls } from './GraphControls';

const PoolGraphView: React.FC = () => {
  const { tokenNodes, poolEdges } = useGraphData();
  
  // State for filtering with multi-select
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [selectedProtocols, setSelectedProtocols] = useState<string[]>([]);
  const [shouldRender, setShouldRender] = useState(false);
  
  // Extract unique protocols from pool edges
  const uniqueProtocols = useMemo(() => {
    const protocols = new Set<string>();
    poolEdges.forEach(edge => {
      protocols.add(edge.protocol);
    });
    return Array.from(protocols);
  }, [poolEdges]);
  
  // Filter nodes and edges based on selections
  const filteredData = useMemo(() => {
    if (!shouldRender) {
      return { nodes: [], edges: [] };
    }
    
    if (selectedTokens.length === 0 && selectedProtocols.length === 0) {
      return { nodes: [], edges: [] };
    }
    
    let filteredEdges = [...poolEdges];
    let relevantNodeIds = new Set<string>();
    
    // Filter by protocols if any are selected
    if (selectedProtocols.length > 0) {
      filteredEdges = filteredEdges.filter(edge => 
        selectedProtocols.includes(edge.protocol)
      );
    }
    
    // Filter by tokens if any are selected
    if (selectedTokens.length > 0) {
      filteredEdges = filteredEdges.filter(edge => 
        selectedTokens.includes(edge.from) || selectedTokens.includes(edge.to)
      );
      
      // Add selected tokens to the relevant nodes
      selectedTokens.forEach(tokenId => {
        relevantNodeIds.add(tokenId);
      });
    }
    
    // Collect all relevant node IDs from remaining edges
    filteredEdges.forEach(edge => {
      relevantNodeIds.add(edge.from);
      relevantNodeIds.add(edge.to);
    });
    
    // Filter nodes to only those that are used in edges
    const filteredNodes = tokenNodes.filter(node => relevantNodeIds.has(node.id));
    
    return {
      nodes: filteredNodes,
      edges: filteredEdges
    };
  }, [tokenNodes, poolEdges, selectedTokens, selectedProtocols, shouldRender]);
  
  // Handle reset
  const handleReset = () => {
    setSelectedTokens([]);
    setSelectedProtocols([]);
    setShouldRender(false);
  };
  
  // Handle render
  const handleRender = () => {
    if (selectedTokens.length > 0 || selectedProtocols.length > 0) {
      setShouldRender(true);
    }
  };
  
  // Statistics for rendered graph
  const graphStats = useMemo(() => {
    if (!shouldRender) return null;
    
    return {
      nodeCount: filteredData.nodes.length,
      edgeCount: filteredData.edges.length,
      tokenCount: selectedTokens.length,
      protocolCount: selectedProtocols.length
    };
  }, [filteredData, selectedTokens, selectedProtocols, shouldRender]);
  
  return (
    <div className="flex flex-col h-full">
      <GraphControls 
        tokenList={tokenNodes}
        protocols={uniqueProtocols}
        selectedTokens={selectedTokens}
        selectedProtocols={selectedProtocols}
        onSelectTokens={setSelectedTokens}
        onSelectProtocols={setSelectedProtocols}
        onRender={handleRender}
        onReset={handleReset}
      />
      
      {shouldRender ? (
        <>
          {graphStats && (
            <div className="flex gap-4 mb-2 text-xs text-muted-foreground">
              <span>Displaying {graphStats.nodeCount} tokens and {graphStats.edgeCount} connections</span>
            </div>
          )}
          <GraphView
            tokenNodes={filteredData.nodes}
            poolEdges={filteredData.edges}
            protocolColorMap={protocolColorMap}
          />
        </>
      ) : (
        <div className="flex items-center justify-center h-[600px] border rounded-md bg-muted/20">
          <p className="text-muted-foreground text-center">
            Select tokens and/or protocols, then click "Render Graph" to visualize connections
          </p>
        </div>
      )}
    </div>
  );
};

export default PoolGraphView;