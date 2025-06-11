# Filter Architecture Documentation

## Overview

The Tycho Explorer uses a unified filter management system for both List View and Graph View, ensuring consistent behavior and reducing code duplication.

## Architecture Components

### 1. Filter State Management

#### `useFilterManager` Hook (`/frontend/src/hooks/useFilterManager.ts`)
The central hook that manages filter state for both views:

```typescript
interface UseFilterManagerReturn {
  selectedTokenAddresses: string[];    // Token addresses only (no objects)
  selectedProtocols: string[];         // Protocol names
  toggleToken: (address: string, isSelected: boolean) => void;
  toggleProtocol: (protocol: string, isSelected: boolean) => void;
  resetFilters: () => void;
  isInitialized: boolean;
}
```

**Key Features:**
- Works with token addresses internally (simpler state management)
- Built-in duplicate prevention in toggle functions
- Automatic persistence via `usePersistedFilters`
- Consistent interface for both views

#### `usePersistedFilters` Hook (`/frontend/src/hooks/usePersistedFilters.ts`)
Handles localStorage operations:

```typescript
// Storage key pattern:
`tycho_${viewType}View_selected${DataType}_${chain}`

// Examples:
- tycho_listView_selectedTokens_Ethereum
- tycho_graphView_selectedProtocols_Base
```

**Features:**
- Per-chain persistence (each chain maintains separate filters)
- 500ms debounced saves to prevent excessive writes
- Error handling for localStorage operations
- No default values - starts with empty arrays

### 2. UI Components

#### Filter Component Architecture (`/frontend/src/components/dexscan/common/filters/`)

**Core Components:**
- `TokenFilterPopover`: Token selection with search and virtual scrolling
- `ProtocolFilterPopover`: Protocol selection with optional color indicators
- `FilterPopover`: Generic popover wrapper for consistent behavior
- `FilterList`: Generic list component with virtual scrolling support
- `FilterSearchInput`: Reusable search input with focus states

**Shared Infrastructure:**
- `filterStyles.ts`: Centralized style constants (no magic strings)
- `filterItemRenderer.tsx`: Render helpers for consistent UI
- `hooks/`: Custom hooks for state management
  - `useFilterPopover`: Popover state and search management
  - `useFilterSearch`: Generic search filtering logic
  - `useVirtualList`: Virtual scrolling for performance

**Interface Pattern:**
```typescript
// Component interfaces
onTokenToggle: (token: Token, isSelected: boolean) => void;
onProtocolToggle: (protocol: string, isSelected: boolean) => void;

// Generic components use type parameters
interface FilterListProps<T> {
  items: T[];
  selectedItems: T[];
  onItemToggle: (item: T, isSelected: boolean) => void;
  getItemKey: (item: T) => string;
  getItemLabel: (item: T) => string;
  // ... other props
}
```

**Key Features:**
- Token search now searches **only by symbol** (not name or address)
- ~40% code reduction through component composition
- Fully type-safe generic components
- Virtual scrolling for large lists
- Consistent styling through extracted constants

### 3. View Integration

#### List View (`ListView.tsx`)
```typescript
// Use the unified hook
const {
  selectedTokenAddresses,
  selectedProtocols,
  toggleToken,
  toggleProtocol,
  resetFilters
} = useFilterManager({ viewType: 'list', chain: selectedChain });

// Convert addresses to Token objects for display
const selectedTokenObjects = useMemo(() => 
  selectedTokenAddresses
    .map(addr => allTokensForFilter.find(t => t.address === addr))
    .filter((t): t is Token => t !== undefined),
  [selectedTokenAddresses, allTokensForFilter]
);

// Simple handlers that pass through to the hook
const handleTokenToggle = useCallback((token: Token, isSelected: boolean) => {
  toggleToken(token.address, isSelected);
}, [toggleToken]);
```

#### Graph View (`GraphViewContent.tsx`)
```typescript
// Same hook usage
const {
  selectedTokenAddresses,
  selectedProtocols,
  toggleToken,
  toggleProtocol,
  resetFilters
} = useFilterManager({ viewType: 'graph', chain: selectedChain });

// Direct pass-through to GraphControls
<GraphControls 
  selectedTokens={selectedTokenAddresses}
  selectedProtocols={selectedProtocols}
  onTokenToggle={toggleToken}
  onProtocolToggle={toggleProtocol}
  onReset={resetFilters}
/>
```

## Key Design Decisions

### 1. Address-Based State
- **Decision**: Store token addresses internally, not Token objects
- **Rationale**: 
  - Simpler state management (strings vs objects)
  - Easier persistence (no serialization issues)
  - Cleaner comparisons (address equality vs object equality)
