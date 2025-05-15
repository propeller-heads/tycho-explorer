# System Patterns: Pool Explorer

## Overall Architecture

The Pool Explorer is a local client-side application built with React and TypeScript. It fetches real-time on-chain liquidity data via a WebSocket connection and presents it to the user in two main views: a Pool List and a Market Graph.

## Core Components (within `src/components/dexscan/`)

1.  **`DexScanContent.tsx`**:
    *   Acts as the main container for the application's content.
    *   Manages the active view (`pools` or `graph`) based on URL parameters and user interaction.
    *   Uses `PoolDataProvider` to make pool data available to its children.
    *   Renders `DexScanHeader`, `ListView`, and `GraphViewContent`.
    *   Controls the visibility of `ListView` and `GraphViewContent` based on the `activeTab` state.

2.  **`DexScanHeader.tsx`**:
    *   The main header component.
    *   Composed of `HeaderBranding` (left), `ViewSelector` (center), and `HeaderActions` (right).
    *   Receives `currentView` and `onViewChange` props to manage view switching.

3.  **`ViewSelector.tsx`**:
    *   Provides toggle buttons ("Pool List", "Market Graph") for switching between the two main views.
    *   Communicates view changes back to `DexScanContent` via the `setActiveTab` (passed as `onViewChange`) callback.

4.  **`ListView.tsx`**:
    *   Displays pools in a sortable and filterable table.
    *   Includes:
        *   `MetricsCards`: Shows overall statistics (total pools, protocols, unique tokens).
        *   `PoolTable`: The main table for displaying pool data.
        *   `TablePagination`: For navigating through pages of pools.
    *   When a pool is selected, it displays a "Pool Detail" card, which includes:
        *   Pool information (address, protocol, tokens).
        *   `SwapSimulator.tsx`: Allows users to simulate swaps on the selected pool.
    *   Handles sorting by various columns (ID, Tokens, Protocol, Fee, Spot Price, Dates, Block Number).
    *   Handles filtering by tokens, protocol, and pool ID.
    *   Contains logic for parsing pool fees (`parsePoolFee`, `parseFeeHexValue`), which varies by protocol.

5.  **`GraphViewContent.tsx` (within `graph/`)**:
    *   Responsible for rendering the market graph visualization.
    *   (Further details would require inspecting `GraphView.tsx`, `GraphControls.tsx`, etc.)

6.  **`SwapSimulator.tsx`**:
    *   Provides an interface to simulate trades on a selected pool.
    *   Composed of `SwapControls` (for inputting amount and selecting tokens) and `SwapResults` (for displaying simulation output).
    *   Manages state for swap amount, source/target tokens, and simulation results.

7.  **`WebSocketConfig.tsx`**:
    *   Provides UI for configuring the WebSocket connection URL and selecting the blockchain (currently Ethereum focused).
    *   Displays connection status (Connected, Reconnecting, Not Connected).
    *   Interacts with `PoolDataContext` to initiate/manage the WebSocket connection.

8.  **`PoolDataContext.tsx` (within `context/`)**:
    *   A React Context Provider that manages the WebSocket connection and pool data.
    *   Likely handles:
        *   Establishing and maintaining the WebSocket connection.
        *   Receiving, processing, and storing pool data updates.
        *   Providing access to `poolsArray`, `blockNumber`, `isConnected` status, etc., to consumer components via the `usePoolData` hook.
        *   Managing `highlightedPoolId` and `selectedChain`.

## Data Flow

1.  **Connection**: `WebSocketConfig.tsx` (via `PoolDataContext`) establishes a WebSocket connection to a Tycho-based data source.
2.  **Data Reception**: `PoolDataContext` receives real-time pool data and block updates.
3.  **State Update**: `PoolDataContext` updates its internal state (e.g., `poolsArray`, `blockNumber`).
4.  **Consumption**:
    *   `DexScanContent.tsx` consumes data from `PoolDataContext`.
    *   `ListView.tsx` receives `poolsArray`, `highlightedPoolId`, etc., to display the pool list and details.
    *   `GraphViewContent.tsx` consumes `poolsArray` (via `useGraphData` which also gets raw `pools` object) to render the graph and provide raw data for tooltips.
    *   `DexScanHeader.tsx` (indirectly, if it needs block number or connection status) might consume context data.
5.  **User Interaction**:
    *   `ViewSelector.tsx` updates `activeTab` in `DexScanContent.tsx`, changing which view is visible.
    *   Filters and sorting in `ListView.tsx` modify the displayed subset of `poolsArray`.
    *   Clicking a pool in `ListView.tsx` updates `selectedPool` and potentially `highlightedPoolId` (via `onPoolSelect` prop).
    *   `SwapSimulator.tsx` interacts with a simulation API (likely via `PoolDataContext` or a dedicated service in `simulation/simulationApi.ts`) using the selected pool's details.

## Key System Patterns

*   **Context API for Global State**: `PoolDataContext` serves as a centralized store for WebSocket connection status and shared pool data, making it accessible throughout the `dexscan` component tree.
*   **Component Composition**: Features are broken down into smaller, reusable components (e.g., `HeaderBranding`, `MetricsCards`, `SwapControls`).
*   **Props for Configuration and Callbacks**: Parent components pass data and behavior (callbacks) to child components (e.g., `DexScanHeader` passing `onViewChange` to `ViewSelector`).
*   **Conditional Rendering**:
    *   `DexScanContent` conditionally displays `ListView` or `GraphViewContent`.
    *   `ListView` conditionally displays pool details or a "select a pool" message.
*   **URL-Driven State**: The active tab (`graph` or `pools`) is synchronized with the URL's `tab` query parameter in `DexScanContent.tsx`.
*   **Utility Functions**: `src/lib/utils.ts` likely contains common helper functions (e.g., `formatPoolId`, `getExternalLink`, `cn` for class names).
*   **Type Definitions**: `src/components/dexscan/types.ts` centralizes data structure definitions (e.g., `Pool`, `WebSocketPool`).
*   **Real-time Tooltip Updates**: The graph view tooltip for token nodes dynamically calculates and updates the "pool count" (number of pools a token participates in) in real-time as new block data arrives. This involves `useGraphData` exposing raw pool data, `GraphViewContent` passing it to `GraphView`, and `GraphView`'s `GraphManager` using this data for calculation and DOM manipulation to update an open tooltip.

## Modularity and Dependencies

*   The `dexscan` feature is largely self-contained within `src/components/dexscan/`.
*   It relies on shared UI components from `src/components/ui/` and utilities from `src/lib/`.
*   The primary external dependency is the WebSocket data source.
*   `.clinerules` emphasizes modularity and reduced dependencies.

## Source Files

This system patterns document is derived from:
*   Analysis of the file structure and content within `src/components/dexscan/`.
*   `docs/specification.md` for high-level component understanding.
