import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import ConnectionStatus from '@/components/dexscan/shared/ConnectionStatus';
import { TokenFilterPopover } from '@/components/dexscan/shared/filters/TokenFilterPopover';
import { ProtocolFilterPopover } from '@/components/dexscan/shared/filters/ProtocolFilterPopover';
import { Token } from '@/components/dexscan/app/types';
import { FILTER_STYLES } from '@/components/dexscan/shared/filters/filterStyles';
import { usePoolData } from '@/components/dexscan/shared/PoolDataContext';

// Removed local storage keys - now handled by useFilterManager

interface GraphControlsProps {
  tokenList: Array<{ id: string, label: string }>;
  protocols: string[];
  selectedTokens: string[];
  selectedProtocols: string[];
  onTokenToggle: (tokenId: string, isSelected: boolean) => void;
  onProtocolToggle: (protocol: string, isSelected: boolean) => void;
  // onRender: () => void; // Will be removed when auto-render is fully implemented
  onReset: () => void;
  currentBlockNumber: number;
  lastBlockTimestamp: number | null;
  estimatedBlockDuration: number;
}

export const GraphControls: React.FC<GraphControlsProps> = ({
  tokenList,
  protocols,
  selectedTokens,
  selectedProtocols,
  onTokenToggle,
  onProtocolToggle,
  // onRender, // Removed as per plan
  onReset,
  currentBlockNumber,
  lastBlockTimestamp,
  estimatedBlockDuration,
}) => {
  // Get connection state data for ConnectionStatus component
  const { connectionState, connectionStartTime } = usePoolData();
  // Removed hasLoadedFromStorage - now handled by useFilterManager
  
  // Convert between Token type and graph's token structure
  const tokensAsTokenType = useMemo(() => 
    tokenList.map(t => ({
      address: t.id,
      symbol: t.label,
      name: t.label, // Graph view doesn't have separate name
      decimals: 18, // Default decimals for graph view tokens
    })), [tokenList]
  );

  const selectedTokensAsTokenType = useMemo(() => 
    selectedTokens.map(id => {
      const token = tokenList.find(t => t.id === id);
      return {
        address: id,
        symbol: token?.label || '',
        name: token?.label || '',
        decimals: 18, // Default decimals
      };
    }), [selectedTokens, tokenList]
  );

  // Removed localStorage effect - now handled by useFilterManager

  const handleTokenToggle = (token: Token, isSelected: boolean) => {
    onTokenToggle(token.address, isSelected);
  };

  const handleProtocolToggle = (protocol: string, isSelected: boolean) => {
    onProtocolToggle(protocol, isSelected);
  };

  const handleFullReset = () => {
    onReset(); // This is now handled by useFilterManager
  };

  return (
    <div className={FILTER_STYLES.filterBar}>
      <div className={FILTER_STYLES.filterBarButtons}>
        <TokenFilterPopover
          tokens={tokensAsTokenType}
          selectedTokens={selectedTokensAsTokenType}
          onTokenToggle={handleTokenToggle}
          buttonText="Token"
        />

        <ProtocolFilterPopover
          protocols={protocols}
          selectedProtocols={selectedProtocols}
          onProtocolToggle={handleProtocolToggle}
          buttonText="Protocol"
          showColorDots={true}
        />

        {(selectedTokens.length > 0 || selectedProtocols.length > 0) && (
          <Button
            variant="link"
            size="sm"
            className={FILTER_STYLES.resetButton}
            onClick={handleFullReset}
          >
            Reset all
          </Button>
        )}
      </div>

      {/* Block Number Display - moved to the right */}
      <ConnectionStatus
        connectionState={connectionState}
        connectionStartTime={connectionStartTime}
        blockNumber={currentBlockNumber}
        lastBlockTimestamp={lastBlockTimestamp}
        estimatedBlockDuration={estimatedBlockDuration}
      />
    </div>
  );
};