import React from 'react';
import { Button } from '@/components/ui/button';
import { Token } from '@/components/dexscan/app/types'; // Import Token type
import { TokenFilterPopover } from '@/components/dexscan/shared/filters/TokenFilterPopover';
import { ProtocolFilterPopover } from '@/components/dexscan/shared/filters/ProtocolFilterPopover';
import { FILTER_STYLES } from '@/components/dexscan/shared/filters/filterStyles';
import ConnectionStatus from '@/components/dexscan/shared/ConnectionStatus';

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
  // Connection status props
  connectionState: 'disconnected' | 'connecting' | 'connected';
  connectionStartTime: number | null;
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
  connectionState,
  connectionStartTime,
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
          selectedProtocols={selectedProtocols.filter(protocol => 
            allProtocolsForFilter.includes(protocol)
          )}
          onProtocolToggle={onProtocolSelect}
        />

        {(selectedTokens.length > 0 || selectedProtocols.length > 0) && (
          <Button variant="link" size="sm" className={FILTER_STYLES.resetButton} onClick={onResetFilters}>
            Reset all
          </Button>
        )}
      </div>

      {/* Connection Status Display - IMPORTANT: Keep centered on mobile, right-aligned on desktop */}
      {/* DO NOT MOVE: This component must remain centered on mobile for proper UI alignment */}
      <div className="flex justify-center sm:justify-end w-full sm:w-auto">
        <ConnectionStatus
          connectionState={connectionState}
          connectionStartTime={connectionStartTime}
          blockNumber={blockNumber || 0}
          lastBlockTimestamp={startTime || null}
          estimatedBlockDuration={duration || 12000}
        />
      </div>
    </div>
  );
};

export default PoolListFilterBar;