import React from 'react';
import { LucideChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FILTER_STYLES } from './filterStyles';
import { useFilterPopover } from './hooks';

interface FilterPopoverProps {
  buttonText: string;
  selectedCount: number;
  width?: string;
  children: React.ReactNode;
}

// Generic filter popover wrapper
export const FilterPopover: React.FC<FilterPopoverProps> = ({
  buttonText,
  selectedCount,
  width = 'w-64',
  children
}) => {
  const { open, setOpen } = useFilterPopover();
  
  // Button label with count
  const buttonLabel = selectedCount === 0 
    ? buttonText 
    : `${selectedCount} selected`;
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={FILTER_STYLES.button}
        >
          {buttonLabel}
          <LucideChevronDown 
            className={`${FILTER_STYLES.buttonChevron} ${open ? 'rotate-180' : ''}`} 
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        align="start" 
        className={`${width} p-0 ${FILTER_STYLES.popoverContent}`}
      >
        {children}
      </PopoverContent>
    </Popover>
  );
};