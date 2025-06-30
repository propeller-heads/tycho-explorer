# Graph Component Overview

## Purpose
The graph component visualizes liquidity pool connections between tokens as an interactive network graph. It shows how tokens are connected through various DEX protocols, allowing users to explore the DeFi ecosystem visually.

## Architecture
The component follows a **pipeline architecture** with minimal state, where data flows through a series of focused transformations:

```
Raw Pools → Filter → Transform → Enrich → Render → Interact → Display
```

## Directory Structure

```
graph/
├── GraphPipeline.jsx          # Main orchestrator
├── GraphViewContent.jsx       # Top-level container with controls
├── pipelines/                 # Core pipeline modules
│   ├── FilterPipeline.js      # Filter pools by tokens/protocols
│   ├── TransformPipeline.js   # Convert pools to graph nodes/edges
│   ├── EnrichPipeline.js      # Add visual properties (colors, logos)
│   ├── RenderPipeline.js      # Render with vis-network
│   ├── InteractPipeline.js    # Handle user interactions
│   └── DisplayPipeline.jsx    # Show tooltips
├── config/                    # Configuration files
│   ├── networkOptions.js      # vis-network options
│   └── protocolColors.js      # Protocol color mapping
├── hooks/                     # Custom React hooks
│   ├── useTokenLogos.js       # Fetch token logos from API
│   └── useParallelEdgeSmoothness.js  # Handle parallel edges
├── tooltips/                  # Tooltip components
│   ├── NodeTooltip.jsx        # Token node tooltips
│   └── EdgeTooltip.jsx        # Pool edge tooltips
├── utils/                     # Helper functions
│   └── tooltipHelpers.js      # Extract tooltip data
└── network/                   # vis-network utilities
    └── NetworkUpdater.js      # Update network data efficiently

```

## Data Flow

### 1. Input Data
The graph receives:
- `pools` - Object of all liquidity pools from PoolDataContext
- `selectedTokens` - Array of selected token addresses
- `selectedProtocols` - Array of selected protocol names
- `selectedChain` - Current blockchain
- `currentBlockNumber` - Latest block number

### 2. Pipeline Stages

#### FilterPipeline (Pure Function)
```javascript
filterPools(pools, selectedTokens, selectedProtocols) → filteredPools[]
```
- Filters pools based on selected tokens and protocols
- Returns empty array if no tokens selected
- Protocol filtering: shows all if none selected

#### TransformPipeline (Pure Function)
```javascript
transformToGraph(filteredPools, currentBlockNumber, selectedProtocols) → { nodes, edges }
```
- Extracts unique tokens as nodes
- Creates edges from pools
- Adds metadata: pool count, protocol, width based on current block

#### EnrichPipeline (Minimal State: Logo Cache)
```javascript
useEnrichedGraph(graph, filteredPools) → enrichedGraph
```
- Fetches missing token logos via API
- Applies protocol colors to edges
- Handles parallel edge smoothing
- Uses memoization for performance

#### RenderPipeline (Minimal State: Network Instance)
```javascript
useNetwork(container, graph) → { network, isReady }
```
- Manages vis-network instance lifecycle
- Handles initialization and updates
- Disables physics after stabilization
- Cleans up on unmount

#### InteractPipeline (Minimal State: Selection)
```javascript
useInteractions(network) → { selectedNode, selectedEdge, tooltipPosition }
```
- Listens to network click events
- Tracks selected node/edge
- Calculates tooltip positions
- Handles selection clearing

#### DisplayPipeline (Pure Component)
```javascript
DisplayTooltip({ selection, graphData, chain }) → JSX
```
- Renders appropriate tooltip based on selection
- Shows node info: pools, address, connections by protocol
- Shows edge info: pool details, TVL, fee, tokens

## Key Features

### Visual Encoding
- **Edge Color**: Protocol-specific colors (defined in protocolColors.js)
- **Edge Width**: 10px if pool updated in current block AND protocol selected, else 1px

### Interactions
- **Click Node**: Shows token information tooltip
- **Click Edge**: Shows pool information tooltip
- **Click Empty Space**: Clears selection

### Performance Optimizations
- Memoized transformations prevent unnecessary recalculations
- Logo caching reduces API calls
- Physics disabled after initial layout

## State Management

The component follows a **minimal state** philosophy:

1. **FilterPipeline**: Stateless
2. **TransformPipeline**: Stateless
3. **EnrichPipeline**: Logo cache only (performance)
4. **RenderPipeline**: Network instance only (required by vis-network)
5. **InteractPipeline**: Current selection only (UI state)
6. **DisplayPipeline**: Stateless

Total: Only 3 pieces of essential state in the entire system.

## Integration Points

### Parent Component (GraphViewContent)
- Provides pool data from PoolDataContext
- Manages token/protocol selection state
- Shows TokenSelectionPrompt when <2 tokens selected
- Includes GraphControls for filtering

### Dependencies
- **vis-network**: Core graph rendering library
- **vis-data**: DataSet for efficient updates
- **PoolDataContext**: Source of pool data
- **useTokenLogo**: Token logo fetching hook

## Error Handling
Following the "let it crash" philosophy:
- No defensive programming in pipelines
- Errors bubble up to React error boundaries
- Network initialization failures logged
- Missing data results in empty graph

## Configuration

### Network Options (networkOptions.js)
- Layout: Repulsion solver for organic spread
- Physics: Enabled initially for layout, then disabled
- Interaction: Hover effects, selection, dragging disabled
- Edges: Smooth curves, arrow configuration

### Protocol Colors (protocolColors.js)
Maps protocol names to hex colors:
- uniswap_v2: #3B82F6
- uniswap_v3: #2DD4BF
- etc.

## Testing
Test files in `test/` directory provide:
- Mock pool data
- Network behavior testing
- Isolated component testing
- Visual regression testing setup

## Future Considerations
1. Add graph layout options (force, hierarchical, etc.)
2. Implement path finding between tokens
3. Add TVL-based node sizing