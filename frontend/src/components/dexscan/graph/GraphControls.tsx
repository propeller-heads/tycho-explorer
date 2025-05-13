import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
// Badge and X (lucide-react) might be used by new filter displays later, keep for now.
// import { Badge } from '@/components/ui/badge';
import { Search, X as LucideX } from 'lucide-react'; // Import X as LucideX

// Import icons
import IconDropdownArrow from '@/assets/figma_generated/icon_dropdown_arrow.svg';
// import IconCloseX from '@/assets/figma_generated/icon_close_x.svg'; // This failed to download
import BlockProgressIcon from './BlockProgressIcon'; // Import the new component

// Helper function to format token with address bytes - keep for VirtualizedTokenList
// Now returns JSX for differential styling
const formatTokenWithAddress = (symbol: string, address: string): React.ReactNode => {
  if (!address || address.length < (2 + 4 * 2)) { // Ensure address is long enough for 0x + 4 + ... + 4
    return symbol; 
  }
  const prefix = address.slice(0,2);
  if (prefix.toLowerCase() !== '0x') return symbol; // Only format if it looks like a hex address

  const startChars = address.slice(2, 2 + 4);
  const endChars = address.slice(-4);
  const addressSummary = `(0x${startChars}...${endChars})`;

  return (
    <>
      <span>{symbol}</span>
      <span style={{
        marginLeft: '0.375rem', // approx 6px, slightly more than ml-1
        fontSize: '0.75rem',  // 12px
        color: 'rgba(255, 244, 224, 0.64)',
        opacity: 0.85, // Slightly more de-emphasis
      }}>
        {addressSummary}
      </span>
    </>
  );
};

interface GraphControlsProps {
  tokenList: Array<{id: string, label: string}>;
  protocols: string[];
  selectedTokens: string[];
  selectedProtocols: string[];
  onSelectTokens: (tokenIds: string[]) => void;
  onSelectProtocols: (protocols: string[]) => void;
  // onRender: () => void; // Will be removed when auto-render is fully implemented
  onReset: () => void;
  currentBlockNumber: number; 
  lastBlockTimestamp: number | null;
  estimatedBlockDuration: number;
}

