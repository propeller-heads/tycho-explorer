// src/components/dexscan/graph/GraphViewContent.tsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import GraphView from './GraphView';
import { useGraphData } from './hooks/useGraphData';
import { GraphControls } from './GraphControls';

const PoolGraphView: React.FC = () => {
  const renderCountRef = useRef(0);
  console.log(`DEBUG: GraphViewContent render #${++renderCountRef.current}`);
  
  const { tokenNodes, poolEdges } = useGraphData();
  
  // State for filtering with multi-select
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [selectedProtocols, setSelectedProtocols] = useState<string[]>([]);
  const [renderCounter, setRenderCounter] = useState(0);
  
  // Store reference to previous filtered data to maintain stability
  const prevFilteredDataRef = useRef<{nodes: any[], edges: any[]}>({nodes: [], edges: []});
  
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

    console.log("possibleEdges count:", possibleEdges.length);

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
    
    console.log("tokenPairsMap size:", tokenPairsMap.size);
    console.log("tokenPairsMap :", tokenPairsMap);

 
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
      
      // Add the edge to the final list with appropriate styling
      finalEdges.push({
        ...edgeToDisplay,
        color: isProtocolMatch ? '#64B5F6' : '#D3D3D3', // Blue if matched, Gray otherwise
        width: isProtocolMatch ? 3 : 2
      });
    });
    
    const result = {
      nodes: filteredNodes,
      edges: finalEdges
    };
    
    // Helper function to check if two sets have the same elements
    const areSetsEqual = (a, b) => {
      if (a.size !== b.size) return false;
      return Array.from(a).every(element => b.has(element));
    };
    
    // Check structural equality with previous result
    const nodeIdsNew = new Set(result.nodes.map(n => n.id));
    const nodeIdsPrev = new Set(prevFilteredDataRef.current.nodes.map(n => n.id));
    const nodesEqual = areSetsEqual(nodeIdsNew, nodeIdsPrev);
    
    const edgeIdsNew = new Set(result.edges.map(e => e.id));
    const edgeIdsPrev = new Set(prevFilteredDataRef.current.edges.map(e => e.id));
    const edgesEqual = areSetsEqual(edgeIdsNew, edgeIdsPrev);
    
    // Only update reference if structure changed
    if (!nodesEqual || !edgesEqual) {
      console.log('DEBUG_EQ: filtered data structure changed');
      prevFilteredDataRef.current = result;
    } else {
      console.log('DEBUG_EQ: returning same filtered data structure');
      return prevFilteredDataRef.current;
    }
    
    return result;
  }, [tokenNodes, poolEdges, selectedTokens, selectedProtocols, renderCounter]);
  
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