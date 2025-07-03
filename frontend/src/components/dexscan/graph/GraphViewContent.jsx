import React, { useMemo } from 'react';
import { GraphPipeline } from './GraphPipeline';
import { GraphControls } from './GraphControls';
import { usePoolData } from '@/components/dexscan/shared/PoolDataContext';
import { TokenSelectionPrompt } from './TokenSelectionPrompt';

const PoolGraphView = ({
  selectedTokenAddresses,
  selectedProtocols,
  toggleToken,
  toggleProtocol,
  resetFilters,
}) => {
  // Get data from context
  const { 
    pools: rawPools, 
    selectedChain,
    blockNumber,
    lastBlockTimestamp,
    estimatedBlockDuration,
    availableProtocols,
    availableTokens 
  } = usePoolData();

  // Transform available tokens to the format expected by GraphControls
  const allAvailableTokenNodes = useMemo(() => {
    return availableTokens.map(token => {
      const address = token.address || '';
      const firstByte = address ? address.slice(2, 4) : '';
      const lastByte = address ? address.slice(-2) : '';
      const formattedLabel = `${token.symbol}${firstByte && lastByte ? ` (0x${firstByte}..${lastByte})` : ''}`;
      return {
        id: token.address,
        label: token.symbol,
        symbol: token.symbol,
        formattedLabel: formattedLabel,
        address: token.address
      };
    });
  }, [availableTokens]);

  // No need for array handlers - GraphControls now uses individual toggles

  return (
    <div className="h-full flex flex-col bg-[#FFF4E005] backdrop-blur-[24px] rounded-xl overflow-hidden shadow-2xl">
      <GraphControls
        tokenList={allAvailableTokenNodes}
        protocols={availableProtocols}
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
