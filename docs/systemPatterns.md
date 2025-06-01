# System Patterns: Tycho Explorer

## Overall Architecture

Tycho Explorer is a monorepo application consisting of:
- **Frontend**: React/TypeScript client application that displays pool data
- **API**: Rust backend service that streams real-time on-chain liquidity data via WebSocket
- **Infrastructure**: Docker-based deployment with multi-chain support

The architecture follows a clean separation:
```
tycho-explorer/
├── api/          # Rust backend service
├── frontend/     # React frontend application
└── docs/         # Documentation and memory bank
```

## Backend Architecture (API Service)

The Rust API service handles:
1. **WebSocket Connection**: Connects to Tycho protocol for real-time pool data
2. **Chain Support**: Separate instances for Ethereum, Base, and Unichain
3. **Simulation Engine**: Provides swap simulation capabilities
4. **Health Monitoring**: Exposes health endpoints for Docker orchestration

Key patterns:
- Each chain runs as a separate Docker container (ports 3001-3003)
- WebSocket URL and API keys configured via environment variables
- Implements TVL threshold filtering for pool data

## Frontend Components (within `frontend/src/components/dexscan/`)

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
    *   **HeaderBranding** includes AppMenuSelector for app switching (Explorer/Orderbook)
    *   **Mobile Responsive**: Stacks into 2 rows on mobile (brand/network top, view selector bottom)

3.  **`ViewSelector.tsx`**:
    *   Provides toggle buttons ("Pool List", "Market Graph") for switching between the two main views.
    *   Communicates view changes back to `DexScanContent` via the `setActiveTab` (passed as `onViewChange`) callback.

4.  **`ListView.tsx`**:
    *   Displays pools in a sortable and filterable table with infinite scroll.
    *   Relies on `TokenIcon.tsx` and `ProtocolLogo.tsx` to initiate their own image fetches (no proactive pre-fetching within `ListView.tsx` itself).
    *   Manages the `displayedPoolsCount` and `isLoadingMore` states for infinite scrolling.
    *   Includes:
        *   `PoolListFilterBar`: Provides filtering capabilities with infinite scroll in popovers.
        *   `PoolTable`: The main table for displaying pool data, now supporting infinite scroll.
    *   When a pool is selected, it displays a `PoolDetailSidebar`.
    *   Handles sorting and filtering.
    *   **Important**: Passes full pool data to PoolListFilterBar (not just IDs) for enhanced filtering.

5.  **`GraphViewContent.tsx` (within `graph/`)**:
    *   Responsible for rendering the market graph visualization.
    *   Image fetching for graph nodes will also use the robust `src/lib/coingecko.ts` module.
    *   **Mobile Optimized**: Includes touch interactions, auto-centering, and mobile physics

6.  **`SwapSimulator.tsx`**:
    *   Provides an interface to simulate trades on a selected pool.

7.  **`WebSocketConfig.tsx`**:
    *   Provides UI for configuring the WebSocket connection.
    *   Supports chain selection and automatic reconnection when switching chains.
    *   Uses native HTML select for chain dropdown due to event handling issues with Radix UI.

8.  **`PoolDataContext.tsx` (within `context/`)**:
    *   Manages WebSocket connection and pool data.
    *   **Critical WebSocket Management**:
        *   Uses `socketRef` to track current WebSocket instance
        *   Proper cleanup in `disconnectWebSocket()`:
            - Nullifies ALL event handlers before closing
            - Prevents race conditions and lingering callbacks
            - Ensures clean termination when switching chains
        *   Chain switching always clears pool data with `RESET_STATE`
        *   Single WebSocket connection per session - no concurrent connections

## Data Flow

1.  **Connection**: `WebSocketConfig.tsx` establishes WebSocket connection.
2.  **Data Reception**: `PoolDataContext` receives real-time pool data.
3.  **State Update**: `PoolDataContext` processes and updates its internal state.
4.  **Consumption**: Components like `ListView.tsx` consume data from `PoolDataContext`.
5.  **External Data Fetching (Token/Protocol Logos via `src/lib/coingecko.ts`):**
    *   **Initiation:** `TokenIcon.tsx` and `ProtocolLogo.tsx` components, when rendered, initiate requests for image URLs if not already available via `token.logoURI`.
    *   **`getCoinId(symbol)`:**
        *   Manages fetching the global `/api/coingecko/coins/list`.
        *   Ensures only a **single in-flight request** for this list is active at any time.
        *   Implements **retries with exponential backoff** if the `/coins/list` fetch fails due to HTTP 429 errors.
        *   **Caching:** Caches successful list responses in memory and `localStorage`. Does **not** cache `null` (failure) if valid stale data exists or in `localStorage`, to allow future retries.
    *   **`getCoinImageURL(coinId)`:**
        *   Manages fetching individual coin details (e.g., `/api/coingecko/coins/<id>`) to get image URLs.
        *   Uses an **asynchronous request queue** (`imageRequestQueue`) to serialize these requests.
        *   A **delay (`IMAGE_REQUEST_DELAY_MS` = 10 seconds)** is enforced between each API call processed by the queue worker to respect CoinGecko's rate limits (5-15 calls/minute).
        *   A **mutex (`isProcessingImageQueue`)** ensures the queue is processed sequentially by a single worker.
        *   **Caching (Strict "Never Cache Nulls"):**
            *   API errors (4xx, 5xx, network issues) are **not** cached.
            *   If CoinGecko successfully responds but indicates no image is available for a `coinId`, this `null` result is also **not** cached.
            *   Only actual, valid image URL strings are cached in memory and `localStorage`.
    *   All API calls are proxied through the Vite dev server (`/api/coingecko/...`).
