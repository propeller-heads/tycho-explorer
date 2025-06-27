# Token Filter Infinite Scroll Fix Documentation

## Problem Summary
The token filter's infinite scroll functionality stopped working. Users could only see the first 100 tokens out of 2,188 total tokens, with no ability to load more by scrolling.

## Root Cause Analysis

### The Dual Scroll System Conflict

The issue stemmed from having two competing scroll systems:

1. **RadixUI ScrollArea Component**
   - A React component that provides custom scrollbar styling and behavior
   - Creates its own internal scroll structure with viewport and scrollbar elements
   - Expects to handle scroll events through its `onViewportScroll` prop

2. **CSS overflow-y: auto**
   - Browser's native scroll system
   - Applied via the `FILTER_STYLES.scrollArea` class in `filterStyles.ts`
   - Was overriding the ScrollArea's internal scroll handling

### Technical Details

#### DOM Structure
```
<div ref={scrollContainerRef}>                           // Added wrapper
  <ScrollArea className={FILTER_STYLES.scrollArea}>      // RadixUI component
    <ScrollAreaPrimitive.Root>                           // overflow: hidden
      <ScrollAreaPrimitive.Viewport>                     // overflow: auto (internal)
        {/* Token items */}
      </ScrollAreaPrimitive.Viewport>
    </ScrollAreaPrimitive.Root>
  </ScrollArea>
</div>
```

#### The Conflicting CSS Class
```typescript
// filterStyles.ts
scrollArea: "h-auto max-h-[340px] sm:max-h-[408px] md:max-h-[476px] lg:max-h-[510px] max-h-[calc(80vh-120px)] p-2 overflow-y-auto"
```

The `overflow-y-auto` at the end was creating a scroll container on the ScrollArea root element, which already had `overflow: hidden` from RadixUI.

### Why Infinite Scroll Failed

1. **Event Propagation Issue**
   - Scroll events were firing on the outer div (with CSS overflow-y-auto)
   - ScrollArea's viewport wasn't receiving these events
   - The `onViewportScroll` prop was never triggered
   - The `handleScroll` function from `useVirtualList` never executed

2. **Virtual List Logic**
   ```typescript
   // useVirtualList.ts
   const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
     const target = event.currentTarget;
     const remainingScroll = target.scrollHeight - target.scrollTop - target.clientHeight;
     
     if (remainingScroll < scrollThreshold) {
       setDisplayCount(prev => Math.min(prev + incrementSize, items.length));
     }
   }, [incrementSize, items.length, scrollThreshold, displayCount]);
   ```
   
   This logic checks if the user has scrolled within 50px of the bottom, then loads 100 more items. But it was never being called.

## The Solution

### Implementation
```typescript
// FilterList.tsx
const scrollContainerRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (!virtualScroll || !scrollContainerRef.current) return;
  
  // Find the element with overflow-y-auto class
  const scrollElement = scrollContainerRef.current.querySelector('.overflow-y-auto') || 
                       scrollContainerRef.current.querySelector('[data-radix-scroll-area-viewport]') ||
                       scrollContainerRef.current;
  
  const handleScrollEvent = (e: Event) => {
    handleScroll(e as any);
  };
  
  if (scrollElement) {
    scrollElement.addEventListener('scroll', handleScrollEvent);
    return () => scrollElement.removeEventListener('scroll', handleScrollEvent);
  }
}, [virtualScroll, handleScroll, items.length]);
```

### How It Works

1. **Element Discovery**: Uses querySelector to find the actual scrolling element (the one with overflow-y-auto)
2. **Direct Event Binding**: Attaches scroll event listener directly to that element
3. **Bypass ScrollArea**: Ignores ScrollArea's event system entirely
4. **Native Events**: Uses browser's native addEventListener for reliability

## Lessons Learned

### 1. Single Scroll Container Principle
Only one element should handle scrolling in a given area. Multiple overflow properties create conflicts.

### 2. Component Abstraction Limitations
Third-party components like RadixUI ScrollArea expect specific DOM structures. Adding additional scroll properties breaks their assumptions.

### 3. Debugging Scroll Issues
- Check computed styles for ALL elements in the hierarchy
- Look for multiple `overflow` properties
- Use browser DevTools to identify which element has the scrollbar
- Test scroll events at multiple levels of the DOM tree

### 4. Event Flow Understanding
```
User Input → Browser Scroll Event → Target Element → Event Bubbling → JavaScript Handlers
```
If the target element is unexpected, handlers attached to other elements won't fire.

## Alternative Solutions (Not Implemented)

1. **Remove CSS overflow**: Remove `overflow-y-auto` from filterStyles.ts
2. **Custom Scroll Component**: Build a custom scroll component instead of using RadixUI
3. **Intersection Observer**: Use Intersection Observer API for infinite scroll instead of scroll events
4. **Virtual Scrolling Library**: Use react-window or react-virtualized

## Technical References

- [RadixUI ScrollArea Documentation](https://www.radix-ui.com/docs/primitives/components/scroll-area)
- [MDN: overflow CSS property](https://developer.mozilla.org/en-US/docs/Web/CSS/overflow)
- [MDN: Element.addEventListener()](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)
- [React useEffect Hook](https://react.dev/reference/react/useEffect)

## Related Files

- `/frontend/src/components/dexscan/common/filters/FilterList.tsx` - Main implementation
- `/frontend/src/components/dexscan/common/filters/hooks/useVirtualList.ts` - Virtual scroll logic
- `/frontend/src/components/dexscan/common/filters/filterStyles.ts` - CSS classes
- `/frontend/src/components/ui/scroll-area.tsx` - RadixUI wrapper component