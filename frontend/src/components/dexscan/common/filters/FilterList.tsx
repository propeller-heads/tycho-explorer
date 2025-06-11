import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FILTER_STYLES } from './filterStyles';
import { renderFilterItem, renderEmptyState } from './filterItemRenderer';
import { useVirtualList } from './hooks';

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
  
  return (
    <ScrollArea 
      className={className}
      onViewportScroll={virtualScroll ? handleScroll : undefined}
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
  );
}