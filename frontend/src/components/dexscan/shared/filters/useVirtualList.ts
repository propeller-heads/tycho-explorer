import { useState, useCallback, useEffect } from 'react';

interface UseVirtualListOptions {
  initialDisplayCount?: number;
  incrementSize?: number;
  scrollThreshold?: number;
}

// Virtual list scrolling logic
export const useVirtualList = <T>(
  items: T[],
  options: UseVirtualListOptions = {}
) => {
  const {
    initialDisplayCount = 100,
    incrementSize = 100,
    scrollThreshold = 50
  } = options;
  
  const [displayCount, setDisplayCount] = useState(initialDisplayCount);
  
  // Reset display count when items change significantly
  useEffect(() => {
    setDisplayCount(initialDisplayCount);
  }, [items.length, initialDisplayCount]);
  
  // Handle scroll to load more items
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const remainingScroll = target.scrollHeight - target.scrollTop - target.clientHeight;
    
    // console.log('[scroll][VirtualList] Scroll event:', {
    //   scrollHeight: target.scrollHeight,
    //   scrollTop: target.scrollTop,
    //   clientHeight: target.clientHeight,
    //   remainingScroll,
    //   threshold: scrollThreshold,
    //   shouldLoadMore: remainingScroll < scrollThreshold,
    //   currentDisplayCount: displayCount,
    //   totalItems: items.length
    // });
    
    if (remainingScroll < scrollThreshold) {
      // console.log('[scroll][VirtualList] Loading more items, from', displayCount, 'to', Math.min(displayCount + incrementSize, items.length));
      setDisplayCount(prev => Math.min(prev + incrementSize, items.length));
    }
  }, [incrementSize, items.length, scrollThreshold, displayCount]);
  
  // Get the currently visible items
  const visibleItems = items.slice(0, displayCount);
  
  return {
    visibleItems,
    displayCount,
    handleScroll,
    hasMore: displayCount < items.length
  };
};