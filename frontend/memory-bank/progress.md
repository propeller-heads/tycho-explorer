# Progress: Pool Explorer - Initial State

This document outlines the current implementation status of the Pool Explorer project, based on an initial review of `docs/specification.md` and the provided source code in `src/components/dexscan/`.

## What Works (Implemented Features based on `src/components/dexscan/`)

### Core UI & Navigation:
*   **Main Layout (`DexScanContent.tsx`)**:
    *   A primary content area is established.
    *   Tab-based navigation between "Pool List" and "Market Graph" views is implemented.
    *   URL synchronization for active tab (`?tab=pools` or `?tab=graph`) is present.
*   **Header (`DexScanHeader.tsx`, `HeaderBranding.tsx`, `HeaderActions.tsx`)**:
    *   A header structure is in place, including branding, view selection, and action items.
    *   `ViewSelector.tsx` allows switching between "Pool List" and "Market Graph" views.
*   **WebSocket Connection (`WebSocketConfig.tsx`, `PoolDataContext.tsx`)**:
    *   UI for configuring WebSocket URL and selecting chain (Ethereum primarily).
    *   Context (`PoolDataContext`) for managing WebSocket connection state (URL, connection status, selected chain, block number, pool data).
    *   Connection status display (Connected, Reconnecting, Not Connected).

### Pool List View (`ListView.tsx`):
*   **Display**:
    *   Renders a list of pools in a table (`PoolTable.tsx`).
    *   Displays overall metrics (`MetricsCards.tsx`): total pools, protocols, unique tokens.
    *   Pagination for the pool table (`TablePagination.tsx`).
*   **Data Columns**: Implements display for Pool Address, Tokens, Protocol, Fee Rate, Spot Price, Created At, Updated At, Last Block.
*   **Interactivity**:
    *   Sorting by various columns.
    *   Filtering by tokens (string match), protocol (string match), and pool ID (string match).
    *   Selection of a pool to view its details.
*   **Pool Detail Card**:
    *   Displays detailed information for a selected pool (address, protocol, tokens with Etherscan links).
    *   Includes a `SwapSimulator.tsx`.
*   **Fee Parsing**: Logic to parse fee data, with specific handling for `uniswap_v2`, `uniswap_v4`, and `vm:balancer_v2` (`parsePoolFee`, `parseFeeHexValue`).
*   **External Links**: Provides links to external explorers for pool addresses and token addresses.

### Swap Simulator (`SwapSimulator.tsx`, `simulation/SwapControls.tsx`, `simulation/SwapResults.tsx`):
*   UI for inputting swap amount and selecting source/target tokens from the selected pool.
*   Placeholder for displaying simulation results.
*   The actual simulation logic connection (e.g., to `simulationApi.ts` and Tycho) is present but its full functionality isn't detailed in the provided file contents alone.

### Graph View (`graph/GraphViewContent.tsx`):
*   A container component (`GraphViewContent.tsx`) exists, suggesting a placeholder or entry point for the graph visualization.
*   The actual graph rendering logic (`GraphView.tsx`, `useGraphData.ts`, etc.) is present in the file structure but not fully detailed in the initial file contents provided.

### Data Types (`types.ts`):
*   Definitions for `WebSocketPool` and `Pool` interfaces are established.

## What's Left to Build / Verify (Based on Specification vs. Current Code)

This is an initial assessment. Deeper dives are needed to confirm the extent of implementation for each feature.

### Essential Requirements:
*   **Pool List View - Columns**:
    *   TVL (in USDC): The `Pool` type in `types.ts` doesn't explicitly list TVL. It's unclear if this is calculated on the fly or expected from the WebSocket. The `ListView.tsx` doesn't explicitly show rendering TVL.
    *   Last Tx (last update) block number: `lastUpdatedAtBlock` is present.
    *   Last update time: `updatedAt` is present.
*   **Graph View**:
    *   Basic rendering of nodes (tokens) and edges (pools) based on current filter needs verification. The components exist (`GraphViewContent`, `GraphView`, `useGraphData`).
*   **Current Block Indicator**:
    *   `PoolDataContext` manages `blockNumber`. Verification needed on how/where it's displayed in both views and if it updates live.

### Important Requirements:
*   **Graph View Detail**:
    *   Click on node: See total TVL for token, number of pools, top 5 pools. (Needs verification in `GraphView.tsx` interactivity).
    *   Scale nodes by TVL: (Needs verification).
    *   Simulate on pool (in graph): (Needs verification).
    *   Edge Coloring by protocol: (Needs verification, `protocolColors.ts` exists).
    *   Filter option (protocol, min TVL, tokens): `GraphControls.tsx` exists, functionality needs verification.
    *   Show latest update on graph (flashing edges): (Needs verification).
*   **Overall Metrics**:
    *   Total number of pools indexed: `ListView` shows this for the current `poolsArray`.
    *   Total number of contracts/protocols indexed: `ListView` shows this.
    *   Total TVL indexed: (Needs verification, depends on TVL data availability).
*   **Filter View Metrics**:
    *   Total number of pools in current filter view: `ListView` shows this.
    *   Total TVL in current filter view: (Needs verification).

### Nice-to-Have Requirements:
*   Simulate trading curve in realtime: (Likely not implemented yet).
*   Path finder: (Likely not implemented yet).
*   DEX Event timeline: (Likely not implemented yet).
*   Visual Solving: (Likely not implemented yet).
*   Execute the swap: (Likely not implemented yet).
*   % depth calculation: (Likely not implemented yet).
*   Two token filter (order-idempotent): Current `ListView` filter for tokens is a single string search.

## Current Status Summary

*   The foundational UI structure, view navigation, and WebSocket data handling context are in place.
*   The "Pool List" view is substantially implemented with sorting, filtering, pagination, and a detailed pool view incorporating a swap simulator UI.
*   The "Market Graph" view has its basic components and data hooks set up, but the extent of its interactive features and visual details (scaling, coloring, filtering specific to graph) needs further verification by inspecting its dedicated components.
*   Core data types are defined.
*   Many "Important" and "Nice-to-have" features from the specification, especially advanced graph interactions and simulations, likely require further development or deeper inspection to confirm their status.
*   The connection to and capabilities of the "Tycho Simulation" backend for the swap simulator and other potential features is a key area for future exploration.

## Evolution of Project Decisions
*   (This section will be populated as the project progresses and decisions are made).
