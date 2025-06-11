import { useState, useEffect, useMemo, useCallback } from 'react';
import { cn, renderHexId, getExternalLink, formatTimeAgo } from '@/lib/utils';
import { Pool, Token } from './types'; 
import { parsePoolFee } from '@/lib/poolUtils';
// SwapSimulator will be part of PoolDetailSidebar
// import SwapSimulator from './SwapSimulator'; 
import PoolTable from './pools/PoolTable';
import PoolListFilterBar from './pools/PoolListFilterBar';
import PoolDetailSidebar from './PoolDetailSidebar'; // This component will be created later
import { usePoolData } from './context/PoolDataContext';
import { useFilterManager } from '@/hooks/useFilterManager';

// TokenForFilter interface is removed. Using 'Token' from './types' directly.

// Updated COLUMNS definition based on plan
const COLUMNS = [
  { id: 'tokens', name: 'Tokens', type: 'tokens' }, // Non-sortable
  { id: 'id', name: 'Pool ID', type: 'poolId' },     // Non-sortable
  { id: 'static_attributes.fee', name: 'Fee rate', type: 'fee' },    // Sortable
  { id: 'spotPrice', name: 'Spot price', type: 'number' },  // Sortable
  { id: 'protocol_system', name: 'Protocol', type: 'protocol' }, // Sortable
  { id: 'updatedAt', name: 'Last update', type: 'time-ago' } // Sortable
];

const INITIAL_DISPLAY_COUNT = 30; // For infinite scroll batch size
const POOL_LOAD_BATCH_SIZE = 20; // Number of additional pools to load

interface PoolListViewProps {
  pools: Pool[];
  className?: string;
  highlightedPoolId?: string | null;
  onPoolSelect?: (poolId: string | null) => void;
}

// Simplified renderTokens for text part, icons will be handled in PoolTable cell
const renderTokensText = (pool: Pool) => {
  return pool.tokens.map(token => {
    // Check if the symbol looks like an address (starts with 0x and has 40+ hex chars)
    if (token.symbol && token.symbol.startsWith('0x') && token.symbol.length >= 42) {
      return renderHexId(token.symbol);
    }
    return token.symbol;
  }).join(' / ');
};

