// src/components/dexscan/graph/GraphViewContent.tsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import GraphView from './GraphView';
import { useGraphData } from './hooks/useGraphData';
import { GraphControls } from './GraphControls';

const PoolGraphView: React.FC = () => {
  const renderCountRef = useRef(0);
  console.log(`DEBUG: GraphViewContent render #${++renderCountRef.current}`);
  
  const { tokenNodes, poolEdges, currentBlockNumber } = useGraphData();
  
  // State for filtering with multi-select
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [selectedProtocols, setSelectedProtocols] = useState<string[]>([]);
  const [renderCounter, setRenderCounter] = useState(0);

  
  // Add useEffect for auto-rendering on selection changes
  useEffect(() => {
    if (selectedTokens.length > 0 || selectedProtocols.length > 0) {
      setRenderCounter(prev => prev + 1);
    }
  }, [selectedTokens, selectedProtocols]);
  
  // Extract unique protocols from pool edges
  const uniqueProtocols = useMemo(() => {
    console.log('DEBUG: Recalculating uniqueProtocols');
    const protocols = new Set<string>();
    poolEdges.forEach(edge => {
      protocols.add(edge.protocol);
    });
    return Array.from(protocols);
  }, [poolEdges]);
  
  // Filter nodes and edges based on selections
  const filteredData = useMemo(() => {
    console.log('DEBUG: Recalculating filteredData', { 
      renderCounter,
      selectedTokens,
      selectedProtocols 
    });
    
    if (renderCounter === 0) {
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

    // 3. Group pools by token pairs
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
      // For each token pair, check if any of the edges have a protocol
      // that matches one of the selected protocols
      
      // If no protocols are selected, or no matching protocols found,
      // show the edge in gray
      let edgeToDisplay = edges[0]; // Default to first edge
      let isProtocolMatch = false;
      
      if (selectedProtocols.length > 0) {
        // Case-insensitive matching of protocols
        const matchingEdge = edges.find(edge => 
          selectedProtocols.some(protocol => 
            protocol.toLowerCase() === edge.protocol.toLowerCase()
          )
        );
        
        if (matchingEdge) {
          // Found a matching protocol for this token pair
          edgeToDisplay = matchingEdge;
          isProtocolMatch = true;
          console.log(`Match found for ${tokenPair}: ${matchingEdge.protocol}`);
        } else {
          console.log(`No protocol match for ${tokenPair}. Available:`, 
            edges.map(e => e.protocol), 
            "Selected:", selectedProtocols);
        }
      }
      
      // Check if this edge was updated in the current block
      const isUpdatedInCurrentBlock = 
        edgeToDisplay.lastUpdatedAtBlock === currentBlockNumber && 
        currentBlockNumber > 0;
      
      // Add the edge to the final list with appropriate styling
      finalEdges.push({
        ...edgeToDisplay,
        // Use orange for recently updated pools, blue for protocol matches, gray for others
        color: isUpdatedInCurrentBlock ? '#FF9800' : (isProtocolMatch ? '#64B5F6' : '#D3D3D3'),
        width: isUpdatedInCurrentBlock ? 5 : (isProtocolMatch ? 3 : 2),
        label: isUpdatedInCurrentBlock ? 'CHANGED' : " ",
      });
    });

    return {
      nodes: filteredNodes,
      edges: finalEdges
    };
  }, [tokenNodes, poolEdges, selectedTokens, selectedProtocols, renderCounter, currentBlockNumber]);
  
  // Handle reset
  const handleReset = () => {
    setSelectedTokens([]);
    setSelectedProtocols([]);
    setRenderCounter(0);
  };
  
  // Handle render
  const handleRender = () => {
    if (selectedTokens.length > 0 || selectedProtocols.length > 0) {
      setRenderCounter(prev => prev + 1);
    }
  };
  
  // Statistics for rendered graph
  const graphStats = useMemo(() => {
    if (renderCounter === 0) return null;
    
    return {
      nodeCount: filteredData.nodes.length,
      edgeCount: filteredData.edges.length,
      tokenCount: selectedTokens.length,
      protocolCount: selectedProtocols.length
    };
  }, [filteredData, selectedTokens, selectedProtocols, renderCounter]);
  
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
      
      {renderCounter > 0 ? (
        <>
          {graphStats && (
            <div className="flex gap-4 mb-2 text-xs text-muted-foreground">
              <span>Displaying {graphStats.nodeCount} tokens and {graphStats.edgeCount} connections</span>
            </div>
          )}
          <div style={{ height: "100%" }}>
            <GraphView
              tokenNodes={filteredData.nodes}
              poolEdges={filteredData.edges}
            />
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-full border rounded-md bg-muted/20" style={{ height: "100%" }}>
          <p className="text-muted-foreground text-center">
            Select tokens and/or protocols, then click "Render Graph" to visualize connections
          </p>
        </div>
      )}
    </div>
  );
};

export default PoolGraphView;