// Custom virtualized list component for tokens - keep as it's used by Popover
const VirtualizedTokenList: React.FC<{
  tokens: Array<{id: string, label: string}>;
  selectedTokens: string[];
  toggleToken: (id: string) => void;
}> = ({ tokens, selectedTokens, toggleToken }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });
  const itemHeight = 34;
  
  useEffect(() => {
    const updateVisibleRange = () => {
      if (!containerRef.current) return;
      const containerHeight = containerRef.current.clientHeight;
      const scrollTop = containerRef.current.scrollTop;
      const buffer = 10;
      const start = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
      const visibleItems = Math.ceil(containerHeight / itemHeight) + 2 * buffer;
      const end = Math.min(tokens.length, start + visibleItems);
      setVisibleRange({ start, end });
    };
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', updateVisibleRange);
      updateVisibleRange();
      return () => container.removeEventListener('scroll', updateVisibleRange);
    }
  }, [tokens.length, itemHeight]);
  
  if (tokens.length === 0) {
    return <div className="p-4 text-sm text-muted-foreground text-center">No tokens found</div>;
  }
  const totalHeight = tokens.length * itemHeight;
  const visibleItems = tokens.slice(visibleRange.start, visibleRange.end);
  
  // Item styling based on Figma: row padding 0px 8px, inner content padding 10px.
  // Hover background: rgba(255, 244, 224, 0.06)
  return (
    <div ref={containerRef} style={{ height: '240px', overflowY: 'auto' }} className="relative w-full px-2"> {/* px-2 for 8px horizontal padding on scroll area */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map((token, index) => {
          const actualIndex = visibleRange.start + index;
          return (
            // Outer div for positioning in virtual list
            <div key={token.id} className="absolute w-full" style={{ top: `${actualIndex * itemHeight}px`, height: `${itemHeight}px` }}>
              {/* Inner div for styling (padding, hover) - now the label itself is the main clickable item */}
              <label // Changed div to label, it will be the main clickable item
                htmlFor={`token-${token.id}`} // Connects to checkbox for accessibility
                className="flex items-center h-full hover:bg-[rgba(255,244,224,0.06)] rounded-md w-full cursor-pointer" 
                style={{ padding: "0px 10px"}} 
                // onClick={() => toggleToken(token.id)} // onClick on label can be redundant if htmlFor works well with onCheckedChange
              >
                <Checkbox 
                  id={`token-${token.id}`} 
                  checked={selectedTokens.includes(token.id)} 
                  onCheckedChange={() => toggleToken(token.id)} // This should be the primary way to toggle
                  className="h-4 w-4 shrink-0 rounded-[4px] border-2 border-[rgba(255,244,224,0.64)] data-[state=checked]:bg-[#FF3366] data-[state=checked]:text-white data-[state=checked]:border-[#FF3366]"
                />
                <span className="ml-2 text-sm flex-grow" style={{color: "#FFF4E0"}}> {/* Changed label to span */}
                  {formatTokenWithAddress(token.label, token.id)}
                </span>
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Local storage keys - keep
const LS_SELECTED_TOKENS_KEY = 'graphView_selectedTokens';
const LS_SELECTED_PROTOCOLS_KEY = 'graphView_selectedProtocols';

export const GraphControls: React.FC<GraphControlsProps> = ({
  tokenList,
  protocols,
  selectedTokens,
  selectedProtocols,
  onSelectTokens,
  onSelectProtocols,
  // onRender, // Removed as per plan
  onReset,
  currentBlockNumber,
  lastBlockTimestamp,
  estimatedBlockDuration,
}) => {
  // State for popovers and search - keep for now, will be used by new filter displays
  const [tokenSearchOpen, setTokenSearchOpen] = useState(false);
  const [protocolSearchOpen, setProtocolSearchOpen] = useState(false);
  const [tokenSearchQuery, setTokenSearchQuery] = useState('');
  const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null); // Ref for auto-focus
  const [isSearchFocused, setIsSearchFocused] = useState(false); // State for search input focus
  
  // localStorage effect - keep
  useEffect(() => {
    if (tokenList.length === 0 || protocols.length === 0 || hasLoadedFromStorage) return;
    try {
      const storedTokens = localStorage.getItem(LS_SELECTED_TOKENS_KEY);
      const storedProtocols = localStorage.getItem(LS_SELECTED_PROTOCOLS_KEY);
      let loaded = false;
      if (storedTokens) {
        const parsed = JSON.parse(storedTokens).filter((id: string) => tokenList.some(token => token.id === id));
        if (parsed.length > 0) { onSelectTokens(parsed); loaded = true; }
      }
      if (storedProtocols) {
        const parsed = JSON.parse(storedProtocols).filter((p: string) => protocols.includes(p));
        if (parsed.length > 0) { onSelectProtocols(parsed); loaded = true; }
      }
      if (loaded) setHasLoadedFromStorage(true);
    } catch (e) { console.error('Failed to load selections from localStorage', e); setHasLoadedFromStorage(true); }
  }, [tokenList, protocols, hasLoadedFromStorage, onSelectTokens, onSelectProtocols]);

  // Auto-focus search input when token popover opens
  useEffect(() => {
    if (tokenSearchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50); // Small delay for popover animation
    }
  }, [tokenSearchOpen]);
  
  // Memoized sorted/filtered lists - keep for popovers
  const sortedTokens = React.useMemo(() => [...tokenList].sort((a, b) => a.label.localeCompare(b.label)), [tokenList]);
  const filteredTokens = React.useMemo(() => tokenSearchQuery ? sortedTokens.filter(t => t.label.toLowerCase().includes(tokenSearchQuery.toLowerCase())) : sortedTokens, [sortedTokens, tokenSearchQuery]);
  const sortedProtocols = React.useMemo(() => [...protocols].sort((a, b) => a.localeCompare(b)), [protocols]);

  // Toggle functions - keep for popovers
  const toggleToken = (tokenId: string) => {
    const newSelected = selectedTokens.includes(tokenId) ? selectedTokens.filter(id => id !== tokenId) : [...selectedTokens, tokenId];
    localStorage.setItem(LS_SELECTED_TOKENS_KEY, JSON.stringify(newSelected));
    onSelectTokens(newSelected);
  };
  const toggleProtocol = (protocol: string) => {
    const newSelected = selectedProtocols.includes(protocol) ? selectedProtocols.filter(p => p !== protocol) : [...selectedProtocols, protocol];
    localStorage.setItem(LS_SELECTED_PROTOCOLS_KEY, JSON.stringify(newSelected));
    onSelectProtocols(newSelected);
  };

  const handleFullReset = () => {
    localStorage.removeItem(LS_SELECTED_TOKENS_KEY);
    localStorage.removeItem(LS_SELECTED_PROTOCOLS_KEY);
    setHasLoadedFromStorage(false); // Allow reloading defaults if component re-mounts or lists change
    onReset(); // This prop will call setSelectedTokens([]), setSelectedProtocols([]), setRenderCounter(0) in parent
  };

  // Main layout changed to a single horizontal row
  // Removed outer border and p-3, mb-4 as these are now on GraphViewContent's frame
  // Added responsive flex classes: flex-col on small screens, md:flex-row on medium and up.
  // md:items-center to ensure vertical alignment in row mode.
  // items-start on small screens (column mode) to align items to the left.
  return (
    <div 
      className="flex flex-col md:flex-row md:items-center md:justify-between items-start gap-4 p-4" 
      style={{ borderBottom: '1px solid rgba(255, 244, 224, 0.1)', marginBottom: '16px' /* Spacing before graph area */ }}
    >
      {/* Left section for filters - allow wrapping on small screens */}
      <div className="flex flex-wrap items-center gap-3"> {/* flex-wrap allows filters to wrap if needed */}
        {/* Token Filter Display */}
        <Popover open={tokenSearchOpen} onOpenChange={setTokenSearchOpen}>
          <PopoverTrigger asChild>
            <button
              className="flex items-center justify-between gap-2 text-sm font-medium max-w-xs" // Added max-w-xs
              style={{
                backgroundColor: "rgba(255, 244, 224, 0.06)",
                border: "1px solid rgba(255, 244, 224, 0.4)",
                borderRadius: "8px",
                color: "#FFF4E0",
                padding: "10px 12px 10px 16px", // Adjusted padding to be closer to Figma's 14px vertical, 16px left, 12px right
                minHeight: "36px", // Matches Figma's Filter item height
              }}
            >
              <span className="truncate">
                {selectedTokens.length > 0
                  ? selectedTokens.map(id => {
                      const token = tokenList.find(t => t.id === id);
                      return token?.label || 'Unknown'; // Use the label directly
                    }).join(', ')
                  : "Select tokens"}
              </span>
              {selectedTokens.length > 0 && (
                <LucideX
                  className="h-4 w-4 cursor-pointer opacity-70 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent Popover from closing
                    localStorage.removeItem(LS_SELECTED_TOKENS_KEY);
                    onSelectTokens([]);
                  }}
                />
              )}
              <img src={IconDropdownArrow} alt="select" className="h-4 w-4 opacity-70" />
            </button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-[300px] p-0 flex flex-col" // Added flex flex-col
            align="start"
            style={{
              // Max height for the popover itself, allowing internal scroll for the list
              // Viewport height - some margin (e.g., 50px top/bottom)
              // This ensures the popover itself doesn't get an outer scrollbar easily.
              maxHeight: "calc(100vh - 100px)", 
              // The children will define the actual height up to this max.
              // If content is shorter, popover will be shorter.
              // If content is taller, the inner ScrollArea handles it.
              backgroundColor: "rgba(255, 244, 224, 0.04)",
              borderColor: "rgba(255, 244, 224, 0.2)", // Will be applied by default PopoverContent border, or override with border class
              borderRadius: "12px", // Tailwind rounded-xl should be on the component if possible
              boxShadow: "0px 4px 16px 0px rgba(37, 0, 63, 0.2)",
              backdropFilter: "blur(10.4px)",
              WebkitBackdropFilter: "blur(10.4px)",
            }}
          >
            {/* Styled Search Field Area */}
            <div className="p-3 border-b" style={{ borderColor: "rgba(255, 244, 224, 0.1)"}}> {/* Figma: padding 12px (p-3), then search field inside */}
              <div 
                className="flex items-center" 
                style={{ 
                  backgroundColor: "rgba(255, 244, 224, 0.02)", 
                  borderRadius: "8px", 
                  borderStyle: "solid",
                  borderWidth: isSearchFocused ? "2px" : "1px",
                  borderColor: isSearchFocused ? '#FF3366' : 'rgba(255, 244, 224, 0.2)',
                  padding: "8px 12px", // Padding might need slight adjustment if border width changes box size
                  transition: "border-color 0.2s ease-in-out, border-width 0.2s ease-in-out"
                }}
              >
                <Search className="mr-2 h-4 w-4 shrink-0" style={{color: "rgba(255, 244, 224, 0.4)"}} />
                <Input
                  ref={searchInputRef}
                  placeholder="Search by name or address"
                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-auto p-0 text-sm"
                  style={{ backgroundColor: "transparent", color: "#FFF4E0", flexGrow: 1 }}
                  value={tokenSearchQuery}
                  onChange={(e) => setTokenSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                 />
              </div>
            </div>
            {/* ScrollArea should grow to fill available space in the flex-col PopoverContent */}
            <ScrollArea className="max-h-[240px] overflow-y-auto flex-grow" style={{padding: "8px 0px"}}> 
              <VirtualizedTokenList 
                tokens={filteredTokens} 
                selectedTokens={selectedTokens} 
                toggleToken={toggleToken} 
              />
            </ScrollArea>
            {/* Done button footer removed as per plan */}
          </PopoverContent>
        </Popover>
        
        {/* Protocol Filter Display */}
        <Popover open={protocolSearchOpen} onOpenChange={setProtocolSearchOpen}>
          <PopoverTrigger asChild>
            <button
              className="flex items-center justify-between gap-2 text-sm font-medium max-w-xs" // Added max-w-xs
              style={{
                backgroundColor: "rgba(255, 244, 224, 0.06)",
                border: "1px solid rgba(255, 244, 224, 0.4)",
                borderRadius: "8px",
                color: "#FFF4E0",
                padding: "10px 12px 10px 16px",
                minHeight: "36px",
              }}
            >
              <span className="truncate">
                {selectedProtocols.length > 0
                  ? selectedProtocols.join(', ')
                  : "Select protocols"}
              </span>
              {/* No 'x' clear icon for protocols as per Figma design for this specific item */}
              <img src={IconDropdownArrow} alt="select" className="h-4 w-4 opacity-70" />
            </button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-[300px] p-0 flex flex-col"  // Added flex flex-col
            align="start"
            style={{
              backgroundColor: "rgba(255, 244, 224, 0.04)",
              borderColor: "rgba(255, 244, 224, 0.2)",
              borderRadius: "12px",
              boxShadow: "0px 4px 16px 0px rgba(37, 0, 63, 0.2)",
              backdropFilter: "blur(10.4px)",
              WebkitBackdropFilter: "blur(10.4px)",
              maxHeight: "calc(100vh - 100px)", // Consistent max height
            }}
          >
            {/* No search input for protocols in current design, can be added if needed */}
            <ScrollArea className="max-h-[240px] overflow-y-auto px-2 flex-grow" style={{paddingTop: "8px", paddingBottom: "8px"}}> 
              {sortedProtocols.map(protocol => (
                <div key={protocol} className="h-[34px]"> {/* Outer div for key, height matches itemHeight */}
                  <label // Label wraps checkbox and text for full clickability
                    htmlFor={`protocol-${protocol}`}
                    className="flex items-center h-full hover:bg-[rgba(255,244,224,0.06)] rounded-md w-full cursor-pointer"
                    style={{ padding: "0px 10px"}}
                  >
                    <Checkbox 
                      id={`protocol-${protocol}`}
                      checked={selectedProtocols.includes(protocol)}
                      onCheckedChange={() => toggleProtocol(protocol)} 
                      className="h-4 w-4 shrink-0 rounded-[4px] border-2 border-[rgba(255,244,224,0.64)] data-[state=checked]:bg-[#FF3366] data-[state=checked]:text-white data-[state=checked]:border-[#FF3366]"
                    />
                    <span 
                      className="ml-2 text-sm flex-grow"
                      style={{color: "#FFF4E0"}}
                    >
                      {protocol}
                    </span>
                  </label>
                </div>
              ))}
              {sortedProtocols.length === 0 && (
                <div className="p-4 text-sm text-muted-foreground text-center">No protocols found</div>
              )}
            </ScrollArea>
            {/* Done button footer removed as per plan */}
          </PopoverContent>
        </Popover>
        {/* Moved Reset filters button to the left group */}
        <button
          onClick={handleFullReset}
          className="text-sm font-medium"
          style={{ color: "#FFF4E0", background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Reset filters
        </button>
      </div>

      {/* Right section for reset and block number - ensure it doesn't shrink excessively and aligns well in column mode */}
      {/* This div now only contains the block number display */}
      <div className="flex items-center gap-3 mt-4 md:mt-0 flex-shrink-0"> 
        {/* Block Number Display */}
        <div className="flex items-center gap-2">
          <BlockProgressIcon
            startTime={lastBlockTimestamp}
            duration={estimatedBlockDuration}
            size={16} // Adjust size as needed
            strokeWidth={2.5}
            color="#FF3366"
          />
          <span className="text-sm font-medium" style={{ color: "#FFF4E0" }}>
            {currentBlockNumber > 0 ? currentBlockNumber.toLocaleString() : 'Loading...'}
          </span>
        </div>
      </div>
      {/* Removed old multi-row layout and selection summary section */}
    </div>
  );
};