const ListView = ({ pools, className, highlightedPoolId, onPoolSelect }: PoolListViewProps) => {
  const { blockNumber, lastBlockTimestamp, estimatedBlockDuration, selectedChain } = usePoolData();
  
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [sortConfig, setSortConfig] = useState<{column: string, direction: 'asc' | 'desc'}>({
    column: 'updatedAt', // Default sort by a sortable column
    direction: 'desc'
  });
  const [displayedPoolsCount, setDisplayedPoolsCount] = useState(INITIAL_DISPLAY_COUNT);
  const [isLoadingMore, setIsLoadingMore] = useState(false); // New state for loading indicator

  // Use unified filter management
  const {
    selectedTokenAddresses,
    selectedProtocols,
    toggleToken,
    toggleProtocol,
    resetFilters: resetFilterState
  } = useFilterManager({ viewType: 'list', chain: selectedChain });

  // Prepare data for filter popovers
  const allTokensForFilter = useMemo((): Token[] => { // Changed to Token[]
    const uniqueTokensMap = new Map<string, Token>(); // Changed to Token
    pools.forEach(pool => {
      pool.tokens.forEach(token => {
        if (token.address && !uniqueTokensMap.has(token.address)) {
          // Spread the token object, which conforms to the Token type
          uniqueTokensMap.set(token.address, { ...token }); 
        }
      });
    });
    return Array.from(uniqueTokensMap.values()).sort((a, b) => a.symbol.localeCompare(b.symbol));
  }, [pools]);

  const allProtocolsForFilter = useMemo(() => 
    Array.from(new Set(pools.map(pool => pool.protocol_system))).filter(Boolean).sort() as string[], 
  [pools]);


  const sortPools = useCallback((poolsToSort: Pool[]) => {
    return [...poolsToSort].sort((a, b) => {
      let valueA: any, valueB: any;
      
      switch (sortConfig.column) {
        case 'protocol_system':
          valueA = a.protocol_system || '';
          valueB = b.protocol_system || '';
          break;
        case 'static_attributes.fee':
          valueA = parsePoolFee(a);
          valueB = parsePoolFee(b);
          break;
        case 'spotPrice':
          valueA = a.spotPrice || 0;
          valueB = b.spotPrice || 0;
          break;
        case 'updatedAt':
          valueA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          valueB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          break;
        default:
          // Should not happen for non-sortable columns if UI prevents it
          return 0;
      }
      
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        const result = valueA.localeCompare(valueB);
        return sortConfig.direction === 'asc' ? result : -result;
      } else if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sortConfig.direction === 'asc' ? valueA - valueB : valueB - valueA;
      }
      return 0;
    });
  }, [sortConfig]);

  // Convert selected token addresses to Token objects for display
  const selectedTokenObjects = useMemo(() => 
    selectedTokenAddresses
      .map(addr => allTokensForFilter.find(t => t.address === addr))
      .filter((t): t is Token => t !== undefined),
    [selectedTokenAddresses, allTokensForFilter]
  );

  const filterPools = useCallback((poolsToFilter: Pool[]) => {
    return poolsToFilter.filter(pool => {
      const tokenMatch = selectedTokenAddresses.length === 0 ||
        selectedTokenAddresses.some(addr => pool.tokens.some(pt => pt.address === addr));
      
      const protocolMatch = selectedProtocols.length === 0 ||
        selectedProtocols.includes(pool.protocol_system);
      
      return tokenMatch && protocolMatch;
    });
  }, [selectedTokenAddresses, selectedProtocols]);

  const processedPools = useMemo(() => {
    const filtered = filterPools(pools);
    return sortPools(filtered);
  }, [pools, filterPools, sortPools]);

  const summaryData = useMemo(() => {
    const uniqueProtocolsInView = new Set(processedPools.map(p => p.protocol_system));
    const uniqueTokensInView = new Set<string>();
    processedPools.forEach(pool => {
      pool.tokens.forEach(token => {
        if (token.address) uniqueTokensInView.add(token.address);
      });
    });
    return {
      totalPools: processedPools.length,
      totalUniqueTokens: uniqueTokensInView.size,
      totalProtocols: uniqueProtocolsInView.size,
    };
  }, [processedPools]);

  const handleRowClick = (pool: Pool) => {
    const newSelection = selectedPool?.id === pool.id ? null : pool;
    setSelectedPool(newSelection);
    if (onPoolSelect) {
      onPoolSelect(newSelection?.id || null);
    }
  };

  const handleSort = useCallback((columnId: string) => {
    // Ensure column is sortable
    if (!COLUMNS.find(c => c.id === columnId && (c.id === 'protocol_system' || c.id === 'static_attributes.fee' || c.id === 'spotPrice' || c.id === 'updatedAt'))) {
      return;
    }
    setSortConfig(prev => ({
      column: columnId,
      direction: prev.column === columnId && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setDisplayedPoolsCount(INITIAL_DISPLAY_COUNT); // Reset display count on sort
  }, []);

  // Handlers that work with the unified filter manager
  const handleTokenToggle = useCallback((token: Token, isSelected: boolean) => {
    toggleToken(token.address, isSelected);
  }, [toggleToken]);

  const handleProtocolToggle = useCallback((protocol: string, isSelected: boolean) => {
    toggleProtocol(protocol, isSelected);
  }, [toggleProtocol]);
  
  const handleResetFilters = useCallback(() => {
    resetFilterState();
    setDisplayedPoolsCount(INITIAL_DISPLAY_COUNT);
  }, [resetFilterState]);

  useEffect(() => {
    if (highlightedPoolId) {
      const pool = pools.find(p => p.id === highlightedPoolId);
      setSelectedPool(pool || null);
    } else {
      setSelectedPool(null); // Clear selection if highlightedPoolId is null
    }
  }, [highlightedPoolId, pools]);

  const handleLoadMorePools = useCallback(() => {
    if (isLoadingMore || displayedPoolsCount >= processedPools.length) {
      return; // Prevent multiple simultaneous loads or loading if all pools are displayed
    }

    setIsLoadingMore(true);
    // Simulate a small delay to show the loading indicator, then update count
    // In a real app, this would be tied to actual data fetching completion
    setTimeout(() => {
      setDisplayedPoolsCount(prevCount => 
        Math.min(prevCount + POOL_LOAD_BATCH_SIZE, processedPools.length)
      );
      setIsLoadingMore(false);
    }, 300); // 300ms delay for visual feedback
  }, [isLoadingMore, displayedPoolsCount, processedPools.length]);

  const poolsToDisplay = useMemo(() => 
    processedPools.slice(0, displayedPoolsCount),
  [processedPools, displayedPoolsCount]);

  // Helper for PoolListFilterBar props
  // Simplified onFilterItemSelect, directly using handleFilterChange structure
  // This generic helper might be causing type inference issues, let's simplify calls to handleFilterChange


  return (
    <div className={cn("relative flex flex-col h-full", className)}> {/* Added relative for sidebar positioning */}
      {/* Main Content Panel with TC Design Styling */}
      <div className="flex-grow flex flex-col bg-[#FFF4E005] backdrop-blur-[24px] rounded-xl overflow-hidden shadow-2xl relative">
        {/* Gradient border effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-b rgba(255,244,224,0.02) p-[1px]">
          <div className="bg-[#FFF4E005] rounded-xl h-full w-full" />
        </div>
        <div className="relative z-10 flex flex-col h-full"> {/* Content wrapper */}
        <PoolListFilterBar
          selectedTokens={selectedTokenObjects}
          selectedProtocols={selectedProtocols}
          // Pass specific handlers for type safety
          onTokenSelect={handleTokenToggle}
          onProtocolSelect={handleProtocolToggle}
          onResetFilters={handleResetFilters}
          allTokensForFilter={allTokensForFilter}
          allProtocolsForFilter={allProtocolsForFilter}
          blockNumber={blockNumber}
          startTime={lastBlockTimestamp} 
          duration={estimatedBlockDuration}
        />
        <PoolTable
          // Props for PoolTable will be adjusted when PoolTable.tsx is refactored
          // For now, ensure displayedPools is passed correctly
          displayedPools={poolsToDisplay} 
          highlightedPoolId={highlightedPoolId}
          selectedPoolId={selectedPool?.id}
          onPoolClick={handleRowClick}
          allVisibleColumns={COLUMNS}
          renderTokensText={renderTokensText} // Passing simplified text renderer
          renderFee={(pool: Pool) => `${parsePoolFee(pool)}%`} // Keep renderFee simple
          sortConfig={sortConfig}
          onSort={handleSort}
          summaryData={summaryData}
          onLoadMore={handleLoadMorePools}
          hasMorePools={displayedPoolsCount < processedPools.length}
          isLoadingMore={isLoadingMore} // Pass new loading state
          selectedChain={selectedChain} // Pass selected chain
        />
        </div> {/* Close content wrapper */}
      </div>

      {selectedPool && (
        <PoolDetailSidebar
          pool={selectedPool}
          onClose={() => {
            setSelectedPool(null);
            if (onPoolSelect) onPoolSelect(null); // Notify parent that selection is cleared
          }}
        />
      )}
    </div>
  );
};

export default ListView;