6.  **User Interaction**: Standard UI interactions update component states and views.

## Key System Patterns

*   **Context API for Global State**: `PoolDataContext` for shared pool data.
*   **Component Composition**: Standard React practice.
*   **Props for Configuration and Callbacks**.
*   **Conditional Rendering**.
*   **Infinite Scroll**: 
    *   In `ListView.tsx` and `PoolTable.tsx` for main pool list
    *   **CRITICAL**: BOTH Token AND Pool ID filter popovers in `PoolListFilterBar.tsx` MUST have infinite scroll
    *   Shows 100 items initially, loads 100 more when scrolling near bottom
    *   Resets to 100 when search term changes
    *   Uses `onViewportScroll` event to detect when user is near bottom (< 50px)
*   **UI Styling Patterns**:
    *   Glassy effects: `bg-[rgba(255,244,224,0.02-0.06)]` with `backdrop-blur`
    *   Warm cream text: `rgba(255, 244, 224, 1)` (#FFF4E0)
    *   Folly red accents: `#FF3366` for checkboxes, borders, focus states
    *   Dynamic border focus: 1px default → 2px on focus with smooth transition
    *   Search bars wrapped in div with conditional border styling
*   **URL-Driven State**: For active tab.
*   **Utility Functions**: In `src/lib/`.
*   **Protocol-Specific Fee Parsing**: 
    *   `parseFeeHexValue` in `poolUtils.ts` handles different fee formats per protocol
    *   Supports: uniswap_v2, uniswap_v3, uniswap_v4, vm:balancer_v2, ekubo_v2
    *   All fees limited to 4 decimal places for consistent display
*   **Graph View Patterns**:
    *   vis-network library for graph visualization
    *   Edge widening based on `lastUpdatedAtBlock === currentBlockNumber`
    *   Edge tooltips show pool details without external links
    *   Node tooltips show token information with pool counts
    *   **Pan Controls**: Custom PanManager class for Figma-like pan behavior
        *   Middle mouse button drag for panning
        *   Two-finger trackpad pan (detects wheel events with ctrlKey)
        *   RequestAnimationFrame for smooth 60fps panning
        *   Disabled default left-click pan (`dragView: false`)
    *   **Mobile Support**:
        *   Touch interactions enabled via vis-network configuration
        *   Mobile-optimized physics (tighter clustering, faster stabilization)
        *   Single-tap tooltips (no long press required)
        *   Direct touchend event handling for edge tooltips
    *   **🚨 CRITICAL - Layout Preservation**:
        *   NO fit() calls anywhere - prevents unwanted re-centering
        *   `autoResize: false` - prevents automatic viewport adjustments
        *   Viewport position/scale saved before data updates
        *   Viewport restored after updates with `moveTo()` (no animation)
        *   Graph initialization separated from data updates
        *   User's zoom/pan/node positions ALWAYS preserved
    *   **🚨 CRITICAL - Mobile Edge Tooltip Handler**:
        *   Separate useEffect for mobile touch handling
        *   Runs when isMobile state changes or graph updates
        *   Direct touchend event listener on canvas element
        *   Converts touch coordinates to canvas coordinates
        *   GraphManager.network and showEdgeInfoPopover made public
        *   Ensures tooltips work regardless of initialization order
*   **Robust External API Interaction (`src/lib/coingecko.ts`):**
    *   Centralized module for all CoinGecko API calls.
    *   Handles rate limiting through request queueing and delays.
    *   Handles transient errors through retries (for critical calls like `coins/list`).
    *   Implements a specific caching strategy ("never cache nulls from API errors/explicit no data").
*   **Type Definitions**: In `src/components/dexscan/types.ts`.
*   **Development Server Proxy**: For CoinGecko API.

## Mobile-First Patterns

*   **Device Detection**: `useIsMobile()` hook from `@/hooks/use-mobile`
*   **Responsive Design**: 
    *   Tailwind responsive utilities (sm:, md:, lg:)
    *   Touch targets minimum 44px (h-10 on mobile)
    *   Responsive gaps and spacing
*   **Touch Interactions**:
    *   vis-network touch configuration for graph
    *   Immediate tooltip response on tap
    *   Proper coordinate conversion (DOM to canvas)
*   **Layout Adaptations**:
    *   Header stacking on mobile screens
    *   Filter controls wrapping and full-width
    *   Truncated filter lists to prevent overflow
*   **Scrolling Patterns**:
    *   Conditional rendering based on device type
    *   Native scrolling (overflow-auto) on mobile for touch gestures
    *   Custom ScrollArea component on desktop for styled scrollbars
    *   WebKit overflow scrolling for smooth iOS experience

## Deployment Architecture

*   **Docker Compose Orchestration**: 
    *   Production: `docker-compose.yml`
    *   Development: `docker-compose.dev.yml` with hot reload
*   **Multi-Chain Deployment**:
    *   3 API containers: tycho-api-ethereum, tycho-api-base, tycho-api-unichain
    *   1 Frontend container that can switch between chains
*   **Environment Configuration**:
    *   All config via `.env` file at monorepo root
    *   No default values in compose files
    *   Chain-specific WebSocket URLs
*   **Development Features**:
    *   Hot reload via volume mounts
    *   cargo-watch for Rust auto-rebuild
    *   Vite dev server for frontend HMR

## Modularity and Dependencies

*   `dexscan` feature largely self-contained.
*   Relies on shared UI components and utilities.
*   External data dependencies: Tycho WebSocket and CoinGecko API (via robust `frontend/src/lib/coingecko.ts`).

## Source Files

This system patterns document is derived from analysis of the codebase and project documentation.
