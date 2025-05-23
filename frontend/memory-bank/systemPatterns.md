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
    *   Displays pools in a sortable and filterable table with infinite scroll.
    *   Manages the `displayedPoolsCount` and `isLoadingMore` states for infinite scrolling.
    *   Includes:
        *   `PoolListFilterBar`: Provides filtering capabilities.
        *   `PoolTable`: The main table for displaying pool data, now supporting infinite scroll.
    *   When a pool is selected, it displays a `PoolDetailSidebar`, which includes:
        *   Pool information (address, protocol, tokens).
        *   `SwapSimulator.tsx`: Allows users to simulate swaps on the selected pool.
    *   Handles sorting by various columns (ID, Tokens, Protocol, Fee, Spot Price, Dates, Block Number).
    *   Handles filtering by tokens, protocol, and pool ID.
    *   Uses centralized fee parsing logic from `src/lib/poolUtils.ts`.
    *   **Note**: `MetricsCards` and `TablePagination` have been removed as part of the UI refactor and infinite scroll implementation.

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
    *   Handles:
        *   Establishing and maintaining the WebSocket connection.
        *   Receiving, processing, and storing pool data updates. This includes setting a client-side `updatedAt` timestamp (ISO string) on `Pool` objects when they are created or updated from WebSocket messages.
        *   Providing access to `poolsArray`, `blockNumber`, `isConnected` status, `updatedAt` (via Pool objects), etc., to consumer components via the `usePoolData` hook.
        *   Managing `highlightedPoolId` and `selectedChain`.

## Data Flow

1.  **Connection**: `WebSocketConfig.tsx` (via `PoolDataContext`) establishes a WebSocket connection to a Tycho-based data source.
2.  **Data Reception**: `PoolDataContext` receives real-time pool data and block updates from the WebSocket.
3.  **State Update**: `PoolDataContext` processes this data, updates its internal state (e.g., `poolsArray`, `blockNumber`), and notably sets the `updatedAt` field on individual `Pool` objects to the current client-side timestamp upon creation or modification.
4.  **Consumption**:
    *   `DexScanContent.tsx` consumes data from `PoolDataContext`.
    *   `ListView.tsx` receives `poolsArray`, `highlightedPoolId`, etc., to display the pool list and details.
    *   `GraphViewContent.tsx` consumes data from `useGraphData` (which includes processed node/edge data derived from `poolsArray` and potentially external image URLs from CoinGecko) to render the graph.
    *   `DexScanHeader.tsx` (indirectly, if it needs block number or connection status) might consume context data.
5.  **External Data Fetching (for Graph Node Logos)**:
    *   `useGraphData.ts` (via `src/lib/coingecko.ts`) fetches token logo URLs from the CoinGecko API for selected tokens.
    *   These calls are proxied through the Vite dev server to handle CORS.
    *   Fetched data (coin list and image URLs) is cached (in-memory and localStorage) to minimize API calls.
6.  **User Interaction**:
    *   `ViewSelector.tsx` updates `activeTab` in `DexScanContent.tsx`, changing which view is visible.
    *   Filters and sorting in `ListView.tsx` modify the displayed subset of `poolsArray`.
    *   Clicking a pool in `ListView.tsx` updates `selectedPool` and potentially `highlightedPoolId` (via `onPoolSelect` prop).
    *   `SwapSimulator.tsx` interacts with a simulation API (likely via `PoolDataContext` or a dedicated service in `simulation/simulationApi.ts`) using the selected pool's details.

## Key System Patterns

*   **Context API for Global State**: `PoolDataContext` serves as a centralized store for WebSocket connection status and shared pool data, making it accessible throughout the `dexscan` component tree.
*   **Component Composition**: Features are broken down into smaller, reusable components (e.g., `HeaderBranding`, `MetricsCards`, `SwapControls`).
*   **Props for Configuration and Callbacks**: Parent components pass data and behavior (callbacks) to child components (e.g., `DexScanHeader` passing `onViewChange` to `ViewSelector`).
*   **Context API for Global State**: `PoolDataContext` serves as a centralized store for WebSocket connection status and shared pool data, making it accessible throughout the `dexscan` component tree.
*   **Component Composition**: Features are broken down into smaller, reusable components (e.g., `HeaderBranding`, `SwapControls`).
*   **Props for Configuration and Callbacks**: Parent components pass data and behavior (callbacks) to child components (e.g., `DexScanHeader` passing `onViewChange` to `ViewSelector`).
*   **Conditional Rendering**:
    *   `DexScanContent` conditionally displays `ListView` or `GraphViewContent`.
    *   `ListView` conditionally displays `PoolDetailSidebar` when a pool is selected.
*   **Infinite Scroll**: Implemented in `ListView.tsx` and `PoolTable.tsx` using `ScrollArea`'s `onViewportScroll` prop to load more data as the user scrolls.
*   **URL-Driven State**: The active tab (`graph` or `pools`) is synchronized with the URL's `tab` query parameter in `DexScanContent.tsx`.
*   **Utility Functions**: 
    *   `src/lib/utils.ts` contains helper functions like `renderHexId`, `getExternalLink`, and `cn`.
    *   `src/lib/poolUtils.ts` centralizes fee parsing logic (`parsePoolFee`, `parseFeeHexValue`).
    *   `src/lib/coingecko.ts` centralizes logic for fetching data from the CoinGecko API, including caching.
*   **Type Definitions**: `src/components/dexscan/types.ts` centralizes data structure definitions (e.g., `Pool`, `WebSocketPool`).
*   **Graph Node Rendering (`GraphView.tsx` via `useGraphData.ts`)**:
    *   Nodes can now be rendered as `shape: 'circularImage'` using URLs fetched from CoinGecko, with the token symbol as a label.
    *   Fallback to `shape: 'circle'` with a text label if the image is unavailable.
*   **Graph Tooltips & Interactions (`GraphView.tsx` / `GraphManager`)**:
    *   **Node Tooltip (Token)**: Displays token address (formatted with `renderHexId`, linked to Etherscan, and copyable) and real-time pool count.
    *   **Edge Tooltip (Pool)**: Displays pool ID (formatted with `renderHexId`, linked via `getExternalLink` or Etherscan, and copyable), protocol, fee (via `parsePoolFee`), and the last update time (formatted from the client-side `pool.updatedAt` timestamp using `formatTimeAgo`).
    *   Tooltips are dismissed on other graph interactions.
    *   Real-time pool count updates for node tooltips are handled via `useGraphData` exposing raw data and `GraphManager` updating the DOM.
*   **Development Server Proxy**: Vite dev server is configured to proxy CoinGecko API requests to bypass CORS issues during local development.

## Modularity and Dependencies

*   The `dexscan` feature is largely self-contained within `src/components/dexscan/`.
*   It relies on shared UI components from `src/components/ui/` and utilities from `src/lib/`.
*   External data dependencies now include:
    *   The primary WebSocket data source (Tycho).
    *   The CoinGecko API (for token logos), accessed via `src/lib/coingecko.ts` and a dev proxy.
*   `.clinerules` emphasizes modularity and reduced dependencies.

## Source Files

This system patterns document is derived from:
*   Analysis of the file structure and content within `src/components/dexscan/`.
*   `docs/specification.md` for high-level component understanding.
