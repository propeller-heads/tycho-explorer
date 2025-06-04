import { useState, useMemo, useEffect } from 'react';
import { LucideChevronDown, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { FilterSearchInput } from './FilterSearchInput';
import TokenIcon from '../TokenIcon';
import { Token } from '../../types';
import { cn } from '@/lib/utils';

interface TokenFilterPopoverProps {
  tokens: Token[];
  selectedTokens: Token[];
  onTokenToggle: (token: Token, isSelected: boolean) => void;
  buttonText?: string;
}

export const TokenFilterPopover = ({ 
  tokens, 
  selectedTokens, 
  onTokenToggle,
  buttonText = "Select Tokens..."
}: TokenFilterPopoverProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [displayCount, setDisplayCount] = useState(100);
  const [selectedSectionExpanded, setSelectedSectionExpanded] = useState(false);

  // Filter tokens based on search, but DON'T sort by selection
  const filteredTokens = useMemo(() => {
    const filtered = tokens.filter(token => 
      token.symbol.toLowerCase().includes(search.toLowerCase()) ||
      token.name?.toLowerCase().includes(search.toLowerCase()) ||
      token.address.toLowerCase().includes(search.toLowerCase())
    );
    
    // Keep alphabetical order, no selection-based sorting
    return filtered.sort((a, b) => a.symbol.localeCompare(b.symbol));
  }, [tokens, search]);

  const buttonLabel = useMemo(() => {
    if (selectedTokens.length === 0) return buttonText;
    return `${selectedTokens.length} selected`;
  }, [selectedTokens, buttonText]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-10 sm:h-8 px-3 border-[rgba(255,244,224,0.2)] bg-[rgba(255,244,224,0.02)] hover:bg-[rgba(255,244,224,0.06)] text-xs text-[rgba(255,244,224,1)]"
        >
          {buttonLabel}
          <LucideChevronDown className={`ml-1 h-3 w-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        align="start" 
        className="w-72 p-0 bg-[rgba(255,244,224,0.02)] backdrop-blur-[104px] border border-[rgba(255,244,224,0.12)] shadow-[0px_4px_16px_0px_rgba(37,0,63,0.2)]"
      >
        <div className="p-2">
          <FilterSearchInput 
            value={search}
            onChange={setSearch}
            placeholder="Search token..."
          />
        </div>

        {/* Sticky Selected Section */}
        {selectedTokens.length > 0 && (
          <div className="border-b border-[rgba(255,244,224,0.1)] pb-1">
            <button
              className="w-full px-2 py-1.5 flex items-center justify-between hover:bg-[rgba(255,244,224,0.02)] transition-colors"
              onClick={() => setSelectedSectionExpanded(!selectedSectionExpanded)}
            >
              <span className="text-xs font-medium text-[rgba(255,244,224,0.8)]">
                SELECTED ({selectedTokens.length})
              </span>
              {selectedSectionExpanded ? (
                <ChevronDown className="h-3 w-3 text-[rgba(255,244,224,0.6)]" />
              ) : (
                <ChevronRight className="h-3 w-3 text-[rgba(255,244,224,0.6)]" />
              )}
            </button>
            
            {selectedSectionExpanded && (
              <div className="px-2 pb-2 max-h-[120px] overflow-y-auto">
                {selectedTokens.map(token => (
                  <div 
                    key={`selected-${token.address}`}
                    className="flex items-center space-x-2 p-1.5 rounded-md hover:bg-[rgba(255,244,224,0.06)] cursor-pointer"
                    onClick={() => onTokenToggle(token, false)}
                  >
                    <Checkbox
                      id={`selected-token-${token.address}`}
                      checked={true}
                      onCheckedChange={() => onTokenToggle(token, false)}
                      className="border-[rgba(255,244,224,0.64)] data-[state=checked]:bg-[#FF3366] data-[state=checked]:border-[#FF3366] data-[state=checked]:text-white rounded-none"
                    />
                    <TokenIcon token={token} size={5} /> 
                    <label 
                      htmlFor={`selected-token-${token.address}`}
                      className="text-xs font-medium leading-none truncate text-[rgba(255,244,224,1)] cursor-pointer"
                    >
                      {token.symbol}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Main Token List */}
        <ScrollArea 
          className="h-[200px] p-2"
          onViewportScroll={(event) => {
            const target = event.currentTarget;
            if (target.scrollHeight - target.scrollTop - target.clientHeight < 50) {
              setDisplayCount(prev => Math.min(prev + 100, filteredTokens.length));
            }
          }}
        >
          {filteredTokens.length === 0 && (
            <p className="text-xs text-[rgba(255,244,224,0.4)] text-center py-2">No tokens found.</p>
          )}
          {filteredTokens.slice(0, displayCount).map(token => {
            const isSelected = selectedTokens.some(st => st.address === token.address);
            return (
              <div 
                key={token.address} 
                className="flex items-center space-x-2 p-1.5 rounded-md hover:bg-[rgba(255,244,224,0.06)] cursor-pointer transition-all duration-200"
                onClick={() => onTokenToggle(token, !isSelected)}
              >
                <Checkbox
                  id={`token-${token.address}`}
                  checked={isSelected}
                  onCheckedChange={(checked) => onTokenToggle(token, !!checked)}
                  className="border-[rgba(255,244,224,0.64)] data-[state=checked]:bg-[#FF3366] data-[state=checked]:border-[#FF3366] data-[state=checked]:text-white rounded-none"
                />
                <TokenIcon token={token} size={5} /> 
                <label 
                  htmlFor={`token-${token.address}`}
                  className={cn(
                    "text-xs leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 truncate cursor-pointer flex-1",
                    isSelected ? "font-semibold text-[rgba(255,244,224,1)]" : "font-medium text-[rgba(255,244,224,0.9)]"
                  )}
                  title={`${token.name} (${token.symbol})`}
                >
                  {token.symbol} 
                  <span className={cn(
                    "text-xs ml-1",
                    isSelected ? "text-[rgba(255,244,224,0.8)]" : "text-[rgba(255,244,224,0.6)]"
                  )}>
                    {token.name}
                  </span>
                </label>
              </div>
            );
          })}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};