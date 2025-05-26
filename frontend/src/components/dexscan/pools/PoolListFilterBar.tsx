import React, { useState, useMemo } from 'react'; // Added useState, useMemo
import { LucideX, LucideChevronDown, Search } from 'lucide-react'; // Added Search
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { renderHexId } from '@/lib/utils'; // Added renderHexId
import BlockProgressIcon from '@/components/dexscan/graph/BlockProgressIcon'; // Reusing from graph view
import { Token, Pool } from '../types'; // Import Token and Pool types
import TokenIcon from '../common/TokenIcon'; // Import shared TokenIcon

// Removed local TokenForFilter definition. Will use imported Token type.

interface PoolListFilterBarProps {
  // Filter state
  selectedTokens: Token[]; // Use imported Token type
  selectedProtocols: string[];
  selectedPoolIds: string[];
  
  // Callbacks to update filters in ListView
  onTokenSelect: (token: Token, isSelected: boolean) => void; // Use imported Token type
  onProtocolSelect: (protocol: string, isSelected: boolean) => void;
  onPoolIdSelect: (poolId: string, isSelected: boolean) => void; // Assuming similar multi-select for Pool IDs
  onPoolIdSearchChange?: (searchTerm: string) => void; // For live search in Pool ID popover if needed
  
  onResetFilters: () => void;
  
  // Data for populating filter options
  allTokensForFilter: Token[]; // Use imported Token type
  allProtocolsForFilter: string[];
  allPoolsForFilter: Pool[]; // Changed to pass full pool data
  
  blockNumber: number | null;
  // Renamed to match BlockProgressIconProps
  startTime?: number; 
  duration?: number; 
}

// Helper to format display text for Pool ID filter tag
const formatDisplayPoolIds = (ids: string[]): string => {
  if (ids.length === 0) return "Search Pool IDs...";
  if (ids.length === 1) {
    // Use a simplified version of renderHexId or similar for single ID
    const id = ids[0];
    return id.length > 10 ? `${id.substring(0, 6)}...${id.substring(id.length - 4)}` : id;
  }
  // First byte (0x + 2 chars = 4 chars)
  return `IDs: ${ids.map(id => id.substring(0, 4)).join(', ')}`;
};

