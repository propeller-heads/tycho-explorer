import React from 'react';
import { LucideChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FILTER_STYLES } from './filterStyles';
import { useFilterPopover } from './hooks';

interface FilterPopoverProps {
  buttonText: string;
  selectedCount: number;
  width?: string;
  children: React.ReactNode;
  selectedItems?: any[];
  getItemLabel?: (item: any) => string;
  maxDisplayItems?: number;
  onClearAll?: () => void;
}

// Generic filter popover wrapper
export const FilterPopover: React.FC<FilterPopoverProps> = ({
  buttonText,
  selectedCount,
  width = 'w-64',
  children,
  selectedItems,
  getItemLabel,
  maxDisplayItems = 4,
  onClearAll
}) => {
  const { open, setOpen } = useFilterPopover();
  
  // Format button label based on selection count
  const formatButtonLabel = () => {
    if (selectedCount === 0) return buttonText;
    
    // Show individual items if 4 or fewer selected
    if (selectedItems && getItemLabel && selectedCount <= maxDisplayItems) {
      const labels = selectedItems.map(getItemLabel);
      const labelText = labels.join(', ');
      return labelText;
    }
    
    // Show count for more than maxDisplayItems
    return `${selectedCount} selected`;
  };
  
  const buttonLabel = formatButtonLabel();
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="relative inline-flex w-full sm:w-auto">
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className={`${FILTER_STYLES.button} truncate max-w-full !justify-between relative pr-8`}
          >
            <span className="truncate mr-1">{buttonLabel}</span>
            <span className={`${FILTER_STYLES.buttonChevron} ${selectedCount > 0 ? 'invisible' : ''} absolute right-2 top-1/2 -translate-y-1/2`}>
              {selectedCount === 0 ? (
                <LucideChevronDown className={open ? 'rotate-180' : ''} />
              ) : (
                <X className="opacity-0 pointer-events-none" />
              )}
            </span>
          </Button>
        </PopoverTrigger>
        {selectedCount > 0 && (
          <X 
            className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 cursor-pointer hover:opacity-60 text-[#FFF4E0] transition-opacity z-10"
            onClick={() => {
              console.log("debug: clicked received");
              onClearAll?.();
            }}
          />
        )}
      </div>
      <PopoverContent 
        align="start" 
        className={`${width} p-0 ${FILTER_STYLES.popoverContent}`}
      >
        {children}
      </PopoverContent>
    </Popover>
  );
};