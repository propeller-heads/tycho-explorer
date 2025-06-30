import React, { useMemo } from 'react';
import { GraphPipeline } from './GraphPipeline';
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
  // Get raw data
  const { 
    pools: rawPools, 
    selectedChain,
    blockNumber,
    lastBlockTimestamp,
    estimatedBlockDuration 
  } = usePoolData();

  console.warn(`[GraphViewContent] ${blockNumber}`);

  // Derive data needed for GraphControls' dropdowns from raw data
  const allAvailableTokenNodes = useMemo(() => {
    const tokenMap = new Map();
    Object.values(rawPools).forEach(poolUnk => {
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
  }, [rawPools]);

  const uniqueProtocols = useMemo(() => {
    // console.log('DEBUG: Recalculating uniqueProtocols for Controls');
    const protocols = new Set();
    Object.values(rawPools).forEach(poolUnk => {
      const pool = poolUnk;
      protocols.add(pool.protocol_system);
    });
    return Array.from(protocols);
  }, [rawPools]);

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
        currentBlockNumber={blockNumber} // Use block info from useGraphData
        lastBlockTimestamp={lastBlockTimestamp}   // Use block info from useGraphData
        estimatedBlockDuration={estimatedBlockDuration} // Use block info from useGraphData
      />

      {selectedTokenAddresses.length >= 2 ? (
        <div className="flex-1" style={{ minHeight: "0" }}>
          <GraphPipeline
            pools={rawPools}
            selectedTokens={selectedTokenAddresses}
            selectedProtocols={selectedProtocols}
            selectedChain={selectedChain}
            currentBlockNumber={blockNumber}
          />
        </div>
      ) : (
        <div className="flex flex-grow items-center justify-center" style={{ minHeight: "300px" }}>
          <TokenSelectionPrompt />
        </div>
      )}
    </div>
  );
};

export default PoolGraphView;
