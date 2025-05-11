import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn, formatPoolId, getExternalLink } from '@/lib/utils';
import { Pool } from './types';
import SwapSimulator from './SwapSimulator';
import MetricsCards from './pools/MetricsCards';
import PoolTable from './pools/PoolTable';
import TablePagination from './pools/TablePagination';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

interface PoolListViewProps {
  pools: Pool[];
  className?: string;
  highlightedPoolId?: string | null;
  onPoolSelect?: (poolId: string | null) => void;
}
const renderTokens = (pool: Pool) => {
  return pool.tokens.map(token => {
    const address = token.address || '';
    // Get first and last byte if address is available
    const firstByte = address ? address.slice(2, 4) : '';
    const lastByte = address ? address.slice(-2) : '';
    
    return `${token.symbol}${firstByte && lastByte ? ` (0x${firstByte}..${lastByte})` : ''}`;
  }).join(' / ');
};

const POOLS_PER_PAGE = 10;

const COLUMNS = [
  { id: 'id', name: 'Pool address', type: 'string' },
  { id: 'tokens', name: 'Tokens', type: 'tokens' },
  { id: 'protocol_system', name: 'Protocol', type: 'string' },
  { id: 'static_attributes.fee', name: 'Fee Rate', type: 'fee' },
  { id: 'spotPrice', name: 'Spot Price', type: 'number' },
  { id: 'created_at', name: 'Created At', type: 'date' },
  { id: 'updatedAt', name: 'Updated At', type: 'date' },
  { id: 'lastUpdatedAtBlock', name: 'Last Block', type: 'number' }
];

