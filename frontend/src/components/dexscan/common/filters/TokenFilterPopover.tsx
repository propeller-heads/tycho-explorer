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

  // Filter tokens based on search - only search by symbol
  const filteredTokens = useFilterSearch(
    sortedTokens,
    search,
    (token) => [token.symbol]
  );

  return (
    <FilterPopover 
      buttonText={buttonText}
      selectedCount={selectedTokens.length}
      width="w-72"
    >
      <div className="p-2">
        <FilterSearchInput 
          value={search}
          onChange={setSearch}
          placeholder="Search by name or address"
        />
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
              getItemIcon={(token) => <TokenIcon token={token} size={5} />}
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
        getItemIcon={(token) => <TokenIcon token={token} size={5} />}
        emptyMessage="No tokens found."
        virtualScroll={true}
      />
    </FilterPopover>
  );
};