# Phased Migration Plan for Graph Component

## Overview

This document combines the completed work from the initial refactoring plan with the new layered architecture to create a comprehensive migration strategy. The migration will be done in phases to minimize disruption while progressively improving the codebase.

## Current State Assessment

### Completed Work ✅
1. **Data Hooks Refactored**
   - `usePoolFiltering.js` - Filters pools by criteria
   - `useNodeGeneration.js` - Generates vis nodes
   - `useEdgeGeneration.js` - Generates vis edges
   - `useParallelEdgeSmoothness.js` - Edge fanning logic
   - `useTokenLogos.js` - API logo fetching
   - `useGraphData.js` - Orchestrates all hooks

2. **NetworkManager Created**
   - Core vis-network wrapper functionality
   - Update logic separated
   - Helper utilities extracted

3. **Tooltips Refactored**
   - Node and Edge tooltips split into small components
   - Styles and parts separated

4. **Test Infrastructure**
   - Comprehensive test scenarios
   - Interactive test UI at `/graph-test`

### Problems to Solve
1. **GraphManager Duplication** - Duplicates NetworkManager functionality
2. **GraphView.tsx** - 995 lines doing too many things
3. **Mixed Concerns** - UI, logic, and config mixed at root level
4. **Large Components** - GraphControls, BlockProgressIcon over 40 lines

## Phase 1: Clean Up Duplication (Week 1)

### Goal
Remove GraphManager and consolidate on NetworkManager

### Tasks
1. **Delete graph-manager/ directory**
   - Remove all GraphManager files
   - This eliminates ~350 lines of duplicate code

2. **Update GraphView to use NetworkManager**
   - Replace GraphManager references with NetworkManager
   - Temporarily keep all other logic in GraphView.tsx

3. **Move misplaced config files**
   ```
   mkdir -p config
   mv GraphNetworkOptions.js config/networkOptions.js
   mv protocolColors.js config/
   ```

4. **Test everything still works**
   - Run interactive tests at `/graph-test`
   - Verify no regression in functionality

## Phase 2: Extract Business Logic (Week 2)

### Goal
Separate business logic from UI components

### Tasks
1. **Create business layer structure**
   ```
   mkdir -p business/controllers
   mkdir -p business/interactions
   ```

2. **Extract controllers from GraphView.tsx**
   - `TooltipController.js` - Tooltip show/hide logic
   - `SelectionController.js` - Node/edge selection state
   - `GraphController.js` - Main orchestration

3. **Extract interaction handlers**
   - `ClickHandler.js` - Click event processing
   - `HoverHandler.js` - Hover event processing
   - `TouchHandler.js` - Mobile touch handling

4. **Update GraphView.tsx**
   - Remove all extracted logic
   - Use controllers via composition
   - Should shrink from 995 to ~100 lines

## Phase 3: Organize Presentation Layer (Week 3)

### Goal
Create clear UI component hierarchy

### Tasks
1. **Create presentation structure**
   ```
   mkdir -p presentation/containers
   mkdir -p presentation/components
   mkdir -p presentation/controls
   mv tooltips presentation/
   ```

2. **Split GraphControls.tsx**
   - `ControlsHeader.jsx` - Title and connection status
   - `TokenFilter.jsx` - Token selection UI
   - `ProtocolFilter.jsx` - Protocol filter UI
   - `ControlActions.jsx` - Reset button

3. **Split BlockProgressIcon.tsx**
   - `index.jsx` - Main component
   - `ProgressMath.js` - Calculation logic
   - `ProgressSVG.jsx` - SVG rendering

4. **Move components to proper locations**
   - GraphView → presentation/containers/
   - GraphCanvas → presentation/components/
   - TokenSelectionPrompt → presentation/components/

## Phase 4: Optimize Data Layer (Week 4)

### Goal
Extract pure transformations from hooks

### Tasks
1. **Create data structure**
   ```
   mkdir -p data/transformers
   mv hooks data/
   ```

2. **Extract pure functions**
   - `poolToNode.js` - Pool to node transformation
   - `poolToEdge.js` - Pool to edge transformation
   - `edgeSmoother.js` - Edge smoothing algorithm

3. **Update hooks to use transformers**
   - Hooks become thin wrappers
   - Pure logic in transformers
   - Better testability

## Phase 5: Add Fault Tolerance (Week 5)

### Goal
Implement error boundaries and recovery

### Tasks
1. **Create error boundaries**
   - `GraphErrorBoundary.jsx` - Catch vis-network errors
   - `DataErrorBoundary.jsx` - Catch data fetching errors

2. **Add retry logic**
   - Enhance `useTokenLogos` with exponential backoff
   - Add network initialization retry

3. **Implement graceful degradation**
   - Show message if vis-network fails
   - Preserve filters on error
   - Allow recovery without page reload

## Phase 6: Move Shared Components (Week 6)

### Goal
Extract reusable components to common

### Tasks
1. **Identify shared components**
   - BlockProgressIcon → /common/BlockProgress/
   - TokenSelectionPrompt → /common/EmptyState/

2. **Generalize components**
   - Make BlockProgress accept any progress data
   - Make EmptyState configurable for any use case

3. **Update imports throughout codebase**

## Migration Checklist

### Week 1 ✓
- [ ] Delete graph-manager/
- [ ] Update to use NetworkManager
- [ ] Move config files
- [ ] Test functionality

### Week 2 ✓
- [ ] Create business/controllers/
- [ ] Extract TooltipController
- [ ] Extract SelectionController
- [ ] Extract interaction handlers

### Week 3 ✓
- [ ] Create presentation structure
- [ ] Split GraphControls
- [ ] Split BlockProgressIcon
- [ ] Organize components

### Week 4 ✓
- [ ] Create data/transformers/
- [ ] Extract pure functions
- [ ] Update hooks
- [ ] Add transformer tests

### Week 5 ✓
- [ ] Add error boundaries
- [ ] Implement retry logic
- [ ] Add graceful degradation
- [ ] Test error scenarios

### Week 6 ✓
- [ ] Move to /common
- [ ] Generalize components
- [ ] Update all imports
- [ ] Final testing

## Success Metrics

1. **Code Quality**
   - No file over 40 lines
   - Single responsibility per file
   - Clear layer separation

2. **Performance**
   - Same or better render performance
   - Reduced memory usage
   - Faster initial load

3. **Maintainability**
   - New features easier to add
   - Bugs easier to locate
   - Tests easier to write

4. **Developer Experience**
   - Clear where code belongs
   - Easy to understand flow
   - Reduced cognitive load

## Risk Mitigation

1. **Gradual Migration**
   - One phase at a time
   - Test after each phase
   - Can pause between phases

2. **Backwards Compatibility**
   - Keep old GraphView.tsx until Phase 3
   - Maintain same external API
   - No breaking changes for consumers

3. **Rollback Plan**
   - Git branch for each phase
   - Can revert individual phases
   - Keep old code until proven stable

---