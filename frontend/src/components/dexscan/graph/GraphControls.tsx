import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Search, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GraphControlsProps {
  tokenList: Array<{id: string, label: string}>;
  protocols: string[];
  selectedTokens: string[];
  selectedProtocols: string[];
  onSelectTokens: (tokenIds: string[]) => void;
  onSelectProtocols: (protocols: string[]) => void;
  onRender: () => void;
  onReset: () => void;
}

// Custom virtualized list component for tokens
const VirtualizedTokenList: React.FC<{
  tokens: Array<{id: string, label: string}>;
  selectedTokens: string[];
  toggleToken: (id: string) => void;
}> = ({ tokens, selectedTokens, toggleToken }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });
  const itemHeight = 34; // height of each item in pixels
  
  useEffect(() => {
    const updateVisibleRange = () => {
      if (!containerRef.current) return;
      
      const containerHeight = containerRef.current.clientHeight;
      const scrollTop = containerRef.current.scrollTop;
      
      // Add buffer to prevent flickering during fast scrolling
      const buffer = 10;
      const start = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
      const visibleItems = Math.ceil(containerHeight / itemHeight) + 2 * buffer;
      const end = Math.min(tokens.length, start + visibleItems);
      
      setVisibleRange({ start, end });
    };
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', updateVisibleRange);
      // Initial update
      updateVisibleRange();
      
      return () => {
        container.removeEventListener('scroll', updateVisibleRange);
      };
    }
  }, [tokens.length, itemHeight]);
  
  if (tokens.length === 0) {
    return (
      <div className="p-4 text-sm text-muted-foreground text-center">
        No tokens found
      </div>
    );
  }
  
  // Calculate total height to ensure scrollbar represents the full list
  const totalHeight = tokens.length * itemHeight;
  
  // Only render the visible items
  const visibleItems = tokens.slice(visibleRange.start, visibleRange.end);
  
  return (
    <div 
      ref={containerRef} 
      style={{ height: '240px', overflowY: 'auto' }}
      className="relative w-full"
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map((token, index) => {
          const actualIndex = visibleRange.start + index;
          return (
            <div 
              key={token.id}
              className="flex items-center px-3 py-2 hover:bg-muted absolute w-full"
              style={{ top: (actualIndex * itemHeight) + 'px', height: itemHeight + 'px' }}
            >
              <Checkbox 
                id={`token-${token.id}`}
                checked={selectedTokens.includes(token.id)}
                onCheckedChange={() => toggleToken(token.id)}
              />
              <label 
                htmlFor={`token-${token.id}`}
                className="ml-2 text-sm cursor-pointer flex-grow"
              >
                {token.label}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const GraphControls: React.FC<GraphControlsProps> = ({
  tokenList,
  protocols,
  selectedTokens,
  selectedProtocols,
  onSelectTokens,
  onSelectProtocols,
  onRender,
  onReset
}) => {
  const [tokenSearchOpen, setTokenSearchOpen] = useState(false);
  const [protocolSearchOpen, setProtocolSearchOpen] = useState(false);
  const [tokenSearchQuery, setTokenSearchQuery] = useState('');
  
  const sortedTokens = React.useMemo(() => 
    [...tokenList].sort((a, b) => a.label.localeCompare(b.label)),
    [tokenList]
  );
  
  const filteredTokens = React.useMemo(() => {
    if (!tokenSearchQuery) return sortedTokens;
    
    return sortedTokens.filter(token => 
      token.label.toLowerCase().includes(tokenSearchQuery.toLowerCase())
    );
  }, [sortedTokens, tokenSearchQuery]);

  const sortedProtocols = React.useMemo(() => 
    [...protocols].sort((a, b) => a.localeCompare(b)),
    [protocols]
  );

  // Toggle token selection
  const toggleToken = (tokenId: string) => {
    const newSelectedTokens = selectedTokens.includes(tokenId)
      ? selectedTokens.filter(id => id !== tokenId)
      : [...selectedTokens, tokenId];
    
    onSelectTokens(newSelectedTokens);
  };

  // Toggle protocol selection
  const toggleProtocol = (protocol: string) => {
    const newSelectedProtocols = selectedProtocols.includes(protocol)
      ? selectedProtocols.filter(p => p !== protocol)
      : [...selectedProtocols, protocol];
    
    onSelectProtocols(newSelectedProtocols);
  };

  // Helper to remove a token
  const removeToken = (tokenId: string) => {
    onSelectTokens(selectedTokens.filter(id => id !== tokenId));
  };

  // Helper to remove a protocol
  const removeProtocol = (protocol: string) => {
    onSelectProtocols(selectedProtocols.filter(p => p !== protocol));
  };

  // Get the labels for selected tokens
  const selectedTokenLabels = React.useMemo(() => {
    return selectedTokens.map(id => {
      const token = tokenList.find(t => t.id === id);
      return token?.label || 'Unknown';
    });
  }, [selectedTokens, tokenList]);

  return (
    <div className="flex flex-col gap-4 mb-4 p-3 border rounded-md">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-col gap-1 min-w-40">
          <div className="flex justify-between items-center">
            <label className="text-xs font-medium">Tokens</label>
            <span className="text-xs text-muted-foreground">
              {selectedTokens.length} selected
            </span>
          </div>
          <div className="text-xs text-muted-foreground mb-1">
            Only selected tokens will appear on the graph
          </div>
          <Popover open={tokenSearchOpen} onOpenChange={setTokenSearchOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={tokenSearchOpen}
                className="justify-between h-10"
              >
                <span className="truncate text-left">
                  {selectedTokens.length > 0 
                    ? `${selectedTokens.length} token${selectedTokens.length > 1 ? 's' : ''} selected` 
                    : "Select tokens..."}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <div className="flex items-center border-b px-3 py-2">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-70" />
                <Input
                  placeholder="Search tokens..."
                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  value={tokenSearchQuery}
                  onChange={(e) => setTokenSearchQuery(e.target.value)}
                />
              </div>
              <ScrollArea className="max-h-[240px] overflow-y-auto">
                <VirtualizedTokenList 
                  tokens={filteredTokens} 
                  selectedTokens={selectedTokens} 
                  toggleToken={toggleToken} 
                />
              </ScrollArea>
              <div className="flex justify-between items-center p-2 border-t">
                <span className="text-xs text-muted-foreground pl-2">
                  {selectedTokens.length} selected
                </span>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onSelectTokens([])}
                  >
                    Clear
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setTokenSearchOpen(false)}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col gap-1 min-w-40">
          <div className="flex justify-between items-center">
            <label className="text-xs font-medium">Protocols</label>
            <span className="text-xs text-muted-foreground">
              {selectedProtocols.length} selected
            </span>
          </div>
          <div className="text-xs text-muted-foreground mb-1">
            Selected protocol connections will appear in blue
          </div>
          <Popover open={protocolSearchOpen} onOpenChange={setProtocolSearchOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={protocolSearchOpen}
                className="justify-between h-10"
              >
                <span className="truncate text-left">
                  {selectedProtocols.length > 0 
                    ? `${selectedProtocols.length} protocol${selectedProtocols.length > 1 ? 's' : ''} selected` 
                    : "Select protocols..."}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <ScrollArea className="max-h-[240px] overflow-y-auto">
                {sortedProtocols.map(protocol => (
                  <div 
                    key={protocol} 
                    className="flex items-center px-3 py-2 hover:bg-muted"
                  >
                    <Checkbox 
                      id={`protocol-${protocol}`}
                      checked={selectedProtocols.includes(protocol)}
                      onCheckedChange={() => toggleProtocol(protocol)}
                    />
                    <label 
                      htmlFor={`protocol-${protocol}`}
                      className="ml-2 text-sm cursor-pointer flex-grow"
                    >
                      {protocol}
                    </label>
                  </div>
                ))}
              </ScrollArea>
              <div className="flex justify-between items-center p-2 border-t">
                <span className="text-xs text-muted-foreground pl-2">
                  {selectedProtocols.length} selected
                </span>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onSelectProtocols([])}
                  >
                    Clear
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setProtocolSearchOpen(false)}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-end gap-2">
          <Button 
            onClick={onRender} 
            variant="default" 
            size="sm"
            disabled={selectedTokens.length === 0 && selectedProtocols.length === 0}
          >
            Render Graph
          </Button>
          <Button onClick={onReset} variant="outline" size="sm">
            Reset
          </Button>
        </div>
      </div>

      {/* Selection Summary */}
      {(selectedTokens.length > 0 || selectedProtocols.length > 0) && (
        <div className="flex flex-col gap-2 mt-1">
          {/* Organized Selection Groups */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Tokens Selection Group */}
            {selectedTokens.length > 0 && (
              <div className="border rounded-md p-2">
                <div className="text-xs font-medium mb-1.5 flex justify-between items-center">
                  <span>Selected Tokens ({selectedTokens.length})</span>
                  {selectedTokens.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="xs" 
                      className="h-5 text-xs" 
                      onClick={() => onSelectTokens([])}
                    >
                      Clear All
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTokenLabels.map((label, index) => (
                    <Badge 
                      key={`token-${selectedTokens[index]}`} 
                      variant="secondary" 
                      className="flex items-center gap-1 bg-opacity-50"
                    >
                      {label}
                      <X 
                        className="h-3 w-3 cursor-pointer opacity-70 hover:opacity-100" 
                        onClick={() => removeToken(selectedTokens[index])}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Protocols Selection Group */}
            {selectedProtocols.length > 0 && (
              <div className="border rounded-md p-2">
                <div className="text-xs font-medium mb-1.5 flex justify-between items-center">
                  <span>Selected Protocols ({selectedProtocols.length})</span>
                  {selectedProtocols.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="xs" 
                      className="h-5 text-xs" 
                      onClick={() => onSelectProtocols([])}
                    >
                      Clear All
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProtocols.map(protocol => (
                    <Badge 
                      key={`protocol-${protocol}`} 
                      variant="outline" 
                      className="flex items-center gap-1"
                    >
                      {protocol}
                      <X 
                        className="h-3 w-3 cursor-pointer opacity-70 hover:opacity-100" 
                        onClick={() => removeProtocol(protocol)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};