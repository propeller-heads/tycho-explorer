# Progress

## What Works

### Infrastructure & Deployment
- **Monorepo Structure**: Clean organization with api/, frontend/, and docs/
- **Docker Deployment**: Multi-container setup with Docker Compose
- **Multi-Chain Support**: Separate API instances for Ethereum, Base, and Unichain
- **Development Environment**: Hot reload for both frontend (Vite) and backend (cargo-watch)
- **Simple Commands**: Makefile provides easy `make dev` and `make prod` commands

### Core Functionality
- WebSocket connection to Tycho backend for real-time pool data
- Pool List View with table display of pools
- Filtering by tokens, protocols, and pool IDs
- Sorting by protocol, fee rate, spot price, and last update
- Pool selection and detail sidebar
- Swap simulator for selected pools
- View switching between Pool List and Market Graph
- Token and protocol logo fetching from CoinGecko API

### UI Components Implemented
- Main application layout with header
- Pool table with infinite scroll
- Filter bar with multi-select dropdowns
- Pool detail sidebar overlay
- Block progress indicator
- Token and protocol icons with fallbacks

### Recent Accomplishments (2025-05-29)

#### Monorepo Migration
- **Successfully migrated** from scattered directories to clean monorepo structure
- **Renamed directories** for clarity: swift-price-oracle → frontend, tycho-api → api
- **Consolidated configuration**: Single .env file at project root
- **Updated Docker paths**: Clean `./api` and `./frontend` references
- **Created Makefile**: Simple commands for development and production
- **Organized documentation**: All docs now in docs/ directory including memory-bank

#### Docker Development Environment
- **Created development Dockerfiles** with hot reload capabilities
- **Separated dev/prod ports**: Dev API on 4001-4003, prod on 3001-3003
- **Fixed cargo-watch** syntax issues for Rust hot reload
- **Removed default values** from environment configuration (critical pattern)
- **Updated WebSocket URLs** to use correct development ports

### Recent Accomplishments (2025-05-28)

#### Multi-Chain Support
- **Implemented chain switching** between Ethereum, Base, and Unichain
- **Created chain configuration** in frontend/src/config/chains.ts
- **Auto-reconnect feature**: Automatically connects to new chain when switching
- **Fixed native select**: Replaced Radix UI Select with HTML select due to event issues

### Recent Accomplishments (2025-05-27)
- **Graph View Investigation**: 
  - Identified root cause of edges not widening: WebSocket server sends 0 price updates with block updates
  - Added comprehensive logging to trace data flow through the system
  - Fixed graph view background to match List View's warm cream theme
- **Edge Tooltip Updates**:
  - Removed pool link from edge tooltip for cleaner presentation
  - Removed redundant "Block" field to avoid duplication with "Last Update"
  - Simplified tooltip to show essential information only
- **UI Polish and Fixes**:
  - Token addresses now display as shortened format (0xaabb...bbaa) in List View and Swap Simulator
  - Filter popovers updated with transparent borders and folly red checkboxes
  - Fixed favicon configuration to use /public/favicon.ico
  - Swap Simulator output amount limited to 9 decimal places display (but keeps full precision in calculations)
  - Net amount always shows full precision (never truncated)
  - Fixed "amount.split is not a function" TypeError by converting number to string
- **App Menu Selector**:
  - Added app menu selector button in header (left of Tycho Explorer)
  - Implemented dropdown with Explorer (disabled) and Orderbook (links to orderbook.wtf)
  - Styled with same glassy effect as other UI components
- **Graph View Background Enhancement**:
  - Restored purple background with proper layering to match Figma
  - Purple artboard image at 25% opacity (reduced from 40% to let comet rays through)
  - Added noise texture layer at 10% opacity
  - Removed opaque backgrounds to allow background rays to shine through
  - Adjusted backdrop blur to 16px for more background detail
- **Node Color Restoration**:
  - Fixed graph nodes to use warm cream colors instead of dark colors
  - Node background: `rgba(255, 244, 224, 0.04)`
  - Node text: `rgba(255, 244, 224, 1)`
  - Maintains consistency with overall warm cream theme
