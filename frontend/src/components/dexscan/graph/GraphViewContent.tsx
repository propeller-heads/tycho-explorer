// src/components/dexscan/graph/GraphViewContent.tsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import GraphView from './GraphView';
import { useGraphData } from './hooks/useGraphData';
import { GraphControls } from './GraphControls';

// Import graph frame background asset
import graphFrameBgArtboard from '@/assets/figma_generated/graph_frame_bg_artboard.png';

const PoolGraphView: React.FC = () => {
  const renderCountRef = useRef(0);
  console.log(`DEBUG: GraphViewContent render #${++renderCountRef.current}`);
  
  const { 
    tokenNodes, 
    poolEdges, 
    currentBlockNumber, 
    lastBlockTimestamp, // Added
    estimatedBlockDuration // Added
  } = useGraphData();
  
  // State for filtering with multi-select
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [selectedProtocols, setSelectedProtocols] = useState<string[]>([]);
  const [renderCounter, setRenderCounter] = useState(0);

  
  // Add useEffect for auto-rendering on selection changes
  useEffect(() => {
    // If there are tokens selected, ensure the graph area attempts to render.
    // The actual data filtering is handled in filteredData memo.
    // If no tokens are selected, set renderCounter to 0 to show placeholder.
    if (selectedTokens.length > 0) {
      // Incrementing prev => prev + 1 ensures a new render if selections change but criteria still met.
      // Or simply set to 1 if we just care about visibility state.
      // Forcing a change in renderCounter ensures filteredData re-evaluates if its other deps change.
      setRenderCounter(prev => prev + 1); 
    } else {
      setRenderCounter(0); // No tokens selected, show placeholder
    }
  }, [selectedTokens, selectedProtocols]); // Keep selectedProtocols as a dependency to trigger re-evaluation if only protocols change while tokens are selected.
  
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
      // Determine color and width based on state, falling back to networkOptions defaults
      let edgeColor;
      let edgeWidth;

      if (isUpdatedInCurrentBlock) {
        edgeColor = '#FF9800'; // Orange for recently updated
        edgeWidth = 2;         // Prominent width
      } else {
        // Default: color and width will be taken from networkOptions.edges
        // by not setting them here (or setting to undefined)
        edgeColor = undefined; 
        edgeWidth = undefined;
      }

      finalEdges.push({
        ...edgeToDisplay,
        color: edgeColor, // Will use networkOptions default if undefined
        width: edgeWidth, // Will use networkOptions default if undefined
        label: isUpdatedInCurrentBlock ? 'UPDATED' : undefined, // Label only if updated, else undefined for no label
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
  
  // Handle render - This function is no longer needed as auto-rendering is handled by useEffect
  // const handleRender = () => {
  //   if (selectedTokens.length > 0 || selectedProtocols.length > 0) {
  //     setRenderCounter(prev => prev + 1);
  //   }
  // };
  
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
    <div 
      className="flex flex-col h-full p-6 rounded-xl" // Added p-6 for padding, rounded-xl for 12px
      style={{ 
        height: "100%",
        backgroundColor: "rgba(255, 244, 224, 0.02)",
        backgroundImage: `url(${graphFrameBgArtboard})`,
        backgroundSize: "cover", // Or "contain", "auto" depending on image aspect ratio and desired effect
        backgroundPosition: "center",
        border: "1px solid rgba(255, 244, 224, 0.2)", // Changed opacity from 0.4 to 0.2
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)", // For Safari
        boxSizing: "border-box", // Ensure padding and border are included in height/width
      }}
    >
      <GraphControls 
        tokenList={tokenNodes}
        protocols={uniqueProtocols}
        selectedTokens={selectedTokens}
        selectedProtocols={selectedProtocols}
        onSelectTokens={setSelectedTokens}
        onSelectProtocols={setSelectedProtocols}
        // onRender={handleRender} // Removed as per plan, auto-rendering now
        onReset={handleReset}
        // Pass new props for block display
        currentBlockNumber={currentBlockNumber}
        lastBlockTimestamp={lastBlockTimestamp}
        estimatedBlockDuration={estimatedBlockDuration}
      />
      
      {renderCounter > 0 ? (
        <>
          {/* Ensure GraphView container takes remaining height */}
          <div style={{ flexGrow: 1, height: "0", minHeight:"0" /* Fix for flex child height in some browsers */ }}>
            <GraphView
              tokenNodes={filteredData.nodes}
              poolEdges={filteredData.edges}
            />
          </div>
        </>
      ) : (
        <div className="flex flex-grow items-center justify-center border rounded-md bg-muted/20" style={{ minHeight: "300px" /* Ensure empty state has some height */ }}>
          <p className="text-muted-foreground text-center">
            Select tokens and/or protocols.
          </p>
        </div>
      )}
    </div>
  );
};

export default PoolGraphView;
