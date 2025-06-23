import { useMemo } from 'react';
import { protocolColors } from '../../graph/protocolColors';
import { FILTER_STYLES } from './filterStyles';
import { FilterPopover } from './FilterPopover';
import { FilterList } from './FilterList';
import { getReadableProtocolName } from '../readableProtocols';

interface ProtocolFilterPopoverProps {
  protocols: string[];
  selectedProtocols: string[];
  onProtocolToggle: (protocol: string, isSelected: boolean) => void;
  buttonText?: string;
  showColorDots?: boolean;
}

export const ProtocolFilterPopover = ({ 
  protocols, 
  selectedProtocols, 
  onProtocolToggle,
  buttonText = "Protocol",
  showColorDots = false
}: ProtocolFilterPopoverProps) => {
  // Sort protocols alphabetically
  const sortedProtocols = useMemo(() => 
    [...protocols].sort((a, b) => a.localeCompare(b)), 
    [protocols]
  );

  // Clear all selected protocols
  const handleClearAll = () => {
    selectedProtocols.forEach(protocol => onProtocolToggle(protocol, false));
  };
  
  // Select all protocols
  const handleSelectAll = () => {
    protocols.forEach(protocol => {
      if (!selectedProtocols.includes(protocol)) {
        onProtocolToggle(protocol, true);
      }
    });
  };

  return (
    <FilterPopover 
      buttonText={buttonText}
      selectedCount={selectedProtocols.length}
      width="w-64"
      selectedItems={selectedProtocols}
      getItemLabel={(protocol) => getReadableProtocolName(protocol)}
      onClearAll={handleClearAll}
    >
      {/* Selection Header with Actions */}
      <div className={`flex justify-between items-center px-3 py-2 ${FILTER_STYLES.borderBottom}`}>
        <span className={`text-sm ${selectedProtocols.length > 0 ? FILTER_STYLES.selectedCountText : 'text-muted-foreground'}`}>
          {selectedProtocols.length === 0 
            ? `Select protocols to filter`
            : selectedProtocols.length === protocols.length
            ? `Showing all protocols`
            : `Showing pools from any ${selectedProtocols.length} protocol${selectedProtocols.length !== 1 ? 's' : ''}`
          }
        </span>
        <div className="flex gap-1">
          {selectedProtocols.length < protocols.length && (
            <button
              onClick={handleSelectAll}
              className="text-xs px-2 py-1 rounded hover:bg-[#FFF4E010] text-[#FFF4E0] transition-colors"
            >
              Select All
            </button>
          )}
          {selectedProtocols.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-xs px-2 py-1 rounded hover:bg-[#FFF4E010] text-[#FFF4E0] transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      <FilterList
        items={sortedProtocols}
        selectedItems={selectedProtocols}
        onItemToggle={onProtocolToggle}
        getItemKey={(protocol) => protocol}
        getItemLabel={(protocol) => getReadableProtocolName(protocol)}
        getItemIcon={showColorDots ? (protocol) => {
          const isSelected = selectedProtocols.includes(protocol);
          return (
            <span
              className={FILTER_STYLES.colorDot}
              style={{ 
                backgroundColor: protocolColors[protocol.toLowerCase()] || '#848484',
                opacity: isSelected ? 1 : 0.7
              }}
            />
          );
        } : undefined}
        emptyMessage="No protocols available."
        virtualScroll={false}
      />
    </FilterPopover>
  );
};