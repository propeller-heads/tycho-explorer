import React, { useEffect, useRef, memo } from 'react';
import { 
  Table, TableHeader, TableBody, TableRow, 
  TableHead, TableCell 
} from '@/components/ui/table';
import { ExternalLink, ChevronUp, ChevronDown, Search } from 'lucide-react';
import { cn, formatPoolId, getExternalLink } from '@/lib/utils';
import { Pool } from '../types';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';

interface PoolTableProps {
  paginatedPools: Pool[];
  highlightedPoolId?: string | null;
  selectedPoolId?: string | null;
  onPoolClick: (pool: Pool) => void;
  allVisibleColumns: Array<{ id: string; name: string; type: string }>;
  renderTokens: (pool: Pool) => string;
  renderFee: (pool: Pool) => string;
  sortConfig?: { column: string; direction: 'asc' | 'desc' };
  onSort?: (column: string) => void;
  onFilter?: (key: string, value: string) => void;
  filters?: { tokens: string; protocol_system: string; poolId: string };
}

const PoolTable: React.FC<PoolTableProps> = ({ 
  paginatedPools, 
  highlightedPoolId, 
  selectedPoolId, 
  onPoolClick,
  allVisibleColumns,
  renderTokens,
  renderFee,
  sortConfig = { column: 'id', direction: 'asc' },
  onSort,
  onFilter,
  filters = { tokens: '', protocol_system: '', poolId: '' }
}) => {
  // Create ref for table container to scroll to highlighted row
  const tableRef = useRef<HTMLDivElement>(null);

  return (
    <div className="w-full space-y-2">
      <div className="flex space-x-4">
        <div className="relative flex-1">
          <Input
            placeholder="Filter by pool ID/address..."
            value={filters.poolId}
            onChange={(e) => onFilter && onFilter('poolId', e.target.value)}
            className="pl-8"
          />
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
        <div className="relative flex-1">
          <Input
            placeholder="Filter by tokens..."
            value={filters.tokens}
            onChange={(e) => onFilter && onFilter('tokens', e.target.value)}
            className="pl-8"
          />
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
        <div className="relative flex-1">
          <Input
            placeholder="Filter by protocol..."
            value={filters.protocol_system}
            onChange={(e) => onFilter && onFilter('protocol_system', e.target.value)}
            className="pl-8"
          />
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      
      <ScrollArea className="w-full" style={{ height: 'min(60vh, 600px)', minHeight: '400px' }} ref={tableRef}>
        <div className="w-full min-w-max">
          <Table>
            <TableHeader>
              <TableRow>
                {allVisibleColumns.map((column) => (
                  <TableHead 
                    key={column.id}
                    className={cn(
                      "sticky top-0 bg-secondary/30 cursor-pointer",
                      column.type === 'number' && "text-right"
                    )}
                    onClick={() => onSort && onSort(column.id)}
                  >
                    <div className={cn(
                      "flex items-center",
                      column.type === 'number' ? "justify-end" : "justify-between"
                    )}>
                      <span>{column.name}</span>
                      {sortConfig.column === column.id && (
                        sortConfig.direction === 'asc' ? 
                          <ChevronUp className="h-4 w-4 ml-1" /> : 
                          <ChevronDown className="h-4 w-4 ml-1" />
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPools.length > 0 ? (
                paginatedPools.map((pool) => {
                  // Determine if this row should be highlighted - only if it matches selectedPoolId
                  // or if highlightedPoolId is set and selectedPoolId is not
                  const isRowHighlighted = 
                    pool.id === selectedPoolId || 
                    (pool.id === highlightedPoolId && !selectedPoolId);
                    
                  return (
                    <TableRow 
                      key={pool.id}
                      id={`pool-row-${pool.id}`}
                      className={cn(
                        "cursor-pointer",
                        isRowHighlighted ? 
                        "bg-sky-50 dark:bg-sky-900/20 hover:bg-sky-100 dark:hover:bg-sky-900/30" :
                        "hover:bg-muted/50"
                      )}
                      onClick={() => onPoolClick(pool)}
                    >
                      {allVisibleColumns.map((column) => {
                        // Get the correct value based on column id
                        let value;
                        let displayValue;
                        
                        // Custom formatting for different column types
                        if (column.id === 'id') {
                          const linkUrl = getExternalLink(pool);
                          
                          displayValue = (
                            <TooltipProvider delayDuration={150}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="font-mono text-xs flex items-center">
                                    <span className="cursor-help">{formatPoolId(pool.id)}</span>
                                    {linkUrl && (
                                      <a
                                        href={linkUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ml-1 text-blue-500 hover:text-blue-700 inline-flex items-center"
                                        onClick={(e) => e.stopPropagation()} // Prevent row click when clicking the link
                                      >
                                        <ExternalLink className="h-3 w-3" />
                                      </a>
                                    )}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p className="font-mono flex items-center justify-between">
                                    <span>{pool.id}</span>
                                    <button 
                                      className="ml-2 text-xs text-muted-foreground hover:text-primary"
                                      onClick={() => {
                                        navigator.clipboard.writeText(pool.id);
                                      }}
                                    >
                                      Copy
                                    </button>
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          );
                        } else if (column.id === 'tokens') {
                          displayValue = renderTokens(pool);
                        } else if (column.id === 'static_attributes.fee') {
                          displayValue = renderFee(pool);
                        } else if (column.id === 'protocol_system') {
                          displayValue = pool.protocol_system;
                        } else if (column.id === 'created_at') {
                          displayValue = new Date(pool.created_at).toLocaleString() + ' UTC';
                        } else if (column.id === 'updatedAt') {
                          displayValue = new Date(pool.updatedAt).toLocaleString() + ' UTC';
                        } else if (column.id === 'spotPrice') {
                          displayValue = pool.spotPrice.toLocaleString(undefined, { 
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 18
                          });
                        } else {
                          displayValue = value?.toString() || 'ERR';
                        }
                        
                        return (
                          <TableCell 
                            key={column.id} 
                            className={cn(
                              column.type === 'number' && "text-right",
                              isRowHighlighted && "font-medium text-black dark:text-white" // Ensure text is black in light mode and white in dark mode
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
                  <TableCell colSpan={allVisibleColumns.length} className="h-24 text-center">
                    No pools match your filter criteria
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    </div>
  );
};

export default memo(PoolTable);