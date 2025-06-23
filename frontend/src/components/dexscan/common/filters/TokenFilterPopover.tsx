import { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { FilterSearchInput } from './FilterSearchInput';
import TokenIcon from '../TokenIcon';
import { Token } from '../../types';
import { FILTER_STYLES } from './filterStyles';
import { renderSelectedSectionHeader } from './filterItemRenderer';
import { useFilterSearch } from './hooks';
import { FilterPopover } from './FilterPopover';
import { FilterList } from './FilterList';

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
  buttonText = "Token"
}: TokenFilterPopoverProps) => {
  const [search, setSearch] = useState('');
  const [selectedSectionExpanded, setSelectedSectionExpanded] = useState(false);

  // Sort tokens alphabetically
  const sortedTokens = useMemo(() => 
    [...tokens].sort((a, b) => a.symbol.localeCompare(b.symbol)),
    [tokens]
  );

  // Filter tokens based on search - search by symbol and address
  const filteredTokens = useFilterSearch<Token>(
    sortedTokens,
    search,
    (token) => [token.symbol, token.address]
  );

  // Clear all selected tokens
  const handleClearAll = () => {
    selectedTokens.forEach(token => onTokenToggle(token, false));
  };
  
  // Select all tokens (only from filtered list if searching)
  const handleSelectAll = () => {
    const tokensToSelect = search ? filteredTokens : tokens;
    tokensToSelect.forEach(token => {
      if (!selectedTokens.some(t => t.address === token.address)) {
        onTokenToggle(token, true);
      }
    });
  };

  return (
    <FilterPopover 
      buttonText={buttonText}
      selectedCount={selectedTokens.length}
      width="w-72"
      selectedItems={selectedTokens}
      getItemLabel={(token) => token.symbol}
      onClearAll={handleClearAll}
    >
      <div className="p-2">
        <FilterSearchInput 
          value={search}
          onChange={setSearch}
          placeholder="Search by name or address"
        />
      </div>
      
      {/* Selection Header with Actions */}
      <div className={`flex justify-between items-center px-3 py-2 ${FILTER_STYLES.borderBottom}`}>
        <span className={`text-sm ${selectedTokens.length > 0 ? FILTER_STYLES.selectedCountText : 'text-muted-foreground'}`}>
          {selectedTokens.length} of {tokens.length} selected
          {search && ` (${filteredTokens.length} shown)`}
        </span>
        <div className="flex gap-1">
          {(search ? filteredTokens : tokens).some(token => 
            !selectedTokens.some(t => t.address === token.address)
          ) && (
            <button
              onClick={handleSelectAll}
              className="text-xs px-2 py-1 rounded hover:bg-[#FFF4E010] text-[#FFF4E0] transition-colors"
            >
              Select {search ? 'Visible' : 'All'}
            </button>
          )}
          {selectedTokens.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-xs px-2 py-1 rounded hover:bg-[#FFF4E010] text-[#FFF4E0] transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Sticky Selected Section */}
      {selectedTokens.length > 0 && (
        <div className={`${FILTER_STYLES.borderBottom} pb-1`}>
          {renderSelectedSectionHeader(
            selectedTokens.length,
            selectedSectionExpanded,
            () => setSelectedSectionExpanded(!selectedSectionExpanded),
            ChevronDown,
            ChevronRight
          )}
          
          {selectedSectionExpanded && (
            <FilterList
              items={selectedTokens}
              selectedItems={selectedTokens}
              onItemToggle={onTokenToggle}
              getItemKey={(token) => token.address}
              getItemLabel={(token) => token.symbol}
              getItemIcon={(token) => <TokenIcon token={token} size={6} />}
              virtualScroll={false}
              className={FILTER_STYLES.selectedScrollArea}
            />
          )}
        </div>
      )}

      {/* Main Token List */}
      <FilterList
        items={filteredTokens}
        selectedItems={selectedTokens}
        onItemToggle={onTokenToggle}
        getItemKey={(token) => token.address}
        getItemLabel={(token) => token.symbol}
        getItemIcon={(token) => <TokenIcon token={token} size={6} />}
        emptyMessage="No tokens found."
        virtualScroll={true}
      />
    </FilterPopover>
  );
};