const ListView = ({ pools, className, highlightedPoolId, onPoolSelect }: PoolListViewProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [sortConfig, setSortConfig] = useState<{column: string, direction: 'asc' | 'desc'}>({
    column: 'id',
    direction: 'asc'
  });
  const [filters, setFilters] = useState({
    tokens: '',
    protocol_system: '',
    poolId: ''
  });

  const uniqueProtocols = useMemo(() =>
    Array.from(new Set(pools.map(pool => pool.protocol_system))).filter(Boolean) as string[], [pools]
  );

  // Count unique tokens across all pools
  const uniqueTokens = useMemo(() => {
    const tokenAddresses = new Set<string>();

    pools.forEach(pool => {
      if (pool.tokens) {
        pool.tokens.forEach(token => {
          if (token.address) {
            tokenAddresses.add(token.address);
          }
        });
      }
    });

    return tokenAddresses.size;
  }, [pools]);

  const overallMetrics = useMemo(() => ({
    totalPools: pools.length,
    totalProtocols: uniqueProtocols.length,
    totalUniqueTokens: uniqueTokens,
  }), [pools, uniqueProtocols, uniqueTokens]);

  // Sort function for pools
  const sortPools = useCallback((poolsToSort: Pool[]) => {
    return [...poolsToSort].sort((a, b) => {
      let valueA, valueB;
      
      // Extract values based on column id
      if (sortConfig.column === 'id') {
        valueA = a.id;
        valueB = b.id;
      } else if (sortConfig.column === 'tokens') {
        valueA = a.tokens.map(t => t.symbol).join('-');
        valueB = b.tokens.map(t => t.symbol).join('-');
      } else if (sortConfig.column === 'protocol_system') {
        valueA = a.protocol_system;
        valueB = b.protocol_system;
      } else if (sortConfig.column === 'static_attributes.fee') {
        // Use the shared parsePoolFee function for consistent fee calculation
        valueA = parsePoolFee(a);
        valueB = parsePoolFee(b);
      } else if (sortConfig.column === 'spotPrice') {
        valueA = a.spotPrice || 0;
        valueB = b.spotPrice || 0;
      } else if (sortConfig.column === 'created_at') {
        valueA = new Date(a.created_at).getTime();
        valueB = new Date(b.created_at).getTime();
      } else if (sortConfig.column === 'updatedAt') {
        valueA = new Date(a.updatedAt).getTime();
        valueB = new Date(b.updatedAt).getTime();
      } else if (sortConfig.column === 'lastUpdatedAtBlock') {
        valueA = a.lastUpdatedAtBlock || 0;
        valueB = b.lastUpdatedAtBlock || 0;
      } else {
        valueA = a[sortConfig.column as keyof Pool];
        valueB = b[sortConfig.column as keyof Pool];
      }
      
      // Compare values
      if (sortConfig.column === 'static_attributes.fee' || sortConfig.column === 'spotPrice' || sortConfig.column === 'lastUpdatedAtBlock') {
        // Ensure numerical comparison for fee and spot price
        const numA = typeof valueA === 'number' ? valueA : 0;
        const numB = typeof valueB === 'number' ? valueB : 0;
        return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
      } else if (sortConfig.column === 'created_at' || sortConfig.column === 'updatedAt') {
        // Already converted to timestamps above
        return sortConfig.direction === 'asc' ? valueA - valueB : valueB - valueA;
      } else if (typeof valueA === 'string' && typeof valueB === 'string') {
        // Lexicographical comparison for strings
        const result = valueA.localeCompare(valueB);
        return sortConfig.direction === 'asc' ? result : -result;
      } else {
          throw new Error('ERR_BUG');
      }
    });
  }, [sortConfig]);

  // Filter function for pools
  const filterPools = useCallback((poolsToFilter: Pool[]) => {
    return poolsToFilter.filter(pool => {
      // Filter by tokens using the same rendered format as display
      const tokenMatch = !filters.tokens || 
        renderTokens(pool).toLowerCase().includes(filters.tokens.toLowerCase());
      
      // Filter by protocol
      const protocolMatch = !filters.protocol_system || 
        pool.protocol_system.toLowerCase().includes(filters.protocol_system.toLowerCase());
      
      // Filter by pool ID/address
      const poolIdMatch = !filters.poolId || 
        pool.id.toLowerCase().includes(filters.poolId.toLowerCase());
      
      return tokenMatch && protocolMatch && poolIdMatch;
    });
  }, [filters]);

  // Sort & filter the pools before pagination
  const processedPools = useMemo(() => {
    console.log("Processing pools in useMemo", new Date().toISOString());
    const filtered = filterPools(pools);
    return sortPools(filtered);
  }, [pools, filterPools, sortPools]);

  const handleRowClick = (pool: Pool) => {
    const newSelection = selectedPool?.id === pool.id ? null : pool;
    setSelectedPool(newSelection);
    if (onPoolSelect) {
      onPoolSelect(newSelection?.id || null);
    }
  };

  const handleSort = useCallback((column: string) => {
    setSortConfig(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1); // Reset to first page when sorting changes
  }, []);

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  // Handle selected pool state separately from pagination
  useEffect(() => {
    if (highlightedPoolId) {
      const poolIndex = pools.findIndex(pool => pool.id === highlightedPoolId);
      if (poolIndex >= 0) {
        setSelectedPool(pools[poolIndex]);
      }
    }
  }, [highlightedPoolId, pools]);

  const totalPages = Math.ceil(processedPools.length / POOLS_PER_PAGE);
  const startIndex = (currentPage - 1) * POOLS_PER_PAGE;
  const paginatedPools = processedPools.slice(startIndex, startIndex + POOLS_PER_PAGE);
  
  // console.log('Paginated pools for table:', paginatedPools.length, 'pools (page', currentPage, 'of', totalPages, ')');



  const renderFee = (pool: Pool) => {
    
    const feeValue = parsePoolFee(pool);
    
    if (isNaN(feeValue)) {
      console.log('Invalid fee value:', pool.id, 'static_attributes: ', pool.static_attributes);
      return 'NaN%';
    }
    
    return `${feeValue}%`;
  };

  return (
    <div className={cn("space-y-4 flex flex-col h-full", className)}>
      <MetricsCards
        totalPools={overallMetrics.totalPools}
        totalProtocols={overallMetrics.totalProtocols}
        totalUniqueTokens={overallMetrics.totalUniqueTokens}
      />

      <Card className="flex-grow">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            List View 
            {processedPools.length !== pools.length && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({processedPools.length} pools)
              </span>
            )}
          </h2>
          <div className="space-y-4">

            {/* Filter Results */}
            <div className="bg-secondary/30 rounded-lg">
              <div className="p-0">
                <PoolTable
                  paginatedPools={paginatedPools}
                  highlightedPoolId={highlightedPoolId}
                  selectedPoolId={selectedPool?.id}
                  onPoolClick={handleRowClick}
                  allVisibleColumns={COLUMNS}
                  renderTokens={renderTokens}
                  renderFee={renderFee}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  onFilter={handleFilterChange}
                  filters={filters}
                />
              </div>

              <div className="p-2 w-full flex justify-center">
                <TablePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedPool ? (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col space-y-4">
              <h2 className="text-xl font-semibold">Pool Detail</h2>

              {/* Pool Info Card */}
              <div className="border rounded-lg p-4 bg-muted/10">
                <div className="flex flex-col space-y-3">
                  {/* Pool Address Section */}
                  <div>
                    <h3 className="text-sm text-muted-foreground mb-1">Pool address</h3>
                    <div className="flex items-center">
                      <TooltipProvider delayDuration={150}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="font-mono text-lg font-medium">{formatPoolId(selectedPool.id)}</span>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p className="font-mono flex items-center justify-between">
                              <span>{selectedPool.id}</span>
                              <button
                                className="ml-2 text-xs text-muted-foreground hover:text-primary"
                                onClick={() => {
                                  navigator.clipboard.writeText(selectedPool.id);
                                }}
                              >
                                Copy
                              </button>
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      {/* Protocol-specific link */}
                      {getExternalLink(selectedPool) && (
                        <a
                          href={getExternalLink(selectedPool)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-blue-500 hover:text-blue-700 inline-flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            className="h-4 w-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                          </svg>
                        </a>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Protocol: <span className="font-medium">{selectedPool.protocol_system}</span>
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Last Updated at Block: <span className="font-medium">{selectedPool.lastUpdatedAtBlock?.toLocaleString() || 'Unknown'}</span>
                    </p>
                  </div>

                  {/* Tokens Section */}
                  <div className="mt-2">
                    <h4 className="text-sm text-muted-foreground mb-2">Tokens</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedPool.tokens.map((token, index) => (
                        <div key={token.address || index}>
                          <h5 className="text-sm text-muted-foreground mb-1">Token {index + 1}</h5>
                          <div className="flex items-center">
                            <span className="font-medium">{token.symbol}</span>
                            {token.address && (
                              <a
                                href={`https://etherscan.io/token/${token.address}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-2 text-blue-500 hover:text-blue-700 inline-flex items-center"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                  className="h-4 w-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                  <polyline points="15 3 21 3 21 9"></polyline>
                                  <line x1="10" y1="14" x2="21" y2="3"></line>
                                </svg>
                              </a>
                            )}
                          </div>
                          {token.address && (
                            <div className="mt-1">
                              <span className="font-mono text-xs text-muted-foreground">
                                {formatPoolId(token.address)}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <SwapSimulator
                poolId={selectedPool.id}
                protocol={selectedPool.protocol_system}
                tokens={selectedPool.tokens.map(token => ({
                  symbol: token.symbol,
                  address: token.address
                }))}
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col items-center justify-center py-6">
              <h2 className="text-xl font-semibold mb-2">Pool Detail</h2>
              <p className="text-muted-foreground">Select a pool to view details</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Extract fee parsing logic into a reusable function that handles different protocols
export const parsePoolFee = (pool: Pool): number => {
  // Special case for Uniswap V4 pools
  if (pool.protocol_system === 'uniswap_v4' && pool.static_attributes['key_lp_fee']) {
    return parseFeeHexValue(pool, pool.static_attributes['key_lp_fee']);
  }
  
  // Regular case for other protocols
  return parseFeeHexValue(pool, pool.static_attributes?.fee);
};

// Helper to parse hex fee value to percentage
export const parseFeeHexValue = (pool: Pool, feeHex: string): number => {
  if (!feeHex) return 0;
  
  // Convert hex to decimal
  const feeDecimal = parseInt(feeHex, 16);
  
  // Handle protocol-specific fee formats
  if (pool.protocol_system === 'uniswap_v2') {
    // For uniswap_v2, fee is in basis points, so divide by 100
    return isNaN(feeDecimal) ? 0 : feeDecimal / 100;
  } else if (pool.protocol_system === 'vm:balancer_v2') {
    // For balancer_v2, fee is in 1e18 format, convert to percentage
    return isNaN(feeDecimal) ? 0 : (feeDecimal / 1e18) * 100;
  }
  
  // For other protocols (uniswap_v3 and uniswap_v4)
  // pools have fees in unit of basis point scaled by 100x
  const feeValue = feeDecimal / 10000;
  return isNaN(feeValue) ? 0 : feeValue;
};

export default ListView;