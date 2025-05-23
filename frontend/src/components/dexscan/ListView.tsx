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

// TokenForFilter interface is removed. Using 'Token' from './types' directly.

interface ListViewFilters { // No export
  selectedTokens: Token[]; // Use imported Token type
  selectedProtocols: string[];
  selectedPoolIds: string[];
}

// Updated COLUMNS definition based on plan
const COLUMNS = [
  { id: 'tokens', name: 'Tokens', type: 'tokens' }, // Non-sortable
  { id: 'id', name: 'Pool ID', type: 'poolId' },     // Non-sortable
  { id: 'protocol_system', name: 'Protocol', type: 'protocol' }, // Sortable
  { id: 'static_attributes.fee', name: 'Fee rate', type: 'fee' },    // Sortable
  { id: 'spotPrice', name: 'Spot Price', type: 'number' },  // Sortable
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
  return pool.tokens.map(token => token.symbol).join(' / ');
};

const ListView = ({ pools, className, highlightedPoolId, onPoolSelect }: PoolListViewProps) => {
  const { blockNumber, lastBlockTimestamp, estimatedBlockDuration } = usePoolData();
  
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [sortConfig, setSortConfig] = useState<{column: string, direction: 'asc' | 'desc'}>({
    column: 'protocol_system', // Default sort by a sortable column
    direction: 'asc'
  });
  const [filters, setFilters] = useState<ListViewFilters>({
    selectedTokens: [],
    selectedProtocols: [],
    selectedPoolIds: []
  });
  const [displayedPoolsCount, setDisplayedPoolsCount] = useState(INITIAL_DISPLAY_COUNT);

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

  const allPoolIdsForFilter = useMemo(() => 
    pools.map(pool => pool.id).sort(),
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

  const filterPools = useCallback((poolsToFilter: Pool[]) => {
    return poolsToFilter.filter(pool => {
      const tokenMatch = filters.selectedTokens.length === 0 ||
        filters.selectedTokens.some(st => pool.tokens.some(pt => pt.address === st.address));
      
      const protocolMatch = filters.selectedProtocols.length === 0 ||
        filters.selectedProtocols.includes(pool.protocol_system);
      
      const poolIdMatch = filters.selectedPoolIds.length === 0 ||
        filters.selectedPoolIds.includes(pool.id);
      
      return tokenMatch && protocolMatch && poolIdMatch;
    });
  }, [filters]);

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

  const handleFilterChange = useCallback(
    (filterKey: keyof ListViewFilters, value: any, isSelected?: boolean) => {
      setFilters(prev => {
        const newFilters = { ...prev };
        if (filterKey === 'selectedTokens') {
          const token = value as Token; // Use imported Token type
          if (isSelected) {
            newFilters.selectedTokens = [...prev.selectedTokens, token];
          } else {
            newFilters.selectedTokens = prev.selectedTokens.filter(t => t.address !== token.address);
          }
        } else if (filterKey === 'selectedProtocols' || filterKey === 'selectedPoolIds') {
          const item = value as string;
          if (isSelected) {
            (newFilters[filterKey] as string[]).push(item);
          } else {
            newFilters[filterKey] = (prev[filterKey] as string[]).filter(i => i !== item);
          }
        }
        return newFilters;
      });
      setDisplayedPoolsCount(INITIAL_DISPLAY_COUNT); // Reset display count on filter change
    }, []);
  
  const handleResetFilters = useCallback(() => {
    setFilters({
      selectedTokens: [],
      selectedProtocols: [],
      selectedPoolIds: []
    });
    setDisplayedPoolsCount(INITIAL_DISPLAY_COUNT);
  }, []);


  useEffect(() => {
    if (highlightedPoolId) {
      const pool = pools.find(p => p.id === highlightedPoolId);
      setSelectedPool(pool || null);
    } else {
      setSelectedPool(null); // Clear selection if highlightedPoolId is null
    }
  }, [highlightedPoolId, pools]);

  const handleLoadMorePools = useCallback(() => {
    setDisplayedPoolsCount(prevCount => 
      Math.min(prevCount + POOL_LOAD_BATCH_SIZE, processedPools.length)
    );
  }, [processedPools.length]);

  const poolsToDisplay = useMemo(() => 
    processedPools.slice(0, displayedPoolsCount),
  [processedPools, displayedPoolsCount]);

  // Helper for PoolListFilterBar props
  // Simplified onFilterItemSelect, directly using handleFilterChange structure
  // This generic helper might be causing type inference issues, let's simplify calls to handleFilterChange


  return (
    <div className={cn("relative flex flex-col h-full", className)}> {/* Added relative for sidebar positioning */}
      {/* Main Content Panel with TC Design Styling */}
      <div className="flex-grow flex flex-col bg-[rgba(255,244,224,0.02)] backdrop-blur-xl rounded-xl border border-[rgba(255,244,224,0.64)] overflow-hidden shadow-2xl"> {/* TC Design Styling */}
        <PoolListFilterBar
          selectedTokens={filters.selectedTokens}
          selectedProtocols={filters.selectedProtocols}
          selectedPoolIds={filters.selectedPoolIds}
          // Pass specific handlers for type safety
          onTokenSelect={(token, isSelected) => handleFilterChange('selectedTokens', token, isSelected)}
          onProtocolSelect={(protocol, isSelected) => handleFilterChange('selectedProtocols', protocol, isSelected)}
          onPoolIdSelect={(poolId, isSelected) => handleFilterChange('selectedPoolIds', poolId, isSelected)}
          onResetFilters={handleResetFilters}
          allTokensForFilter={allTokensForFilter}
          allProtocolsForFilter={allProtocolsForFilter}
          allPoolIdsForFilter={allPoolIdsForFilter}
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
        />
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
