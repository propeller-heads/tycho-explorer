import React, { memo, useEffect, useState } from 'react';
import { 
  Table, TableHeader, TableBody, TableRow, 
  TableHead, TableCell 
} from '@/components/ui/table';
import { ExternalLink, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { cn, renderHexId, getExternalLink, formatTimeAgo, formatSpotPrice } from '@/lib/utils';
import { Pool, Token } from '@/components/dexscan/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import TokenIcon from '@/components/dexscan/common/TokenIcon';
import ProtocolLogo from '@/components/dexscan/common/ProtocolLogo';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { getReadableProtocolName } from '@/components/dexscan/common/readableProtocols';

// Helper function for column widths
const getColumnWidthClass = (columnId: string): string => {
  switch (columnId) {
    case 'tokens':
      return 'w-[200px]'; // Figma: fill
    case 'id': // Pool ID
      return 'w-[140px]';         // Figma: hug content (address + icon)
    case 'protocol_system':
      return 'w-[120px]'; // Figma: hug content (logo + name)
    case 'static_attributes.fee': // Fee Rate
      return 'w-[80px]';         // Figma: hug content (percentage)
    case 'spotPrice':
      return 'w-[100px]';         // Figma: hug content (price figures)
    case 'updatedAt':
      return 'w-[140px]';         // Figma: hug content (timestamps/dates)
    default:
      return 'w-auto';            // Fallback
  }
};

// --- StackedTokenIcons Component (uses imported TokenIcon) ---
const StackedTokenIcons: React.FC<{ tokens: Token[] }> = ({ tokens }) => {
  return (
    <div className="flex -space-x-2">
      {tokens.slice(0, 3).map((token) => (
        <TokenIcon key={token.address || token.symbol} token={token} size={8} />
      ))}
      {tokens.length > 3 && (
        <div className="w-6 h-6 rounded-full bg-[rgba(255,255,255,0.02)] border-2 border-[rgba(255,255,255,0.02)] flex items-center justify-center text-xs text-[#FFFFFF]">
          +{tokens.length - 3}
        </div>
      )}
    </div>
  );
};

// ProtocolLogo component is now imported.

interface PoolTableProps {
  displayedPools: Pool[];
  highlightedPoolId?: string | null;
  selectedPoolId?: string | null;
  onPoolClick: (pool: Pool) => void;
  allVisibleColumns: Array<{ id: string; name: string; type: string }>;
  renderTokensText: (pool: Pool) => string;
  renderFee: (pool: Pool) => string;
  sortConfig: { column: string; direction: 'asc' | 'desc' };
  onSort: (columnId: string) => void;
  summaryData: {
    totalPools: number;
    totalUniqueTokens: number;
    totalProtocols: number;
  };
  onLoadMore: () => void;
  hasMorePools: boolean;
  isLoadingMore: boolean; // New prop for loading indicator
  selectedChain: string; // New prop for chain
  connectionState: 'disconnected' | 'connecting' | 'connected';
  connectionStartTime: number | null;
}

const PoolTable: React.FC<PoolTableProps> = ({ 
  displayedPools, 
  selectedPoolId, 
  onPoolClick,
  allVisibleColumns,
  renderTokensText, 
  renderFee,
  sortConfig,
  onSort,
  summaryData,
  onLoadMore,
  hasMorePools,
  isLoadingMore,
  selectedChain,
  connectionState,
  connectionStartTime
}) => {
  const sortableColumns = ['protocol_system', 'static_attributes.fee', 'spotPrice', 'updatedAt'];
  const isMobile = useIsMobile();
  const [elapsedTime, setElapsedTime] = useState(0);

  // Update elapsed time for connecting state
  useEffect(() => {
    if (connectionState === 'connecting' && connectionStartTime) {
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - connectionStartTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [connectionState, connectionStartTime]);

  // Mobile scroll handler
  const handleMobileScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (!hasMorePools || isLoadingMore) return;
    const target = event.currentTarget;
    if (target.scrollHeight - target.scrollTop - target.clientHeight < 200) {
      onLoadMore();
    }
  };

  const tableContent = (
    <Table className="table-auto w-full">
      <TableHeader>
        <TableRow 
          className="sticky top-0 z-10 border-b border-milk-border-subtle bg-transparent"
        > 
              {allVisibleColumns.map((column) => {
                const isSortable = sortableColumns.includes(column.id);
                return (
                  <TableHead 
                    key={column.id}
                    className={cn(
                      "px-4 py-3.5 text-[13px] font-medium text-left text-milk-muted",
                      isSortable && "cursor-pointer hover:opacity-80",
                      getColumnWidthClass(column.id)
                    )}
                    onClick={() => isSortable && onSort(column.id)}
                  >
                    <div className="flex items-center gap-1">
                      <span>{column.name}</span>
                      {isSortable && (
                        sortConfig.column === column.id ? (
                          sortConfig.direction === 'asc' ? 
                            <ChevronUp className="h-3 w-3 text-white" /> : 
                            <ChevronDown className="h-3 w-3 text-white" />
                        ) : (
                          <ChevronsUpDown className="h-3 w-3 text-milk-muted" />
                        )
                      )}
                    </div>
                  </TableHead>
                );
              })}
            </TableRow>
            {/* Summary Row */}
            <TableRow 
              className="border-b border-milk-border-subtle bg-milk-bg-subtle"
            >
              {allVisibleColumns.map(column => (
                <TableCell key={`summary-${column.id}`} className="py-2 px-4 text-base font-semibold text-milk-base">
                  {column.id === 'tokens' && (
                    <div className="flex flex-col">
                      {connectionState === 'disconnected' && (
                        <>
                          <span>Disconnected</span>
                          <span className="text-xs font-normal text-milk-base">No connection</span>
                        </>
                      )}
                      {connectionState === 'connecting' && (
                        <>
                          <span>Connecting...</span>
                          <span className="text-xs font-normal text-milk-base">
                            {elapsedTime > 0 ? `${elapsedTime}s elapsed` : 'Starting...'}
                          </span>
                        </>
                      )}
                      {connectionState === 'connected' && displayedPools.length === 0 && (
                        <>
                          <span>Connected</span>
                          <span className="text-xs font-normal text-milk-base">Loading pools...</span>
                        </>
                      )}
                      {connectionState === 'connected' && displayedPools.length > 0 && (
                        <>
                          <span>Summary</span>
                          <span className="text-xs font-normal text-milk-base">{summaryData.totalUniqueTokens} tokens</span>
                        </>
                      )}
                    </div>
                  )}
                  {column.id === 'id' && (
                    <span>
                      {connectionState === 'connected' && displayedPools.length > 0 ? summaryData.totalPools : '-'}
                    </span>
                  )}
                  {column.id === 'protocol_system' && (
                    <span>
                      {connectionState === 'connected' && displayedPools.length > 0 ? summaryData.totalProtocols : '-'}
                    </span>
                  )}
                  {/* Other summary cells remain empty */}
                  {['static_attributes.fee', 'spotPrice', 'updatedAt'].includes(column.id) && <span>-</span>}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedPools.length > 0 ? (
              displayedPools.map((pool) => {
                const isRowSelected = pool.id === selectedPoolId;

                return (
                  <TableRow 
                    key={pool.id}
                    id={`pool-row-${pool.id}`}
                    className={cn(
                      "cursor-pointer border-b border-milk-border-subtle transition-colors",
                      isRowSelected 
                        ? "bg-milk-bg-medium hover:bg-milk-bg-medium" 
                        : "hover:bg-milk-bg-light"
                    )}
                    onClick={() => onPoolClick(pool)}
                  >
                    {allVisibleColumns.map((column) => {
                      let displayValue: React.ReactNode;
                      
                      if (column.id === 'tokens') {
                        displayValue = (
                          <div className="flex items-center gap-2">
                            <StackedTokenIcons tokens={pool.tokens} />
                            <span className="text-sm text-milk-base">{renderTokensText(pool)}</span>
                          </div>
                        );
                      } else if (column.id === 'id') {
                        const linkUrl = getExternalLink(pool, selectedChain);
                        displayValue = (
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <Tooltip delayDuration={0}>
                              <TooltipTrigger asChild>
                                <span 
                                  className="text-sm cursor-pointer text-milk-base"
                                >
                                  {renderHexId(pool.id)}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent 
                                className="bg-[rgba(25,10,53,0.95)] backdrop-blur-2xl border-[rgba(255,255,255,0.1)] z-[100] text-milk-base"
                                side="top"
                                onPointerDownOutside={(e) => e.preventDefault()}
                              >
                                <p 
                                  className="font-mono text-xs select-all cursor-text"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {pool.id}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                            {linkUrl && (
                              <a
                                href={linkUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="transition-colors text-milk-base"
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
                            <span className="text-sm text-milk-base">{getReadableProtocolName(pool.protocol_system)}</span>
                          </div>
                        );
                      } else if (column.id === 'static_attributes.fee') {
                        displayValue = <span className="text-sm text-milk-base">{renderFee(pool)}</span>;
                      } else if (column.id === 'spotPrice') {
                        // Show spot price with token1 logo (quote token)
                        const quoteToken = pool.tokens[1] || pool.tokens[0]; // Fallback to token0 if only one token
                        displayValue = (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-milk-base">
                              {formatSpotPrice(pool.spotPrice)}
                            </span>
                            {quoteToken && <TokenIcon token={quoteToken} size={6} />}
                          </div>
                        );
                      } else if (column.id === 'updatedAt') {
                        displayValue = <span className="text-sm text-milk-base">{formatTimeAgo(pool.updatedAt)}</span>;
                      } else {
                        displayValue = '-';
                      }
                      
                      return (
                        <TableCell 
                          key={column.id} 
                          className="px-4 py-3.5 text-sm text-milk-base"
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
                <TableCell colSpan={allVisibleColumns.length} className="h-24 text-center text-milk-base">
                  No pools match your filter criteria.
                </TableCell>
              </TableRow>
            )}
            {isLoadingMore && hasMorePools && (
              <TableRow>
                <TableCell colSpan={allVisibleColumns.length} className="text-center py-4">
                  <p className="text-milk-base">Loading more pools...</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
  );

  return (
    <TooltipProvider>
      <div className="w-full flex-grow flex flex-col overflow-hidden">
        {isMobile ? (
          // Native scrolling for mobile
          <div 
            className="w-full flex-grow overflow-auto overscroll-contain"
            style={{
              WebkitOverflowScrolling: 'touch',
            }}
            onScroll={handleMobileScroll}
          >
            {tableContent}
          </div>
        ) : (
          // ScrollArea for desktop
          <ScrollArea 
            className="w-full flex-grow" 
            onViewportScroll={(event) => {
              if (!hasMorePools || isLoadingMore) return;
              const target = event.currentTarget;
              if (target.scrollHeight - target.scrollTop - target.clientHeight < 200) {
                onLoadMore();
              }
            }}
            withHorizontalScrollbar={true}
          >
            {tableContent}
          </ScrollArea>
        )}
      </div>
    </TooltipProvider>
  );
};

export default memo(PoolTable);