- **Implementation**: Convert to Token objects only at display layer

### 2. Individual Toggle Interface
- **Decision**: Use `onToggle(item, isSelected)` pattern everywhere
- **Rationale**: 
  - Prevents array replacement vs toggle confusion
  - Clear intent: toggle means toggle
  - Consistent with checkbox UI metaphor
- **Previous Bug**: GraphControls used array replacement, causing single-select behavior

### 3. Per-Chain Persistence
- **Decision**: Separate filter state for each blockchain
- **Rationale**: 
  - Users work with different tokens/protocols per chain
  - Better UX: switching chains preserves context
  - No filter clearing on chain switch

### 4. Duplicate Prevention
- **Decision**: Check for duplicates in toggle functions
- **Rationale**: 
  - Prevents race conditions from multiple events
  - Ensures clean state
  - Better than relying on UI to prevent duplicates

## Common Issues and Solutions

### Issue 1: Duplicate Entries in Filters
**Cause**: Multiple event firings or race conditions
**Solution**: Built-in duplicate checks in `useFilterManager`:
```typescript
if (prev.includes(address)) return prev; // Prevent duplicates
```

### Issue 2: Filters Not Persisting
**Cause**: Component unmounting before save completes
**Solution**: 500ms debounced saves ensure writes complete

### Issue 3: Single-Select Behavior
**Cause**: Interface mismatch (array replacement vs individual toggles)
**Solution**: Standardized on individual toggle interface

### Issue 4: Race Conditions on Data Updates
**Cause**: Filter loading triggered by reactive dependencies
**Solution**: Load filters only on mount/chain change, not data updates

## Migration Guide

### Converting from Old Pattern to Unified System

**Before:**
```typescript
// Complex combined state
const [filters, setFilters] = useState({ selectedTokens: [], selectedProtocols: [] });

// Generic handler with dynamic keys
const handleFilterChange = (filterKey, value, isSelected) => {
  // Complex logic with type checking
};
```

**After:**
```typescript
// Simple hook usage
const { selectedTokenAddresses, toggleToken } = useFilterManager({ viewType, chain });

// Direct handlers
const handleTokenToggle = (token, isSelected) => toggleToken(token.address, isSelected);
```

## Best Practices

1. **Always use the hook**: Don't implement custom filter logic
2. **Pass addresses, not objects**: Keep state simple
3. **Convert at display layer**: Token objects only for UI
4. **Let the hook handle persistence**: Don't add localStorage calls
5. **Trust duplicate prevention**: Don't add extra checks in components

## Testing Checklist

- [ ] Filters persist across page reloads
- [ ] Each chain maintains separate filters
- [ ] No duplicates when rapidly clicking
- [ ] Both views behave identically
- [ ] Reset clears filters and localStorage
- [ ] Token search works by symbol only
- [ ] Selected items appear at top of list
- [ ] Virtual scrolling loads more items smoothly
- [ ] Entire dropdown rows are clickable

## Recent Refactoring (2024)

### Overview
The filter components underwent a major refactoring to improve maintainability and reduce code duplication.

### Key Changes

1. **Extracted Style Constants**
   - All hardcoded styles moved to `filterStyles.ts`
   - Eliminated magic strings throughout components
   - Consistent naming with semantic style names

2. **Created Generic Components**
   - `FilterPopover`: Wrapper for consistent popover behavior
   - `FilterList`: Generic list with virtual scrolling
   - Reduced code duplication by ~40%

3. **Extracted State Logic**
   - Custom hooks for common patterns
   - Separated concerns (UI vs state management)
   - Improved testability

4. **Fixed UI Issues**
   - Entire dropdown rows now clickable (removed event conflicts)
   - Removed redundant token name display
   - Token search now only searches by symbol

### File Structure After Refactoring
```
filters/
├── TokenFilterPopover.tsx      # Simplified from 161 to 89 lines
├── ProtocolFilterPopover.tsx   # Simplified from 87 to 66 lines
├── FilterPopover.tsx           # Generic popover wrapper
├── FilterList.tsx              # Generic list component
├── FilterSearchInput.tsx       # Search input component
├── filterItemRenderer.tsx      # Render helpers
├── filterStyles.ts             # All style constants
└── hooks/                      # Custom hooks
    ├── useFilterPopover.ts
    ├── useFilterSearch.ts
    └── useVirtualList.ts
```

### Benefits
- **Maintainability**: Changes to styles or behavior in one place
- **Reusability**: Generic components for future filters
- **Performance**: Better optimization with focused hooks
- **Type Safety**: Full TypeScript support with generics
- **Code Quality**: Follows "no magic strings" principle