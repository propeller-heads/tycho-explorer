import React from 'react';
import { Button } from '@/components/ui/button';
import BlockProgressIcon from '@/components/dexscan/graph/BlockProgressIcon'; // Reusing from graph view
import { Token } from '../types'; // Import Token type
import { TokenFilterPopover } from '../common/filters/TokenFilterPopover';
import { ProtocolFilterPopover } from '../common/filters/ProtocolFilterPopover';

interface PoolListFilterBarProps {
  // Filter state
  selectedTokens: Token[]; // Use imported Token type
  selectedProtocols: string[];
  
  // Callbacks to update filters in ListView
  onTokenSelect: (token: Token, isSelected: boolean) => void; // Use imported Token type
  onProtocolSelect: (protocol: string, isSelected: boolean) => void;
  
  onResetFilters: () => void;
  
  // Data for populating filter options
  allTokensForFilter: Token[]; // Use imported Token type
  allProtocolsForFilter: string[];
  
  blockNumber: number | null;
  // Renamed to match BlockProgressIconProps
  startTime?: number; 
  duration?: number; 
}

const PoolListFilterBar: React.FC<PoolListFilterBarProps> = ({
  selectedTokens,
  selectedProtocols,
  onTokenSelect,
  onProtocolSelect,
  onResetFilters,
  allTokensForFilter,
  allProtocolsForFilter,
  blockNumber,
  startTime, // Renamed
  duration,  // Renamed
}) => {

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border-b border-white/10 gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <TokenFilterPopover
          tokens={allTokensForFilter}
          selectedTokens={selectedTokens}
          onTokenToggle={onTokenSelect}
        />

        <ProtocolFilterPopover
          protocols={allProtocolsForFilter}
          selectedProtocols={selectedProtocols}
          onProtocolToggle={onProtocolSelect}
        />

        <Button variant="link" size="sm" className="h-10 sm:h-8 text-xs text-[rgba(255,244,224,0.64)] hover:text-[rgba(255,244,224,1)] underline-offset-2" onClick={onResetFilters}>
          Reset filters
        </Button>
      </div>

      <div className="flex items-center gap-2 ml-auto sm:ml-0">
        {startTime && duration && ( // Check for renamed props
          <BlockProgressIcon
            startTime={startTime} // Pass renamed prop
            duration={duration}   // Pass renamed prop
            size={16} // Consistent with GraphControls
            color="#FF3366" // Changed to red as per Figma and Graph View
          />
        )}
        {blockNumber !== null && (
          <span className="text-sm font-medium text-[rgba(255,244,224,0.8)]">{blockNumber}</span>
        )}
      </div>
    </div>
  );
};

export default PoolListFilterBar;