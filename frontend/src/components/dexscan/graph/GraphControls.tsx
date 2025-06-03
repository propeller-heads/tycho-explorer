import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import BlockProgressIcon from './BlockProgressIcon'; // Import the new component
import { TokenFilterPopover } from '../common/filters/TokenFilterPopover';
import { ProtocolFilterPopover } from '../common/filters/ProtocolFilterPopover';
import { Token } from '../types';

// Local storage keys - keep
const LS_SELECTED_TOKENS_KEY = 'graphView_selectedTokens';
const LS_SELECTED_PROTOCOLS_KEY = 'graphView_selectedProtocols';

interface GraphControlsProps {
  tokenList: Array<{ id: string, label: string }>;
  protocols: string[];
  selectedTokens: string[];
  selectedProtocols: string[];
  onSelectTokens: (tokenIds: string[]) => void;
  onSelectProtocols: (protocols: string[]) => void;
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
  onSelectTokens,
  onSelectProtocols,
  // onRender, // Removed as per plan
  onReset,
  currentBlockNumber,
  lastBlockTimestamp,
  estimatedBlockDuration,
}) => {
  const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false);
  
  // Convert between Token type and graph's token structure
  const tokensAsTokenType = useMemo(() => 
    tokenList.map(t => ({
      address: t.id,
      symbol: t.label,
      name: t.label, // Graph view doesn't have separate name
    })), [tokenList]
  );

  const selectedTokensAsTokenType = useMemo(() => 
    selectedTokens.map(id => {
      const token = tokenList.find(t => t.id === id);
      return {
        address: id,
        symbol: token?.label || '',
        name: token?.label || ''
      };
    }), [selectedTokens, tokenList]
  );

  // localStorage effect - keep
  useEffect(() => {
    if (tokenList.length === 0 || protocols.length === 0 || hasLoadedFromStorage) return;
    try {
      const storedTokens = localStorage.getItem(LS_SELECTED_TOKENS_KEY);
      const storedProtocols = localStorage.getItem(LS_SELECTED_PROTOCOLS_KEY);
      let loaded = false;
      if (storedTokens) {
        const parsed = JSON.parse(storedTokens).filter((id: string) => tokenList.some(token => token.id === id));
        if (parsed.length > 0) { onSelectTokens(parsed); loaded = true; }
      }
      if (storedProtocols) {
        const parsed = JSON.parse(storedProtocols).filter((p: string) => protocols.includes(p));
        if (parsed.length > 0) { onSelectProtocols(parsed); loaded = true; }
      }
      if (loaded) setHasLoadedFromStorage(true);
    } catch (e) { console.error('Failed to load selections from localStorage', e); setHasLoadedFromStorage(true); }
  }, [tokenList, protocols, hasLoadedFromStorage, onSelectTokens, onSelectProtocols]);

  const handleTokenToggle = (token: Token, isSelected: boolean) => {
    const newSelected = isSelected 
      ? [...selectedTokens, token.address]
      : selectedTokens.filter(id => id !== token.address);
    localStorage.setItem(LS_SELECTED_TOKENS_KEY, JSON.stringify(newSelected));
    onSelectTokens(newSelected);
  };

  const handleProtocolToggle = (protocol: string, isSelected: boolean) => {
    const newSelected = isSelected
      ? [...selectedProtocols, protocol]
      : selectedProtocols.filter(p => p !== protocol);
    localStorage.setItem(LS_SELECTED_PROTOCOLS_KEY, JSON.stringify(newSelected));
    onSelectProtocols(newSelected);
  };

  const handleFullReset = () => {
    localStorage.removeItem(LS_SELECTED_TOKENS_KEY);
    localStorage.removeItem(LS_SELECTED_PROTOCOLS_KEY);
    setHasLoadedFromStorage(false); // Allow reloading defaults if component re-mounts or lists change
    onReset(); // This prop will call setSelectedTokens([]), setSelectedProtocols([]), setRenderCounter(0) in parent
  };

  return (
    <div
      className="flex flex-col md:flex-row md:items-center md:justify-between items-start gap-4 p-4"
      style={{ borderBottom: '1px solid rgba(255, 244, 224, 0.1)', marginBottom: '16px' }}
    >
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <TokenFilterPopover
          tokens={tokensAsTokenType}
          selectedTokens={selectedTokensAsTokenType}
          onTokenToggle={handleTokenToggle}
          buttonText="Select tokens"
        />

        <ProtocolFilterPopover
          protocols={protocols}
          selectedProtocols={selectedProtocols}
          onProtocolToggle={handleProtocolToggle}
          buttonText="Select protocols"
          showColorDots={true}
        />

        <Button
          variant="link"
          size="sm"
          className="h-10 sm:h-8 text-xs text-[rgba(255,244,224,0.64)] hover:text-[rgba(255,244,224,1)]"
          onClick={handleFullReset}
        >
          Reset filters
        </Button>
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
            {currentBlockNumber > 0 ? currentBlockNumber.toLocaleString() : 'Loading...'}
          </span>
        </div>
      </div>
      {/* Removed old multi-row layout and selection summary section */}
    </div>
  );
};