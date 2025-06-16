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

  return (
    <FilterPopover 
      buttonText={buttonText}
      selectedCount={selectedProtocols.length}
      width="w-64"
      selectedItems={selectedProtocols}
      getItemLabel={(protocol) => getReadableProtocolName(protocol)}
      onClearAll={handleClearAll}
    >
      {/* Selected Summary Bar */}
      {selectedProtocols.length > 0 && (
        <div className={`px-3 py-2 ${FILTER_STYLES.borderBottom}`}>
          <span className={FILTER_STYLES.selectedCountText}>
            {selectedProtocols.length} protocol{selectedProtocols.length !== 1 ? 's' : ''} selected
          </span>
        </div>
      )}

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