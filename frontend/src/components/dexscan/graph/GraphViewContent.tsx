// src/components/dexscan/graph/GraphViewContent.tsx
import React, { useState, useMemo, useEffect } from 'react';
import GraphView from './GraphView';
import { useGraphData } from './hooks/useGraphData';
import { GraphControls } from './GraphControls';
import { usePoolData } from '../context/PoolDataContext'; // Corrected Import usePoolData

// Import graph frame background asset
import graphFrameBgArtboard from '@/assets/figma_generated/graph_frame_bg_artboard.png';
import globalBgNoise from '@/assets/figma_generated/global_bg_noise.png';

// Define a minimal type for Pool and Token if not already globally available
// This should ideally come from a shared types file e.g., ../types
interface Token {
  address: string;
  symbol: string;
  // Add other token properties if accessed
}

interface Pool {
  id: string; // Or number, depending on actual type
  tokens: Token[];
  protocol_system: string;
  lastUpdatedAtBlock?: number; // Optional as it's defaulted in useGraphData
  // Add other pool properties if accessed
}

const PoolGraphView: React.FC = () => {
  // console.log(`DEBUG: GraphViewContent render`);
  
  // State for filtering with multi-select
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [selectedProtocols, setSelectedProtocols] = useState<string[]>([]);

  // Get raw data for controls. Block info for GraphControls will come from useGraphData's return.
  const { pools: rawPoolsForControls } = usePoolData();

  // Derive data needed for GraphControls' dropdowns from raw data
  const allAvailableTokenNodes = useMemo(() => {
    // console.log('DEBUG: Recalculating allAvailableTokenNodes for Controls');
    const tokenMap = new Map();
    Object.values(rawPoolsForControls).forEach(poolUnk => {
      const pool = poolUnk as Pool; // Type assertion
      pool.tokens.forEach(token => {
        if (!tokenMap.has(token.address)) {
          const address = token.address || '';
          const tokenName = token.symbol;
          const firstByte = address ? address.slice(2, 4) : '';
          const lastByte = address ? address.slice(-2) : '';
          const formattedLabel = `${tokenName}${firstByte && lastByte ? ` (0x${firstByte}..${lastByte})` : ''}`;
          tokenMap.set(token.address, {
            id: token.address,
            label: token.symbol,
            symbol: token.symbol,
            formattedLabel: formattedLabel,
            address: token.address
          });
        }
      });
    });
    return Array.from(tokenMap.values());
  }, [rawPoolsForControls]);

  const uniqueProtocols = useMemo(() => {
    // console.log('DEBUG: Recalculating uniqueProtocols for Controls');
    const protocols = new Set<string>();
    Object.values(rawPoolsForControls).forEach(poolUnk => {
      const pool = poolUnk as Pool; // Type assertion
      protocols.add(pool.protocol_system);
    });
    return Array.from(protocols);
  }, [rawPoolsForControls]);
  
  // Get processed graph data for display using the new useGraphData hook
  const { 
    nodes: graphDisplayNodes, 
    edges: graphDisplayEdges,
    rawPoolsData, // Destructure the new rawPoolsData
    currentBlockNumber, // This now comes from useGraphData
    lastBlockTimestamp,   // This now comes from useGraphData
    estimatedBlockDuration // This now comes from useGraphData
  } = useGraphData(selectedTokens, selectedProtocols);
  
  // Debug log
  React.useEffect(() => {
    if (currentBlockNumber > 0) {
      console.log('🟪 GraphViewContent - currentBlockNumber:', currentBlockNumber);
    }
  }, [currentBlockNumber]);
  
  // Handle reset
  const handleReset = () => {
    setSelectedTokens([]);
    setSelectedProtocols([]);
    // setShowGraph will be updated by the useEffect above
  };

  return (
    <div 
      className="flex flex-col h-full rounded-xl relative overflow-hidden"
      style={{ 
        height: "100%",
        backgroundColor: "rgba(255, 244, 224, 0.01)", // Reduced opacity for more transparency
        backdropFilter: "blur(16px)", // Reduced blur to see more background detail
        WebkitBackdropFilter: "blur(16px)",
        boxSizing: "border-box",
      }}
    >
      {/* Background layers to match Figma */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url(${graphFrameBgArtboard})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.25, // Reduced opacity to let comet rays shine through
        }}
      />
      
      {/* Noise texture layer */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url(${globalBgNoise})`,
          backgroundRepeat: "repeat",
          opacity: 0.1, // Match Figma's 10% opacity on noise
        }}
      />
      
      {/* Gradient border */}
      <div 
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          background: `linear-gradient(180deg, rgba(255, 244, 224, 0.1) 0%, rgba(255, 244, 224, 0.064) 100%)`,
          padding: "1px",
        }}
      >
        <div 
          className="w-full h-full rounded-xl" 
          style={{
            backgroundColor: "transparent", // Remove opaque background to let rays through
          }}
        />
      </div>
      
      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col h-full p-6">
      <GraphControls 
        tokenList={allAvailableTokenNodes} 
        protocols={uniqueProtocols}
        selectedTokens={selectedTokens}
        selectedProtocols={selectedProtocols}
        onSelectTokens={setSelectedTokens}
        onSelectProtocols={setSelectedProtocols}
        onReset={handleReset}
        currentBlockNumber={currentBlockNumber} // Use block info from useGraphData
        lastBlockTimestamp={lastBlockTimestamp}   // Use block info from useGraphData
        estimatedBlockDuration={estimatedBlockDuration} // Use block info from useGraphData
      />
      
      {selectedTokens.length > 0 && graphDisplayNodes.length > 0 ? ( // Conditional rendering based on selectedTokens and if nodes exist
        <>
          <div style={{ flexGrow: 1, height: "0", minHeight:"0" }}>
            <GraphView
              tokenNodes={graphDisplayNodes} 
              poolEdges={graphDisplayEdges}
              rawPoolsData={rawPoolsData} // Pass rawPoolsData as a prop
            />
          </div>
        </>
      ) : (
        <div className="flex flex-grow items-center justify-center border rounded-md bg-muted/20" style={{ minHeight: "300px" }}>
          <p className="text-muted-foreground text-center">
            Select tokens to display the graph.
          </p>
        </div>
      )}
      </div> {/* Close content wrapper */}
    </div>
  );
};

export default PoolGraphView;
