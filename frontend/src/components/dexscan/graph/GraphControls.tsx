import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Search, ChevronsUpDown, X } from 'lucide-react';
import { protocolColorMap } from './protocolColors';
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
              <ScrollArea className="max-h-60">
                {filteredTokens.length > 0 ? (
                  filteredTokens.map(token => (
                    <div 
                      key={token.id} 
                      className="flex items-center px-3 py-2 hover:bg-muted"
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
                  ))
                ) : (
                  <div className="p-4 text-sm text-muted-foreground text-center">
                    No tokens found
                  </div>
                )}
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
              <ScrollArea className="max-h-60">
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
                      className="ml-2 text-sm cursor-pointer flex items-center flex-grow"
                    >
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: protocolColorMap[protocol]?.color || '#aaaaaa' }}
                      />
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

      {/* Selection Pills */}
      {(selectedTokens.length > 0 || selectedProtocols.length > 0) && (
        <div className="flex flex-wrap gap-2 mt-1">
          {selectedTokenLabels.map((label, index) => (
            <Badge key={`token-${selectedTokens[index]}`} variant="outline" className="flex items-center gap-1">
              {label}
              <X 
                className="h-3 w-3 cursor-pointer opacity-70 hover:opacity-100" 
                onClick={() => removeToken(selectedTokens[index])}
              />
            </Badge>
          ))}
          {selectedProtocols.map(protocol => (
            <Badge key={`protocol-${protocol}`} variant="outline" className="flex items-center gap-1">
              <div 
                className="w-2 h-2 rounded-full mr-1" 
                style={{ backgroundColor: protocolColorMap[protocol]?.color || '#aaaaaa' }}
              />
              {protocol}
              <X 
                className="h-3 w-3 cursor-pointer opacity-70 hover:opacity-100" 
                onClick={() => removeProtocol(protocol)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};