- **WebSocket Config Styling**:
  - Updated to use glassy style matching app menu selector
  - Select dropdown, input field, and button all use consistent styling
  - Background: `rgba(255,244,224,0.06)` with hover states
  - Text color: warm cream (#FFF4E0)
- **Filter Search Bar Styling**:
  - Updated search bars to match GraphControls dynamic border style
  - Default border: `rgba(255, 244, 224, 0.2)`
  - Focused border: `#FF3366` (folly red) with 2px width
  - Smooth transition effects on focus/blur

### Recent Accomplishments (2025-05-28 - Latest Session)

#### UI Consistency and Configuration
- **Token Filter Sorting**: Fixed List View token filter to sort selected tokens first, matching Graph View behavior
  - Updated `PoolListFilterBar.tsx` to sort filtered tokens with selected items at top
  - Added proper dependency tracking in useMemo for reactive updates
  - Ensures consistent UX across all views
- **Environment Variables**: Implemented WebSocket URL configuration
  - Created `.env` and `.env.example` files with `VITE_WEBSOCKET_URL`
  - Updated TypeScript definitions in `vite-env.d.ts`
  - Priority: localStorage > env variable > hardcoded default
  - UI always shows current active URL from context state
- **Mobile Sidebar Styling**: Enhanced pool detail sidebar for mobile
  - Glass-like opaque background on mobile: `bg-[rgba(20,10,35,0.98)]`
  - Maintains semi-transparent style on desktop
  - Improves readability on mobile while preserving aesthetics

### Recent Accomplishments (2025-05-27 - Latest Session)

#### 🚨 CRITICAL: Graph View Layout Preservation Fix
- **Fixed graph re-centering issue** that destroyed user's zoom/pan on block updates
- Removed all `network.fit()` calls that were causing unwanted re-centering
- Set `autoResize: false` to prevent automatic viewport adjustments
- Implemented viewport preservation in updateData method:
  - Saves current position and scale before updates
  - Restores exact viewport after data changes
  - No animation for instant restoration
- Separated graph initialization from data updates
- **This fix is CRITICAL and must be preserved**

#### 🚨 CRITICAL: Mobile Edge Tooltip Touch Handler Fix
- **Fixed edge tooltips not working on mobile** after layout preservation changes
- Root cause: touchend listener only added during initialization
- Implemented separate useEffect that:
  - Runs when isMobile state changes
  - Adds touchend event listener to canvas
  - Properly handles edge detection and tooltip display
- Made GraphManager methods public:
  - `network` property now public
  - `showEdgeInfoPopover` method now public
- **This fix is CRITICAL for mobile usability**

#### Mobile Friendliness Implementation
- **Mobile-Friendly Implementation**: Executed comprehensive mobile optimization plan
  - Phase 1 (Critical): Enabled touch interactions, auto-centering, responsive header
  - Phase 2 (UX): Mobile physics optimization, filter control stacking, responsive spacing
  - Phase 3 (Polish): Graph controls repositioning, mobile-friendly app menu
- **Graph View Touch Support**:
  - Enabled touch interactions in vis-network configuration
  - Added mobile detection using useIsMobile hook
  - Implemented mobile-optimized physics parameters (tighter clustering, faster stabilization)
  - Enhanced auto-centering with animation on mobile
  - Added re-centering when new nodes are added on mobile
- **Responsive Header Layout**:
  - Header now stacks into 2 rows on mobile (brand/network on top, view selector below)
  - Reduced gaps and font sizes for mobile screens
  - Hide "Docs" text and network name on mobile to save space
  - ViewSelector buttons have larger touch targets (44px minimum)
- **Mobile-Optimized Controls**:
  - Filter buttons in Pool List and Graph View now have 44px minimum touch targets
  - Filter controls stack vertically on mobile with proper wrapping
  - App menu selector button enlarged for better touch interaction
  - All interactive elements meet accessibility standards
- **Filter Popover Truncation**:
  - Token filters show first 3 items then "..." to prevent extending beyond screen
  - Protocol filters show first 2 items then "..." for mobile screens
  - Prevents horizontal scrolling on mobile devices
- **Graph View Tooltip Fixes**:
  - Fixed node tooltips not showing on click (networkOptions reference issue)
  - Fixed edge tooltips requiring long press on mobile
  - Added immediate touchend event handler for single-tap edge tooltips
  - Properly converts DOM to canvas coordinates for accurate detection
- **TypeScript Type Safety**:
  - Resolved all type errors in GraphView.tsx
  - Used VisNode/VisEdge type aliases to avoid conflicts with browser's Node type
  - All components now pass strict type checking
- **Mobile Table Scrolling (Chrome Fix)**:
  - Fixed touch scrolling in Pool List View table that wasn't working on Chrome Android
  - Replaced table structure with div-based layout on mobile to avoid Chrome-specific bugs
  - Removed sticky headers on mobile due to Chrome Android bug with sticky + overflow
  - Implemented proper block formatting context and simpler overflow structure
  - **Result**: Touch scrolling now works perfectly on both Chrome and Firefox mobile browsers

### Recent Accomplishments (2025-05-26)
- **Color System Overhaul**: Successfully transitioned entire UI from purple/blue theme to TC Design warm cream/beige palette
- **Text Readability**: Updated all text to use `rgba(255, 244, 224, 1)` with full opacity for maximum readability
- **Table Styling**: Implemented proper table row borders with 0.05 opacity
- **Glass Effects**: Applied backdrop blur and transparent backgrounds throughout
- **Gradient Border Technique**: Explained and documented CSS technique for gradient borders
- **Popover Styling**: Updated all filter popovers with proper glass effect matching Figma design
- **Square Checkboxes**: Changed checkbox styling from rounded to square (`rounded-none`)
- **Pool ID Tooltips**: Added tooltips showing full pool ID on hover with copy-friendly selection
- **Swap Simulator Refinements**: 
  - Fixed input field styling to match output display
  - Added smart decimal formatting (max 2 places for amounts)
  - Resolved tooltip interaction issues with row selection
- **Fee Parsing Enhancement**: 
  - Added ekubo_v2 protocol support with proper fee calculation
  - Limited all fee displays to 4 decimal places maximum
- **Filter Popover Infinite Scroll**: 
  - Implemented infinite scroll for Token and Pool ID filter popovers
  - Shows 100 items initially, loads 100 more when scrolling near bottom
  - Critical feature for handling large token/pool lists
- **Pool ID Filter Enhancement**:
  - Enhanced to show pool ID with token pair: "0x001b...23d4 (TokenA / TokenB)"
  - Search now works across pool ID AND token symbols
  - Changed to pass full pool data instead of just IDs

## Current Status

The application is now properly structured as a monorepo with clear separation between frontend and backend services. Docker deployment is fully configured for both development and production environments. The Pool List View is functionally complete with the TC Design color system fully implemented. Multi-chain support allows switching between Ethereum, Base, and Unichain networks. The UI matches the Figma design's warm aesthetic with proper text colors, borders, and glass effects.

### Recent Accomplishments (2025-06-01)

#### WebSocket Connection Management
- **Fixed WebSocket termination issue**: Old connections were not properly closing when switching chains
  - Root cause: Event handlers remained active after disconnection
  - Solution: Nullify all event handlers (onopen, onmessage, onerror, onclose) before closing
  - Result: Clean termination ensures users only see data from selected chain
- **Improved connection lifecycle**:
  - Uses `socketRef` to track current WebSocket instance
  - Prevents race conditions during chain switching
  - Ensures single active connection per session

### Recent Accomplishments (2025-06-03)

#### WebSocket URL Management Refactor
- **Removed all localStorage usage** for WebSocket URLs
  - Eliminated user-configurable URLs completely
  - WebSocket URLs now strictly from environment variables
  - Removed `websocketUrl` state from PoolDataContext
- **Simplified chain switching flow**:
  - Removed WebSocketConfig component entirely
  - Implemented direct chain selector in HeaderActions
  - Single-click chain switching with native HTML select
  - Connection status shown as colored dot (green/red)
- **URL state persistence**:
  - Chain selection stored in URL query parameter (?chain=Base)
  - Fixed race condition preventing URL-based chain loading
  - Shareable links with pre-selected chains
  - Browser navigation (back/forward) switches chains
- **Cleaner architecture**:
  - PoolDataContext reads initial chain from URL on mount
  - HeaderActions only updates URL when chain changes
  - No prop drilling - components use context directly
  - Removed ~150 lines of unnecessary component code

## Known Issues

1. **Logo Loading**: CoinGecko API rate limits can cause slow logo loading
2. **ScrollArea Integration**: Infinite scroll implementation may need refinement
3. **WebSocket Price Updates**: Server not sending price updates with new blocks, preventing edge widening visualization
4. **Graph Auto Re-center**: Graph occasionally auto re-centers (user decided not to fix)

## Evolution of Project Decisions

### Color System Evolution
1. Started with default purple/neutral theme
2. Identified need to match TC Design warm colors
3. Systematically updated all components to use `rgba(255, 244, 224, X)` values
4. User emphasized importance of full opacity (1) for text readability

### Border Implementation
1. Initially attempted complex gradient borders
2. Simplified to solid borders with low opacity for better performance
3. Documented gradient border technique for future use

### Component Architecture
1. Maintained separation between data logic (ListView) and presentation (PoolTable)
2. Kept filter state management in parent component
3. Used overlay pattern for pool detail sidebar