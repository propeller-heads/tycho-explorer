# Progress

## What Works

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
  - Swap Simulator now shows full precision for all amounts (no truncation)

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

The Pool List View is functionally complete with the TC Design color system fully implemented. The UI now matches the Figma design's warm aesthetic with proper text colors, borders, and glass effects. The application provides a sophisticated interface for exploring DEX pools with real-time data updates.

## Known Issues

1. **Logo Loading**: CoinGecko API rate limits can cause slow logo loading
2. **ScrollArea Integration**: Infinite scroll implementation may need refinement
3. **WebSocket Price Updates**: Server not sending price updates with new blocks, preventing edge widening visualization

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