const PoolListFilterBar: React.FC<PoolListFilterBarProps> = ({
  selectedTokens,
  selectedProtocols,
  selectedPoolIds,
  onTokenSelect,
  onProtocolSelect,
  onPoolIdSelect,
  onPoolIdSearchChange,
  onResetFilters,
  allTokensForFilter,
  allProtocolsForFilter,
  allPoolsForFilter,
  blockNumber,
  startTime, // Renamed
  duration,  // Renamed
}) => {
  // TODO: Implement popover content for each filter:
  // State for search terms within popovers
  const [tokenSearch, setTokenSearch] = useState('');
  // const [protocolSearch, setProtocolSearch] = useState('');
  const [poolIdSearch, setPoolIdSearch] = useState('');
  
  // State for infinite scroll in popovers
  const [displayedTokensCount, setDisplayedTokensCount] = useState(100);
  const [displayedPoolIdsCount, setDisplayedPoolIdsCount] = useState(100);
  const TOKENS_BATCH_SIZE = 100;
  const POOL_IDS_BATCH_SIZE = 100;

  const filteredTokens = useMemo(() => {
    // Reset displayed count when search changes
    setDisplayedTokensCount(100);
    return allTokensForFilter.filter(token => 
      token.symbol.toLowerCase().includes(tokenSearch.toLowerCase()) ||
      token.name?.toLowerCase().includes(tokenSearch.toLowerCase()) ||
      token.address.toLowerCase().includes(tokenSearch.toLowerCase())
    );
  }, [allTokensForFilter, tokenSearch]);

  const filteredPools = useMemo(() => {
    // Reset displayed count when search changes
    setDisplayedPoolIdsCount(100);
    const searchLower = poolIdSearch.toLowerCase();
    return allPoolsForFilter.filter(pool => 
      pool.id.toLowerCase().includes(searchLower) ||
      pool.tokens.some(token => 
        token.symbol.toLowerCase().includes(searchLower)
      )
    );
  }, [allPoolsForFilter, poolIdSearch]);

  const renderSelectedItemsPreview = (items: string[] | Token[], type: 'token' | 'protocol' | 'poolId') => {
    if (items.length === 0) {
      if (type === 'token') return 'Select Tokens...';
      if (type === 'protocol') return 'Select Protocol...';
      if (type === 'poolId') return 'Search Pool IDs...';
    }
    if (items.length === 1) {
      if (type === 'token') return (items[0] as Token).symbol; // Cast to Token
      if (type === 'protocol') return items[0] as string;
      if (type === 'poolId') return formatDisplayPoolIds([items[0] as string]);
    }
    if (type === 'poolId') return formatDisplayPoolIds(items as string[]);
    return `${items.length} selected`;
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-white/10"> {/* Adjusted border color */}
      <div className="flex items-center gap-2"> {/* Reduced gap for closer filter tags */}
        {/* Token Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8  border-[rgba(255,244,224,0.2)] bg-[rgba(255,244,224,0.02)] hover:bg-[rgba(255,244,224,0.06)] text-xs text-[rgba(255,244,224,1)]">
              {renderSelectedItemsPreview(selectedTokens, 'token')}
              {selectedTokens.length > 0 && (
                <LucideX className="ml-1 h-3 w-3" onClick={(e) => { e.stopPropagation(); selectedTokens.forEach(t => onTokenSelect(t, false)); }} />
              )}
              <LucideChevronDown className="ml-1 h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0 bg-[rgba(255,244,224,0.02)] backdrop-blur-[104px] border border-[rgba(255,244,224,0.12)] shadow-[0px_4px_16px_0px_rgba(37,0,63,0.2)]">
            <div className="p-2">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search token..."
                  className="pl-8 h-8 text-xs bg-[rgba(255,244,224,0.04)] border-[rgba(255,244,224,0.12)] text-[rgba(255,244,224,1)] placeholder:text-[rgba(255,244,224,0.4)] focus-visible:ring-[#FF3366] focus-visible:ring-1 focus-visible:border-[rgba(255,244,224,0.24)]"
                  value={tokenSearch}
                  onChange={(e) => setTokenSearch(e.target.value)}
                />
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgba(255,244,224,0.4)]" />
              </div>
            </div>
            <ScrollArea 
              className="h-[200px] p-2"
              onViewportScroll={(event) => {
                const target = event.currentTarget;
                if (target.scrollHeight - target.scrollTop - target.clientHeight < 50) {
                  setDisplayedTokensCount(prev => Math.min(prev + TOKENS_BATCH_SIZE, filteredTokens.length));
                }
              }}
            >
              {filteredTokens.length === 0 && <p className="text-xs text-[rgba(255,244,224,0.4)] text-center py-2">No tokens found.</p>}
              {filteredTokens.slice(0, displayedTokensCount).map(token => {
                const isSelected = selectedTokens.some(st => st.address === token.address);
                return (
                  <div 
                    key={token.address} 
                    className="flex items-center space-x-2 p-1.5 rounded-md hover:bg-[rgba(255,244,224,0.06)] cursor-pointer"
                    onClick={() => onTokenSelect(token, !isSelected)}
                  >
                    <Checkbox
                      id={`token-${token.address}`}
                      checked={isSelected}
                      onCheckedChange={(checked) => onTokenSelect(token, !!checked)}
                      className="border-[rgba(255,244,224,0.64)] data-[state=checked]:bg-[#FF3366] data-[state=checked]:border-[#FF3366] data-[state=checked]:text-white rounded-none"
                    />
                    <TokenIcon token={token} size={5} /> 
                    <label 
                      htmlFor={`token-${token.address}`}
                      className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 truncate text-[rgba(255,244,224,1)]"
                      title={`${token.name} (${token.symbol})`}
                    >
                      {token.symbol} <span className="text-[rgba(255,244,224,1)] text-xs">{token.name}</span>
                    </label>
                  </div>
                );
              })}
            </ScrollArea>
          </PopoverContent>
        </Popover>

        {/* Protocol Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8  border-[rgba(255,244,224,0.2)] bg-[rgba(255,244,224,0.02)] hover:bg-[rgba(255,244,224,0.06)] text-xs text-[rgba(255,244,224,1)]">
              {renderSelectedItemsPreview(selectedProtocols, 'protocol')}
              {selectedProtocols.length > 0 && (
                <LucideX className="ml-1 h-3 w-3" onClick={(e) => { e.stopPropagation(); selectedProtocols.forEach(p => onProtocolSelect(p, false)); }} />
              )}
              <LucideChevronDown className="ml-1 h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0 bg-[rgba(255,244,224,0.02)] backdrop-blur-[104px] border border-[rgba(255,244,224,0.12)] shadow-[0px_4px_16px_0px_rgba(37,0,63,0.2)]">
            <ScrollArea className="h-[200px] p-2">
              {allProtocolsForFilter.length === 0 && <p className="text-xs text-[rgba(255,244,224,0.4)] text-center py-2">No protocols available.</p>}
              {allProtocolsForFilter.map(protocol => {
                const isSelected = selectedProtocols.includes(protocol);
                return (
                  <div 
                    key={protocol}
                    className="flex items-center space-x-2 p-1.5 rounded-md hover:bg-[rgba(255,244,224,0.06)] cursor-pointer"
                    onClick={() => onProtocolSelect(protocol, !isSelected)}
                  >
                    <Checkbox
                      id={`protocol-${protocol}`}
                      checked={isSelected}
                      onCheckedChange={(checked) => onProtocolSelect(protocol, !!checked)}
                      className="border-[rgba(255,244,224,0.64)] data-[state=checked]:bg-[#FF3366] data-[state=checked]:border-[#FF3366] data-[state=checked]:text-white rounded-none"
                    />
                    <label 
                      htmlFor={`protocol-${protocol}`}
                      className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[rgba(255,244,224,1)]"
                    >
                      {protocol}
                    </label>
                  </div>
                );
              })}
            </ScrollArea>
          </PopoverContent>
        </Popover>

        {/* Pool ID Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8  border-[rgba(255,244,224,0.2)] bg-[rgba(255,244,224,0.02)] hover:bg-[rgba(255,244,224,0.06)] text-xs text-[rgba(255,244,224,1)]">
              {renderSelectedItemsPreview(selectedPoolIds, 'poolId')}
              {selectedPoolIds.length > 0 && (
                <LucideX className="ml-1 h-3 w-3" onClick={(e) => { e.stopPropagation(); selectedPoolIds.forEach(pid => onPoolIdSelect(pid, false)); }} />
              )}
              <LucideChevronDown className="ml-1 h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0 bg-[rgba(255,244,224,0.02)] backdrop-blur-[104px] border border-[rgba(255,244,224,0.12)] shadow-[0px_4px_16px_0px_rgba(37,0,63,0.2)]">
            <div className="p-2">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search pool ID or tokens..."
                  className="pl-8 h-8 text-xs bg-[rgba(255,244,224,0.04)] border-[rgba(255,244,224,0.12)] text-[rgba(255,244,224,1)] placeholder:text-[rgba(255,244,224,0.4)] focus-visible:ring-[#FF3366] focus-visible:ring-1 focus-visible:border-[rgba(255,244,224,0.24)]"
                  value={poolIdSearch}
                  onChange={(e) => {
                    setPoolIdSearch(e.target.value);
                    if (onPoolIdSearchChange) onPoolIdSearchChange(e.target.value); // Optional: for more complex search/fetch
                  }}
                />
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgba(255,244,224,0.4)]" />
              </div>
            </div>
            <ScrollArea 
              className="h-[200px] p-2"
              onViewportScroll={(event) => {
                const target = event.currentTarget;
                if (target.scrollHeight - target.scrollTop - target.clientHeight < 50) {
                  setDisplayedPoolIdsCount(prev => Math.min(prev + POOL_IDS_BATCH_SIZE, filteredPools.length));
                }
              }}
            >
              {filteredPools.length === 0 && <p className="text-xs text-[rgba(255,244,224,0.4)] text-center py-2">No pools found.</p>}
              {filteredPools.slice(0, displayedPoolIdsCount).map(pool => {
                const isSelected = selectedPoolIds.includes(pool.id);
                const tokenPair = pool.tokens.map(t => t.symbol).join(' / ');
                return (
                  <div 
                    key={pool.id}
                    className="flex items-center space-x-2 p-1.5 rounded-md hover:bg-[rgba(255,244,224,0.06)] cursor-pointer"
                    onClick={() => onPoolIdSelect(pool.id, !isSelected)}
                  >
                    <Checkbox
                      id={`poolId-${pool.id}`}
                      checked={isSelected}
                      onCheckedChange={(checked) => onPoolIdSelect(pool.id, !!checked)}
                      className="border-[rgba(255,244,224,0.64)] data-[state=checked]:bg-[#FF3366] data-[state=checked]:border-[#FF3366] data-[state=checked]:text-white rounded-none"
                    />
                    <label 
                      htmlFor={`poolId-${pool.id}`}
                      className="text-xs leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[rgba(255,244,224,1)] flex-1 min-w-0"
                      title={`${pool.id} (${tokenPair})`}
                    >
                      <span className="font-mono">{renderHexId(pool.id)}</span>
                      <span className="ml-1 text-[rgba(255,244,224,0.8)]">({tokenPair})</span>
                    </label>
                  </div>
                );
              })}
            </ScrollArea>
          </PopoverContent>
        </Popover>

        <Button variant="link" size="sm" className="h-8 text-xs text-[rgba(255,244,224,0.64)] hover:text-[rgba(255,244,224,1)] underline-offset-2" onClick={onResetFilters}>
          Reset filters
        </Button>
      </div>

      <div className="flex items-center gap-2">
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