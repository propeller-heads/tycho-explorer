# Graph Component Refactoring Plan

## Overview
Refactoring the graph components to follow principles of small, focused components with minimized state and centralized fault recovery.

## Architecture Goals
- Components under 40 lines each
- Centralized state management
- Fault tolerance for specific failure modes
- Shared components lifted to parent directories

## Component Structure

### 1. State Management Layer
- **GraphStateManager.js** - Centralized state and error recovery
- **GraphDataProvider.jsx** - Error boundary for data fetching

### 2. Data Layer (Hooks)
- **usePoolFiltering.js** - Filter logic only
- **useNodeGeneration.js** - Node creation logic
- **useEdgeGeneration.js** - Edge creation with parallel smoothing
- **useTokenLogos.js** - Logo fetching with retry logic

### 3. Visualization Layer
- **NetworkManager.js** ✅ - Pure vis-network management
- **GraphCanvas.jsx** - Simple canvas container
- **GraphInteractionHandler.jsx** - Click/touch event handling

### 4. UI Components
- **NodeTooltip.jsx** ✅ - Node information display
- **EdgeTooltip.jsx** ✅ - Edge/pool information display
- **GraphViewport.jsx** - Combines canvas + interactions

### 5. Shared Components
- **/common/BlockProgressIcon.jsx** - Move from graph/
- **/common/EmptyStatePrompt.jsx** - Generalize TokenSelectionPrompt

## Fault Tolerance Strategy

### What Needs Fault Tolerance
1. **API Logo Fetching**
   - Retry with exponential backoff
   - Fallback to default image
   - Cache successful fetches

2. **Network Visualization**
   - Graceful degradation if vis-network fails
   - Error boundaries for render failures
   - Preserve user selections

3. **User Interactions**
   - Debounce rapid clicks
   - Handle touch/mouse consistently
   - Prevent tooltip spam

### What Doesn't Need Fault Tolerance
- Simple UI rendering
- Static data transformations
- CSS styling

## Implementation Progress

### Completed ✅
1. **NetworkManager.js** - Extracted vis-network logic (now split into 3 files under 40 lines each)
   - NetworkManager.js - Core class
   - NetworkUpdater.js - Update logic
   - networkHelpers.js - Diff utilities
2. **NodeTooltip.jsx** - Self-contained node tooltip component (split into 2 files)
   - NodeTooltip.jsx - Main component
   - NodeTooltipParts.jsx - Sub-components and styles
3. **EdgeTooltip.jsx** - Self-contained edge tooltip component (split into 2 files)
   - EdgeTooltip.jsx - Main component
   - EdgeTooltipParts.jsx - Sub-components and styles
4. **Test scaffolding** - NetworkManagerTest.jsx with route at /graph-test

### Currently Testing ⏸️
User is testing NetworkManager, EdgeTooltip, NodeTooltip and their related parts.
**DO NOT PROCEED** with next steps until testing is complete.

### Next Steps (after testing)
1. Split useGraphData hook into focused sub-hooks
2. Implement GraphStateManager for centralized state
3. Refactor GraphView to use new components
4. Move shared components to /common
5. Add error boundaries

## Testing Strategy
- Manual testing after each implementation step
- Focus on error scenarios and recovery paths
- Write comprehensive tests after refactoring complete