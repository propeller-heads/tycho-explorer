import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import BlockProgressIcon from './BlockProgressIcon'; // Import the new component
import { TokenFilterPopover } from '../common/filters/TokenFilterPopover';
import { ProtocolFilterPopover } from '../common/filters/ProtocolFilterPopover';
import { Token } from '../types';

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
    <div
      className="flex flex-col md:flex-row md:items-center md:justify-between items-start"
      style={{ borderBottom: '1px solid rgba(255, 244, 224, 0.1)', padding: '16px' }}
    >
      <div className="flex flex-wrap items-center gap-2 sm:gap-2">
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
            className="h-10 sm:h-8 text-xs text-[rgba(255,244,224,0.64)] hover:text-[rgba(255,244,224,1)]"
            onClick={handleFullReset}
          >
            Reset all
          </Button>
        )}
      </div>

      {/* Right section for reset and block number - ensure it doesn't shrink excessively and aligns well in column mode */}
      {/* This div now only contains the block number display */}
      <div className="flex items-center gap-3 mt-4 md:mt-0 flex-shrink-0">
        {/* Block Number Display */}
        <div className="flex items-center gap-2">
          <BlockProgressIcon
            startTime={lastBlockTimestamp}
            duration={estimatedBlockDuration}
            size={16} // Adjust size as needed
            strokeWidth={2.5}
            color="#FF3366"
          />
          <span className="text-sm font-medium" style={{ color: "#FFF4E0" }}>
            {currentBlockNumber > 0 ? currentBlockNumber : 'Loading...'}
          </span>
        </div>
      </div>
      {/* Removed old multi-row layout and selection summary section */}
    </div>
  );
};