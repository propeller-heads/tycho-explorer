import React, { useMemo, useEffect } from 'react';
import GraphView from './GraphView';
import { useGraphData } from './hooks/useGraphData';
import { GraphControls } from './GraphControls';
import { usePoolData } from '../context/PoolDataContext';
import { TokenSelectionPrompt } from './TokenSelectionPrompt';

const PoolGraphView = ({
  selectedTokenAddresses,
  selectedProtocols,
  toggleToken,
  toggleProtocol,
  resetFilters,
}) => {
  // Get raw data for controls. Block info for GraphControls will come from useGraphData's return.
  const { pools: rawPoolsForControls, selectedChain } = usePoolData();

  // Derive data needed for GraphControls' dropdowns from raw data
  const allAvailableTokenNodes = useMemo(() => {
    const tokenMap = new Map();
    Object.values(rawPoolsForControls).forEach(poolUnk => {
      const pool = poolUnk;
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
    const protocols = new Set();
    Object.values(rawPoolsForControls).forEach(poolUnk => {
      const pool = poolUnk;
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
  } = useGraphData(selectedTokenAddresses, selectedProtocols);

  // Debug log
  React.useEffect(() => {
    if (currentBlockNumber > 0) {
      console.log('🟪 GraphViewContent - currentBlockNumber:', currentBlockNumber);
    }
  }, [currentBlockNumber]);

  // No need for array handlers - GraphControls now uses individual toggles

  return (
    <div className="h-full flex flex-col bg-[#FFF4E005] backdrop-blur-[24px] rounded-xl overflow-hidden shadow-2xl">
      <GraphControls
        tokenList={allAvailableTokenNodes}
        protocols={uniqueProtocols}
        selectedTokens={selectedTokenAddresses}
        selectedProtocols={selectedProtocols}
        onTokenToggle={toggleToken}
        onProtocolToggle={toggleProtocol}
        onReset={resetFilters}
        currentBlockNumber={currentBlockNumber} // Use block info from useGraphData
        lastBlockTimestamp={lastBlockTimestamp}   // Use block info from useGraphData
        estimatedBlockDuration={estimatedBlockDuration} // Use block info from useGraphData
      />

      {selectedTokenAddresses.length >= 2 && graphDisplayNodes.length > 0 ? ( // Conditional rendering based on selectedTokens and if nodes exist
        <>
          <div className="flex-1" style={{ minHeight: "0" }}>
            <GraphView
              tokenNodes={graphDisplayNodes}
              poolEdges={graphDisplayEdges}
              rawPoolsData={rawPoolsData} // Pass rawPoolsData as a prop
              selectedChain={selectedChain} // Pass selectedChain as a prop
            />
          </div>
        </>
      ) : (
        <div className="flex flex-grow items-center justify-center" style={{ minHeight: "300px" }}>
          <TokenSelectionPrompt />
        </div>
      )}
    </div>
  );
};

export default PoolGraphView;
