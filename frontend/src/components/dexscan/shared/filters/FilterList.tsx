import React, { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FILTER_STYLES } from '@/components/dexscan/shared/filters/filterStyles';
import { renderFilterItem, renderEmptyState } from '@/components/dexscan/shared/filters/filterItemRenderer';
import { useVirtualList } from '@/components/dexscan/shared/filters/useVirtualList';

interface FilterListProps<T> {
  items: T[];
  selectedItems: T[];
  onItemToggle: (item: T, isSelected: boolean) => void;
  getItemKey: (item: T) => string;
  getItemLabel: (item: T) => string;
  getItemIcon?: (item: T) => React.ReactNode;
  emptyMessage?: string;
  virtualScroll?: boolean;
  className?: string;
}

export function FilterList<T>({
  items,
  selectedItems,
  onItemToggle,
  getItemKey,
  getItemLabel,
  getItemIcon,
  emptyMessage = 'No items found.',
  virtualScroll = true,
  className = FILTER_STYLES.scrollArea
}: FilterListProps<T>) {
  // Use virtual scrolling if enabled
  const { visibleItems, handleScroll } = useVirtualList(
    items,
    { initialDisplayCount: virtualScroll ? 100 : items.length }
  );
  
  const itemsToRender = virtualScroll ? visibleItems : items;
  
  // Check if item is selected
  const isItemSelected = (item: T) => {
    const key = getItemKey(item);
    return selectedItems.some(selected => getItemKey(selected) === key);
  };
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Attach scroll handler to the actual scrolling element
  useEffect(() => {
    if (!virtualScroll || !scrollContainerRef.current) return;
    
    // Find the element with overflow-y-auto class
    const scrollElement = scrollContainerRef.current.querySelector('.overflow-y-auto') || 
                         scrollContainerRef.current.querySelector('[data-radix-scroll-area-viewport]') ||
                         scrollContainerRef.current;
    
    const handleScrollEvent = (e: Event) => {
      handleScroll(e as React.UIEvent<HTMLDivElement>);
    };
    
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScrollEvent);
      return () => scrollElement.removeEventListener('scroll', handleScrollEvent);
    }
  }, [virtualScroll, handleScroll, items.length]);
  
  return (
    <div ref={scrollContainerRef}>
      <ScrollArea 
        className={className}
        onViewportScroll={virtualScroll ? handleScroll : undefined}
        snapScroll={true}
      >
        {items.length === 0 && renderEmptyState(emptyMessage)}
        {itemsToRender.map(item => {
        const key = getItemKey(item);
        const isSelected = isItemSelected(item);
        
        return (
          <div key={key}>
            {renderFilterItem({
              isSelected,
              onClick: () => onItemToggle(item, !isSelected),
              icon: getItemIcon?.(item),
              label: getItemLabel(item),
              showSecondaryLabel: false
            })}
          </div>
        );
      })}
      </ScrollArea>
    </div>
  );
}