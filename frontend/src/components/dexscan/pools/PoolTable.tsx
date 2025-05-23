import React, { useRef, useCallback, memo, useEffect, useState } from 'react'; // Added memo, useEffect, useState
import { 
  Table, TableHeader, TableBody, TableRow, 
  TableHead, TableCell 
} from '@/components/ui/table';
import { ExternalLink, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'; // Added ChevronsUpDown
import { cn, renderHexId, getExternalLink, formatTimeAgo } from '@/lib/utils';
import { Pool, Token } from '../types';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { getCoinId, getCoinImageURL } from '@/lib/coingecko'; // Import coingecko utils
import TokenIcon from '../common/TokenIcon'; // Import the new TokenIcon component
import ProtocolLogo from '../common/ProtocolLogo'; // Import the new ProtocolLogo component

// Helper function for column widths
const getColumnWidthClass = (columnId: string): string => {
  switch (columnId) {
    case 'tokens':
      return 'min-w-[240px] w-1/3'; // Figma: fill
    case 'id': // Pool ID
      return 'w-[150px]';         // Figma: hug content (address + icon)
    case 'protocol_system':
      return 'min-w-[160px] w-1/6'; // Figma: hug content (logo + name)
    case 'static_attributes.fee': // Fee Rate
      return 'w-[100px]';         // Figma: hug content (percentage)
    case 'spotPrice':
      return 'w-[140px]';         // Figma: hug content (price figures)
    case 'updatedAt':
      return 'w-[180px]';         // Figma: hug content (timestamps/dates)
    default:
      return 'w-auto';            // Fallback
  }
};

// --- StackedTokenIcons Component (uses imported TokenIcon) ---
const StackedTokenIcons: React.FC<{ tokens: Token[] }> = ({ tokens }) => {
  return (
    <div className="flex -space-x-2">
      {tokens.slice(0, 3).map((token) => (
        <TokenIcon key={token.address || token.symbol} token={token} size={6} />
      ))}
      {tokens.length > 3 && (
        <div className="w-6 h-6 rounded-full bg-gray-600 border-2 border-gray-800 flex items-center justify-center text-xs">
          +{tokens.length - 3}
        </div>
      )}
    </div>
  );
};

// ProtocolLogo component is now imported.

interface PoolTableProps {
  displayedPools: Pool[]; // Changed from paginatedPools
  highlightedPoolId?: string | null;
  selectedPoolId?: string | null;
  onPoolClick: (pool: Pool) => void;
  allVisibleColumns: Array<{ id: string; name: string; type: string }>;
  renderTokensText: (pool: Pool) => string; // For text part of tokens cell
  renderFee: (pool: Pool) => string; // Kept for consistency if needed, or direct parse
  sortConfig: { column: string; direction: 'asc' | 'desc' }; // sortConfig is required now
  onSort: (columnId: string) => void; // onSort is required
  summaryData: { // New prop for summary row
    totalPools: number;
    totalUniqueTokens: number;
    totalProtocols: number;
  };
  onLoadMore: () => void; // For infinite scroll
  hasMorePools: boolean; // To know if more pools can be loaded
}

const PoolTable: React.FC<PoolTableProps> = ({ 
  displayedPools, 
  highlightedPoolId, 
  selectedPoolId, 
  onPoolClick,
  allVisibleColumns,
  renderTokensText, // Will be used alongside StackedTokenIcons
  renderFee,
  sortConfig,
  onSort,
  summaryData,
  onLoadMore,
  hasMorePools
}) => {
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  
  const sortableColumns = ['protocol_system', 'static_attributes.fee', 'spotPrice', 'updatedAt'];

  // Effect for attaching scroll listener for infinite scroll
  useEffect(() => {
    const viewport = scrollViewportRef.current;
    if (!viewport) return;

    const handleScroll = () => {
      if (!hasMorePools) return;
      // Check if scrolled to near the bottom
      if (viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 200) { // Threshold of 200px
        onLoadMore();
      }
    };

    viewport.addEventListener('scroll', handleScroll);
    return () => viewport.removeEventListener('scroll', handleScroll);
  }, [hasMorePools, onLoadMore]); // Rerun if these change

  return (
    <div className="w-full flex-grow flex flex-col overflow-hidden"> {/* Ensure table container can grow and scroll */}
      {/* Filter inputs removed, now in PoolListFilterBar */}
      
      <ScrollArea 
        className="w-full flex-grow" 
      >
        {/* The direct child of ScrollArea is the one that gets the scrollbar.
            We need to attach the ref to this viewport element.
            Shadcn's ScrollArea renders a div with data-radix-scroll-area-viewport=""
            We will assign the ref to the outer div that we control.
        */}
        <div 
          className="w-full min-w-max h-full" // Ensure this div takes up scrollable height
          ref={scrollViewportRef} // Attach ref here
          style={{ overflowY: 'auto' }} // Make this div itself scrollable if ScrollArea doesn't do it as expected
        >
          <Table className="table-auto">
            <TableHeader>
              <TableRow className="border-b border-white/10 sticky top-0 bg-neutral-900 z-10"> 
                {allVisibleColumns.map((column) => {
                  const isSortable = sortableColumns.includes(column.id);
                  return (
                    <TableHead 
                      key={column.id}
                      className={cn(
                        "p-4 text-xs font-medium text-white/60", // TC Design: Inter, 500, 13px, rgba(255,244,224,0.64)
                        isSortable && "cursor-pointer hover:text-white/80",
                        getColumnWidthClass(column.id) // Apply dynamic width class
                      )}
                      onClick={() => isSortable && onSort(column.id)}
                    >
                      <div className="flex items-center gap-1">
                        <span>{column.name}</span>
                        {isSortable && (
                          sortConfig.column === column.id ? (
                            sortConfig.direction === 'asc' ? 
                              <ChevronUp className="h-3 w-3" /> : 
                              <ChevronDown className="h-3 w-3" />
                          ) : (
                            <ChevronsUpDown className="h-3 w-3 text-white/40" /> // Always visible for sortable
                          )
                        )}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
              {/* Summary Row */}
              <TableRow className="border-b border-white/10 bg-white/5">
                {allVisibleColumns.map(column => (
                  <TableCell key={`summary-${column.id}`} className="p-2 px-4 text-sm font-semibold text-white"> {/* TC Design: Inter, 600, 16px, #FFF4E0, padding 8px 16px */}
                    {column.id === 'tokens' && (
                      <div className="flex flex-col">
                        <span>Summary</span>
                        <span className="text-xs font-normal text-white/70">{summaryData.totalUniqueTokens} Unique Tokens</span>
                      </div>
                    )}
                    {column.id === 'id' && <span>{summaryData.totalPools} Pools</span>}
                    {column.id === 'protocol_system' && <span>{summaryData.totalProtocols} Protocols</span>}
                    {/* Other summary cells can be empty or show '-' */}
                    {['static_attributes.fee', 'spotPrice', 'updatedAt'].includes(column.id) && <span>-</span>}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedPools.length > 0 ? (
                displayedPools.map((pool) => {
                  const isRowSelected = pool.id === selectedPoolId;
                  // Highlighted is for a different purpose, usually from graph interaction
                  // const isRowHighlighted = pool.id === highlightedPoolId && !isRowSelected;

                  return (
                    <TableRow 
                      key={pool.id}
                      id={`pool-row-${pool.id}`}
                      className={cn(
                        "cursor-pointer border-b border-white/20", // TC Design border
                        isRowSelected 
                          ? "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-gray-200" // TC Design: whitish bg, black text
                          : "hover:bg-white/5"
                      )}
                      onClick={() => onPoolClick(pool)}
                    >
                      {allVisibleColumns.map((column) => {
                        let displayValue: React.ReactNode;
                        
                        if (column.id === 'tokens') {
                          displayValue = (
                            <div className="flex items-center gap-2">
                              <StackedTokenIcons tokens={pool.tokens} />
                              <span className={cn("text-sm", isRowSelected ? "text-gray-800" : "text-white")}>{renderTokensText(pool)}</span>
                            </div>
                          );
                        } else if (column.id === 'id') {
                          const linkUrl = getExternalLink(pool);
                          displayValue = (
                            <div className="flex items-center gap-1">
                              <span className={cn("font-mono text-xs", isRowSelected ? "text-gray-700" : "text-white/80")}>{renderHexId(pool.id)}</span>
                              {linkUrl && (
                                <a
                                  href={linkUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={cn("text-white/60 hover:text-white/80", isRowSelected && "text-gray-600 hover:text-gray-700")}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          );
                        } else if (column.id === 'protocol_system') {
                          displayValue = (
                            <div className="flex items-center gap-2">
                              <ProtocolLogo protocolName={pool.protocol_system} />
                              <span className={cn("text-sm", isRowSelected ? "text-gray-800" : "text-white")}>{pool.protocol_system}</span>
                            </div>
                          );
                        } else if (column.id === 'static_attributes.fee') {
                          displayValue = <span className={cn("text-sm", isRowSelected ? "text-gray-800" : "text-white")}>{renderFee(pool)}</span>;
                        } else if (column.id === 'spotPrice') {
                          displayValue = <span className={cn("text-sm", isRowSelected ? "text-gray-800" : "text-white")}>{pool.spotPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 18 }) ?? '-'}</span>;
                        } else if (column.id === 'updatedAt') {
                          displayValue = <span className={cn("text-sm", isRowSelected ? "text-gray-800" : "text-white/80")}>{formatTimeAgo(pool.updatedAt)}</span>;
                        } else {
                          displayValue = '-';
                        }
                        
                        return (
                          <TableCell 
                            key={column.id} 
                            className={cn(
                              "p-4 text-sm", // TC Design: Inter, 400/500, 14px, #FFF4E0
                              column.type === 'number' && "text-right",
                              isRowSelected ? "text-gray-800" : "text-white"
                            )}
                          >
                            {displayValue}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={allVisibleColumns.length} className="h-24 text-center text-white/60">
                    No pools match your filter criteria.
                  </TableCell>
                </TableRow>
              )}
              {/* "Load More" button removed, relying on scroll detection */}
            </TableBody>
          </Table>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default memo(PoolTable);
