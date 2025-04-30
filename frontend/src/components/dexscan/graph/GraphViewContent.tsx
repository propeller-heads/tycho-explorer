// src/components/dexscan/graph/GraphViewContent.tsx
import React, { useState, useMemo } from 'react';
import GraphView from './GraphView';
import { useGraphData } from './hooks/useGraphData';
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
    
    if (selectedTokens.length === 0) {
      return { nodes: [], edges: [] };
    }
    
    // 1. Only include nodes that are explicitly selected in the token menu
    const filteredNodes = tokenNodes.filter(node => 
      selectedTokens.includes(node.id)
    );
    
    // 2. Filter to pools between selected tokens
    const possibleEdges = poolEdges.filter(edge => 
      selectedTokens.includes(edge.from) && selectedTokens.includes(edge.to)
    );
    
    // 3. Group pools by token pairs and select one edge per pair
    const finalEdges = [];
    const tokenPairsMap = new Map();
    
    // Group edges by token pairs
    possibleEdges.forEach(edge => {
      const tokenPair = [edge.from, edge.to].sort().join('-');
      if (!tokenPairsMap.has(tokenPair)) {
        tokenPairsMap.set(tokenPair, []);
      }
      tokenPairsMap.get(tokenPair).push(edge);
    });
    
    // Process each token pair
    tokenPairsMap.forEach((edges, tokenPair) => {
      // Case 1: If any selected protocol has an edge for this pair, show it in blue
      if (selectedProtocols.length > 0) {
        const selectedProtocolEdge = edges.find(edge => selectedProtocols.includes(edge.protocol));
        if (selectedProtocolEdge) {
          finalEdges.push({
            ...selectedProtocolEdge,
            color: '#64B5F6', // Blue
            width: 3
          });
          return; // Skip to next token pair
        }
      }
      
      // Case 2: No protocols selected OR no edge belongs to selected protocols, show any edge in gray
      finalEdges.push({
        ...edges[0], // Just take the first edge
        color: '#D3D3D3', // Gray
        width: 2
      });
    });
    
    const processedEdges = finalEdges;
    
    return {
      nodes: filteredNodes,
      edges: processedEdges
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
    <div className="flex flex-col h-full" style={{ height: "100%" }}>
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
          />
        </>
      ) : (
        <div className="flex items-center justify-center h-full border rounded-md bg-muted/20" style={{ minHeight: "600px" }}>
          <p className="text-muted-foreground text-center">
            Select tokens and/or protocols, then click "Render Graph" to visualize connections
          </p>
        </div>
      )}
    </div>
  );
};

export default PoolGraphView;