import React from 'react';
import { Button } from '@/components/ui/button';
import BlockProgressIcon from '@/components/dexscan/graph/BlockProgressIcon'; // Reusing from graph view
import { Token } from '../types'; // Import Token type
import { TokenFilterPopover } from '../common/filters/TokenFilterPopover';
import { ProtocolFilterPopover } from '../common/filters/ProtocolFilterPopover';
import { FILTER_STYLES } from '../common/filters/filterStyles';

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
    <div className={FILTER_STYLES.filterBar}>
      <div className={FILTER_STYLES.filterBarButtons}>
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

        {(selectedTokens.length > 0 || selectedProtocols.length > 0) && (
          <Button variant="link" size="sm" className={FILTER_STYLES.resetButton} onClick={onResetFilters}>
            Reset all
          </Button>
        )}
      </div>

      <div className={FILTER_STYLES.filterBarRight}>
        {startTime && duration && ( // Check for renamed props
          <BlockProgressIcon
            startTime={startTime} // Pass renamed prop
            duration={duration}   // Pass renamed prop
            size={16} // Consistent with GraphControls
            color="#FF3366" // Changed to red as per Figma and Graph View
          />
        )}
        {blockNumber !== null && (
          <span className={FILTER_STYLES.blockNumberText}>{blockNumber}</span>
        )}
      </div>
    </div>
  );
};

export default PoolListFilterBar;