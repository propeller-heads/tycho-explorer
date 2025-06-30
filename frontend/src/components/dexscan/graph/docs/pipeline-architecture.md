# Graph Pipeline Architecture

## Design Principles

Following the principles from CLAUDE.md:
- **Focused**: Each module does ONE thing well (Unix philosophy)
- **Deep**: Simple interfaces hide complex functionality (Ousterhout)
- **Independent**: Modules stand alone and are reusable (Armstrong/Erlang)
- **Harmonious**: Let errors bubble up to supervisor (fault tolerance)
- **Pipeline**: Data flows through stateless transformations

## Pipeline Flow

```
Raw Pools → Filter → Transform → Enrich → Render → Interact → Display
     ↓         ↓          ↓         ↓        ↓         ↓         ↓
   (data)   (data)     (data)    (data)  (instance) (events) (elements)
```

## Module Analysis

### 1. FilterPipeline (24 lines)
**Interface**: `filterPools(pools, selectedTokens, selectedProtocols) → filteredPools`
**State**: NONE - Pure function
**Depth**: Filtering algorithms, edge cases, optimizations
**Focus**: Filter pools by user criteria

### 2. TransformPipeline (56 lines)
**Interface**: `transformToGraph(filteredPools, currentBlock) → { nodes, edges }`
**State**: NONE - Pure transformation
**Depth**: Node extraction, edge generation, metadata assignment
**Focus**: Transform pools to graph structure

### 3. EnrichPipeline (45 lines)
**Interface**: `useEnrichedGraph(graph, filteredPools) → enrichedGraph`
**State**: MINIMAL - Only logo cache (via useTokenLogos)
**Depth**: Logo fetching, color mapping, parallel edge smoothing
**Focus**: Add visual properties

### 4. RenderPipeline (71 lines)
**Interface**: `useNetwork(container, graph) → { network, isReady }`
**State**: MINIMAL - Only network instance (necessary)
**Depth**: vis-network initialization, physics, updates, cleanup
**Focus**: Render graph to screen

### 5. InteractPipeline (48 lines)
**Interface**: `useInteractions(network) → selection`
**State**: MINIMAL - Only current selection (UI state)
**Depth**: Event handling, position tracking, interaction types
**Focus**: Process user interactions

### 6. DisplayPipeline (52 lines)
**Interface**: `DisplayTooltip({ selection, graphData, chain }) → ReactElement`
**State**: NONE - Pure component
**Depth**: Tooltip generation, positioning, data extraction
**Focus**: Display contextual tooltips

### 7. GraphPipeline (45 lines)
**Interface**: React component props
**State**: MINIMAL - Only refs for container
**Focus**: Orchestrate the pipeline

## State Analysis

**Completely Stateless** (3/7 modules):
- FilterPipeline - Pure function
- TransformPipeline - Pure function
- DisplayPipeline - Pure component

**Minimal Necessary State** (4/7 modules):
- EnrichPipeline - Logo cache for performance
- RenderPipeline - Network instance (required by vis-network)
- InteractPipeline - Selection state (required for UI)
- GraphPipeline - Container ref (required by React)

**Total State Points**: Only 4 pieces of essential state in entire system

## Why This Design Excels

1. **Deep Modules**: Each module has simple interface but does significant work
   - FilterPipeline: 1 function hides complex filtering
   - RenderPipeline: 2 exports hide entire vis-network complexity

2. **True Pipeline**: Data flows forward, no circular dependencies
   - Each stage transforms and passes data
   - No shared mutable state

3. **Fault Tolerance**: No defensive programming
   - Modules assume valid input
   - Errors bubble up to React error boundary

4. **Independence**: Modules can be:
   - Tested in isolation
   - Replaced with different implementations
   - Reused in other contexts

## Comparison with Previous Architecture

**Before**: 15+ shallow modules with scattered state
**After**: 7 deep modules with minimal, explicit state

**Before**: Complex interdependencies
**After**: Linear pipeline with clear data flow

**Before**: Defensive programming throughout
**After**: Let-it-crash philosophy with supervisor

This achieves the ideal: focused modules with narrow interfaces doing deep work.