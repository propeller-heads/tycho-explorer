# List View UI Refactor Plan

This document contains the comprehensive plan for refactoring the Pool List View to align with the TC Design from Figma.

## Implementation Status (Updated 2025-05-26)

### Completed Items
- ✅ Color system overhaul - transitioned from purple/blue to warm cream/beige palette
- ✅ Updated all text to use `rgba(255, 244, 224, 1)` with full opacity
- ✅ Implemented table row borders with 0.05 opacity
- ✅ Applied glass effects with backdrop blur throughout UI
- ✅ Updated selected row styling with transparent warm backgrounds
- ✅ Modified all popover components to use warm white text
- ✅ Popover glass effects with proper backdrop blur
- ✅ Square checkboxes implementation
- ✅ Pool ID tooltips with full ID display
- ✅ Swap simulator input/output text sizing
- ✅ Fee parsing for ekubo_v2 protocol
- ✅ Filter popover infinite scroll (Token & Pool ID)
- ✅ Pool ID filter shows token pairs with enhanced search

### Remaining Items
- ⏳ Fine-tune table column widths to match TC Design proportions
- ⏳ Complete gradient border implementations where specified
- ⏳ Test across different browsers for glass effects

## Final Plan: Refactor Pool List View to TC Design (Consolidated)

### Overview

The central goal is to meticulously refactor the existing Pool List View to mirror the TC Design Figma mockups. This comprehensive update involves redesigning the main layout with a distinct panel aesthetic, introducing a new sophisticated filter bar, overhauling the data table to include rich visual elements (icons), a summary row, and infinite scroll, and integrating a new overlay sidebar for selected pool details and tools.

### Motivation

The driving force for this refactoring is to elevate the user experience by achieving complete visual and functional alignment with the TC Design. This will result in a more polished, intuitive, and information-dense interface for users exploring DEX pools. Key benefits include:
*   **Aesthetic Modernization:** Implementing the TC Design's signature blurred panels, refined typography, and consistent styling.
*   **Enhanced Data Interaction:** Providing more powerful and user-friendly filtering for tokens, protocols, and Pool IDs.
*   **Improved Information Clarity:** Displaying token and protocol icons directly in the table, alongside a consolidated summary row for key metrics.
*   **Streamlined User Workflow:** Moving pool-specific tools (like the swap simulator) into a dedicated overlay sidebar, decluttering the main view and providing a focused interaction space.
*   **Smoother Data Exploration:** Replacing traditional pagination with an infinite scroll mechanism for a more fluid browsing experience.

### Detailed Changes by Component/Concept

#### 1. `ListView.tsx` (Main Orchestrator for Pool List View)

*   **File:** `src/components/dexscan/ListView.tsx`
*   **Conceptual Change:** `ListView.tsx` will be transformed into the primary layout and state manager for the new Pool List View. It will render the main content panel (with TC Design styling) and conditionally render an overlaying sidebar for pool details. It will manage the new filter states, data processing for the table (including summary data), and the infinite scroll mechanism.

*   **Specific File Changes:**
    *   **State Variables:**
        *   `selectedPool: Pool | null`: Persists; its update triggers the sidebar.
        *   `sortConfig: {column: string, direction: 'asc' | 'desc'}`:
            *   **Modification:** The `column` type will be restricted to sortable columns: `'protocol_system'`, `'static_attributes.fee'`, `'spotPrice'`, `'updatedAt'`.
        *   `filters: ListViewFilters`:
            *   **Modification:** The `ListViewFilters` interface will be:
                ```typescript
                interface ListViewFilters {
                  selectedTokens: Array<{ address: string; symbol: string; name: string; logoURI?: string }>;
                  selectedProtocols: string[];
                  selectedPoolIds: string[]; // Array for multi-select Pool ID filter
                }
                ```
        *   `currentPage`, `totalPages`: **Remove**.
        *   `displayedPoolsCount: number`: **Add** new state for infinite scroll, initialized to a batch size (e.g., 20).
    *   **Functions/Methods:**
        *   `renderTokens` (existing): May be enhanced to return JSX with icons or its logic moved/adapted for `PoolTable.tsx`.
        *   `sortPools`:
            *   **Modification:** Update to only handle sortable columns: "Protocol", "Fee rate", "Spot price", "Last update". Sorting for "Last update" will use raw timestamps.
        *   `filterPools`:
            *   **Modification:** Update to filter based on `filters.selectedTokens`, `filters.selectedProtocols`, and `filters.selectedPoolIds`.
        *   `processedPools` (useMemo): Logic (filter then sort) remains, inputs adapt to new filter/sort logic.
        *   `handleRowClick`: Persists; setting `selectedPool` triggers the sidebar.
        *   `handleSort`:
            *   **Modification:** Ensure it only cycles through defined sortable columns.
        *   `handleFilterChange`:
            *   **Modification:** Adapt to update the new `filters` structure (arrays for tokens, protocols, Pool IDs).
        *   `handleLoadMorePools` (New Function):
            *   **Purpose:** For infinite scroll. Increments `displayedPoolsCount`.
            *   **Logic:** `setDisplayedPoolsCount(prev => Math.min(prev + BATCH_SIZE, processedPools.length));`
    *   **JSX/Rendering:**
        *   **Root `div`:**
            *   **Change:** Apply TC Design panel styling (background `rgba(255, 244, 224, 0.02)`, border `1px solid rgba(255, 244, 224, 0.2)`, `borderRadius: '12px'`, `backdropFilter: 'blur(24px)'`).
        *   **Remove `<MetricsCards />`**.
        *   **Add `<PoolListFilterBar />`:** Render at the top of the panel, passing filter state and handlers.
        *   **`PoolTable` Integration:**
            *   Remove `<Card>` wrapper around `PoolTable`.
            *   Pass `processedPools.slice(0, displayedPoolsCount)` as `displayedPools` prop.
            *   Pass `handleLoadMorePools` for infinite scroll.
            *   Pass calculated summary data: `totalPoolsInView` (from `processedPools.length`), `totalUniqueTokensInView`, `totalProtocolsInView`.
        *   **Remove `<TablePagination />`**.
        *   **Add `<PoolDetailSidebar />` (New Component):**
            *   Render conditionally if `selectedPool` exists.
            *   Style to overlay on the right (`position: fixed`, `right: 0`, `width: '435px'`, `zIndex: 50`, etc.).
    *   **Rationale:** To restructure `ListView` as the core component for the new UI, managing layout, state, and data flow according to TC Design and all user specifications.

#### 2. `PoolListFilterBar.tsx` (New Component)

*   **File:** `src/components/dexscan/pools/PoolListFilterBar.tsx` (New)
*   **Conceptual Change:** A new, dedicated component providing the TC Design's filter interface, replacing previous simple input fields.
*   **Specific File Changes:**
    *   **Props:** `filters`, `onFilterChange`, `onResetFilters`, `blockNumber`, `allTokensForFilter`, `allProtocolsForFilter`, `allPoolIdsForFilter`.
    *   **JSX/Rendering:**
        *   **Main Container `div`:** Flex row, `justify-content: space-between`, `padding: 16px`, `border-bottom: 1px solid rgba(255, 244, 224, 0.06)`.
        *   **Left Section (Filters):**
            *   **Token Filter Button/Tag:** Triggers popover for multi-token selection (search, list, checkboxes). Displays selected tokens or placeholder. Clear 'x' button.
            *   **Protocol Filter Button/Tag:** Similar, for protocols.
            *   **Pool ID Filter Button/Tag:** Triggers popover for multi-Pool ID selection (search, list, checkboxes). Tag displays "IDs: 0xab, 0x12..." for multiple selections (first byte only), `renderHexId` for single, or placeholder. Clear 'x' button.
            *   All filter tags styled per TC Design (background, border, radius, text). Popovers styled like Graph View's (blur, specific background/border).
            *   "Reset filters" text link.
        *   **Right Section (Block Timer):**
            *   **Reuse `<BlockProgressIcon />`** from `src/components/dexscan/graph/BlockProgressIcon.tsx`.
            *   Display `blockNumber` text. Styled per TC Design.
    *   **Functions:** Helper `formatDisplayPoolIds` for Pool ID tag. Handlers for popovers, selections, and clearing filters.
    *   **Rationale:** To implement the specified Token, Protocol, and multi-select Pool ID filters with TC Design aesthetics and consistent UX.

#### 3. `PoolTable.tsx` (Table Display Component)

*   **File:** `src/components/dexscan/pools/PoolTable.tsx`
*   **Conceptual Change:** Major overhaul to display data with new columns, icons, a summary row, support infinite scroll, and apply TC Design styling.
*   **Specific File Changes:**
    *   **Props:**
        *   Change `paginatedPools` to `displayedPools: Pool[]`.
        *   Remove `onFilter`, `filters`.
        *   Add `summaryData: { totalPools: number; totalUniqueTokens: number; totalProtocols: number }`.
        *   Add `onLoadMore: () => void`.
    *   **JSX/Rendering:**
        *   **Remove old filter `Input` fields.**
        *   **`ScrollArea`:** Configure for infinite scroll by detecting scroll near end and calling `onLoadMore`.
        *   **`<TableHeader>` / `<TableHead>`:**
            *   Apply TC Design styling (padding, text, bottom border).
            *   **Sort Icons:** Display only for "Protocol", "Fee rate", "Spot price", "Last update". "Tokens" and "Pool ID" columns are non-sortable and will not have sort icons or sort `onClick` handlers.
        *   **New Summary Row:**
            *   Add a `<TableRow>` below headers. Cells for:
                *   "Tokens" column: "Summary" label + "X Unique Tokens" count.
                *   "Pool ID" column: Total pools in view count.
                *   "Protocol" column: Total unique protocols in view count.
                *   Other columns (Fee, Spot, Last Update): Empty or dashed.
            *   Apply TC Design styling (padding, background, text, border).
        *   **`<TableBody>` / `<TableRow>` (Data Rows):**
            *   Styling: Apply TC Design bottom border. Hover/Selected state: whitish background (e.g., `bg-gray-100`) and black text (e.g., `text-gray-800`).
        *   **`<TableCell>` (Data Cells):**
            *   Styling: `padding: '14px 16px'`.
            *   **Tokens Cell:** Render stacked circular token icons (from CoinGecko API, handling multiple tokens per pool) followed by "TokenA / TokenB / TokenC" text.
            *   **Pool ID Cell:** Display `renderHexId(pool.id)`. Include `<a>` tag with `href` from `getExternalLink(pool)` wrapping a `LucideArrowUpRightSquare` icon.
            *   **Protocol Cell:** Render circular protocol logo (from CoinGecko API via ID mapping) followed by protocol name.
            *   **Last Update Cell:** Display `formatTimeAgo(pool.updatedAt)`.
            *   Numerical cells (Fee, Spot Price) right-aligned.
    *   **Column Widths:** Adjust to balance layout with the defined set of columns.
    *   **Rationale:** To implement the TC Design table accurately, including all specified visual elements, data presentations, and interactive behaviors like infinite scroll and correct sorting.

#### 4. `PoolDetailSidebar.tsx` (New Component for Selected Pool Details)

*   **File:** `src/components/dexscan/PoolDetailSidebar.tsx` (New)
*   **Conceptual Change:** A new, dedicated overlay panel for displaying details and tools of a selected pool.
*   **Specific File Changes:**
    *   **Props:** `pool: Pool | null`, `onClose: () => void`.
    *   **JSX/Rendering:**
        *   **Root `div`:** Styled as an overlay panel (fixed position, `width: '435px'`, TC Design background `rgba(255, 244, 224, 0.01)`, `borderLeft`, `boxShadow`, `backdropFilter: 'blur(200px)'`).
        *   **Header:** Contains close button (`LucideX`), pool name (e.g., "ETH / USDC / DAI"), protocol, and formatted Pool ID (with external link via `getExternalLink`).
        *   **Tabs:** Only "Quote simulation" tab, styled as active. "Liquidity curve" tab is omitted.
        *   **Content:** Renders the restyled `<SwapSimulator />`.
    *   **Rationale:** To provide a focused, TC Design-compliant area for pool-specific interactions, appearing as an overlay.

#### 5. `SwapSimulator.tsx` (Refactor/Restyle for Sidebar)

*   **File:** `src/components/dexscan/SwapSimulator.tsx`
*   **Conceptual Change:** Visual and structural overhaul to fit the "Quote simulation" tool design within the new sidebar.
*   **Specific File Changes:**
    *   **JSX/Rendering:**
        *   Restructure into "Sell" / "Buy" cards (TC Design background `rgba(255, 244, 224, 0.02)`, border, radius).
        *   Update typography for amounts, token display (icon, symbol, link), USD values, and summary details (Exchange Rate, Price Impact, etc.) to match Figma.
        *   Position swap direction button between cards.
    *   **Rationale:** To align the swap tool's appearance with TC Design.

#### 6. `src/lib/coingecko.ts` (CoinGecko API Utility)

*   **Conceptual Change:** Ensure robust fetching for token icons and protocol logos via CoinGecko `coinId`.
*   **Specific File Changes:**
    *   Verify/enhance functions for token icons.
    *   Add/verify `fetchCoinImageById(coinId: string)` for protocol logos (using IDs like "uniswap", "curve-dao-token"). Implement caching.
    *   **Rationale:** Unified source for all token/protocol images.

#### 7. `src/components/dexscan/types.ts` (Type Definitions)

*   **Conceptual Change:** Align `Pool` type with data needs (no TVL/Depth).
*   **Specific File Changes:**
    *   **`Pool` interface:** Confirm absence of `tvl`, `depth`. Ensure `tokens` elements can hold `logoURI`.
    *   **Rationale:** Type safety.

#### 8. `src/lib/utils.ts` (General Utilities)

*   **Conceptual Change:** Leverage existing utilities; add minor specific helpers.
*   **Specific File Changes:**
    *   `formatTimeAgo`, `getExternalLink`, `renderHexId`: Confirmed for use.
    *   New helper `formatDisplayPoolIds(ids: string[]): string` for `PoolListFilterBar.tsx` tag (e.g., "IDs: 0xab, 0x12").
    *   **Rationale:** Code reuse and specific formatting.

#### 9. Memory Bank Updates (`activeContext.md`, `progress.md`)

*   **Conceptual Change:** Document the finalized plan and all key decisions.
*   **Specific File Changes:**
    *   **`activeContext.md`:** Note "Liquidity curve" omission. Detail icon/logo strategies (CoinGecko), infinite scroll, sortable columns, filter mechanisms (multi-select Pool ID popover, tag display), sidebar overlay, multi-token display.
    *   **`progress.md`:** Summarize this comprehensive refactoring plan.
    *   **Rationale:** Accurate project documentation.

This reiterated plan is now as detailed and consistent as possible. I am ready to update the Memory Bank files. After that, we can move to implementation if you are satisfied.

---------------------------

> Let's plan it out first. Make list of changes needed to close the gaps.

⏺ I'll create a comprehensive list of changes needed to close the gaps between the current implementation and the TC Design.

⏺ Update Todos
  ⎿  ☐ Fine-tune main panel styling in ListView.tsx to match Figma exactly
     ☐ Adjust filter bar styling in PoolListFilterBar.tsx - colors, borders, tag appearance
     ☐ Update table styling in PoolTable.tsx - header colors, cell padding, borders
     ☐ Fix infinite scroll implementation in PoolTable.tsx
     ☐ Fix table column widths to match TC Design proportions
     ☐ Update entire color scheme from purple/neutral to warm cream/beige
     ☐ Verify StackedTokenIcons CSS for proper overlap styling
     ☐ Test all filter functionalities thoroughly
     ☐ Test sorting for all sortable columns
     ☐ Test row selection and sidebar display/dismissal
     ☐ Run lint and type check commands

⏺ Detailed List of Changes Needed

  1. Color Scheme Overhaul (Critical)

  - Main Panel Background: Change from bg-purple-900/10 to rgba(255, 244, 224, 0.02)
  - Border Colors: Replace all purple/neutral borders with TC Design warm tones
  - Text Colors: Replace text-white, text-neutral-* with #FFF4E0 and its opacity variants

  2. ListView.tsx Changes

  - Main panel background: rgba(255, 244, 224, 0.02)
  - Border: Gradient border using linear-gradient(180deg, #FFF4E0 0%, rgba(255, 244, 224, 0.64) 100%)
  - Backdrop filter: blur(24px)
  - Remove purple tints completely

  3. PoolListFilterBar.tsx Changes

  - Border bottom: Change from border-white/10 to border-[rgba(255,244,224,0.06)]
  - Filter tag backgrounds: Change from bg-white/5 to bg-[rgba(255,244,224,0.06)]
  - Selected filter borders: Add border-[rgba(255,244,224,0.4)]
  - Text colors: Change to #FFF4E0 with appropriate opacity
  - Popover backgrounds: Adjust to match TC Design warm tones
  - "Reset filters" link: Style to match TC Design

  4. PoolTable.tsx Changes

  - Column Widths (Critical fix):
    - Tokens: ~200px (currently too wide)
    - Pool ID: ~140px
    - Protocol: ~120px
    - Fee rate: ~80px
    - Spot Price: ~120px
    - Last update: ~140px
  - Header Styling:
    - Background: Remove bg-neutral-900
    - Text: rgba(255, 244, 224, 0.64) instead of text-white/60
    - Font: Ensure Inter 500 13px
  - Summary Row:
    - Background: rgba(255, 244, 224, 0.02) instead of bg-white/5
    - Text: #FFF4E0 instead of text-white
    - Font: Inter 600 16px
  - Data Rows:
    - Border: Gradient border like headers
    - Text: #FFF4E0 instead of white
    - Hover state: Adjust to TC Design
    - Selected state: Keep whitish background but ensure proper contrast

  5. PoolDetailSidebar.tsx Changes

  - Already mostly aligned, just needs color adjustments to match warm theme

  6. Token/Protocol Icons

  - Border colors: Adjust from border-gray-800 to match TC Design
  - Background colors: Warmer tones instead of bg-gray-700

  7. Infinite Scroll Fix

  - Current implementation has issues with ScrollArea
  - Need to properly integrate scroll detection with Radix ScrollArea component

  8. Overall Theme Consistency

  - Remove all references to purple (purple-500, purple-600, etc.)
  - Replace all neutral colors (neutral-700, neutral-900, etc.) with TC Design equivalents
  - Ensure consistent use of #FFF4E0 as primary text color

  The most critical issues are:
  1. The color scheme (purple vs warm cream)
  2. The table column widths
  3. The gradient borders throughout

  Would you like me to start implementing these changes systematically?

> Keep planning: be more elaborate and detailed in your plans. Read the codebase liberally.

⏺ I'll read through the codebase more thoroughly to create a comprehensive, detailed plan.

⏺ Read(src/components/dexscan/pools/PoolListFilterBar.tsx)…
  ⎿  Read 286 lines (ctrl+r to expand)

⏺ Read(src/components/dexscan/pools/PoolTable.tsx)…
  ⎿  Read 257 lines (ctrl+r to expand)

⏺ Read(src/components/ui/button.tsx)…
  ⎿  Read 50 lines (ctrl+r to expand)

⏺ Read(src/components/ui/scroll-area.tsx)…
  ⎿  Read 50 lines (ctrl+r to expand)

⏺ Read(src/components/dexscan/graph/BlockProgressIcon.tsx)…
  ⎿  Read 92 lines (ctrl+r to expand)

⏺ Search(pattern: "**/*.css", path: "src")…
  ⎿  Found 2 files (ctrl+r to expand)

⏺ Read(src/index.css)…
  ⎿  Read 100 lines (ctrl+r to expand)

⏺ Comprehensive Detailed Plan for Pool List View Refactor

  After thoroughly analyzing the codebase and comparing with the TC Design from Figma, here's the complete detailed plan:

  1. ListView.tsx - Main Panel Styling (Todo #1)

  Current Issues:
  - Background: bg-purple-900/10 (purple tint) → Should be rgba(255, 244, 224, 0.02) (warm cream)
  - Border: border-purple-500/30 → Should be gradient border
  - Class-based styling → Need inline styles for gradient border

  Specific Changes:
  // Line 234 - Replace entire div styling
  // FROM:
  <div className="flex-grow flex flex-col bg-purple-900/10 backdrop-blur-xl rounded-xl border border-purple-500/30 overflow-hidden shadow-2xl">

  // TO:
  <div
    className="flex-grow flex flex-col overflow-hidden rounded-xl"
    style={{
      background: 'rgba(255, 244, 224, 0.02)',
      border: '1px solid transparent',
      backgroundImage: 'linear-gradient(rgba(255, 244, 224, 0.02), rgba(255, 244, 224, 0.02)), linear-gradient(180deg, rgba(255, 244, 224, 1) 0%, rgba(255, 244, 224,
   0.64) 100%)',
      backgroundOrigin: 'border-box',
      backgroundClip: 'padding-box, border-box',
      backdropFilter: 'blur(24px)',
      boxShadow: '0px 4px 24px 0px rgba(0, 0, 0, 0.08)'
    }}
  >

  2. PoolListFilterBar.tsx - Complete Color Overhaul (Todo #2)

  Line-by-line changes needed:

  Line 108:
  // FROM:
  <div className="flex items-center justify-between p-4 border-b border-white/10">
  // TO:
  <div className="flex items-center justify-between p-4 border-b border-[rgba(255,244,224,0.06)]">

  Lines 113, 168, 209 - Filter Button Styling:
  // FROM:
  className="h-8 border-dashed bg-white/5 hover:bg-white/10 text-xs text-white/80"
  // TO:
  className="h-8 border-dashed bg-[rgba(255,244,224,0.06)] hover:bg-[rgba(255,244,224,0.1)] text-xs text-[#FFF4E0]/80 border-[rgba(255,244,224,0.2)]"

  When selected (needs conditional styling):
  // Add to button className when items.length > 0:
  "border-[rgba(255,244,224,0.4)] border-solid"

  Lines 121, 176, 217 - Popover Content:
  // FROM:
  className="w-72 p-0 bg-neutral-900/90 backdrop-blur-md border-neutral-700 shadow-2xl"
  // TO:
  className="w-72 p-0 bg-[rgba(25,10,53,0.95)] backdrop-blur-2xl border-[rgba(255,244,224,0.1)] shadow-2xl"

  Lines 127, 223 - Search Input:
  // FROM:
  className="pl-8 h-8 text-xs bg-neutral-800/80 border-neutral-700 text-white focus-visible:ring-purple-500"
  // TO:
  className="pl-8 h-8 text-xs bg-[rgba(255,244,224,0.04)] border-[rgba(255,244,224,0.1)] text-[#FFF4E0] placeholder:text-[rgba(255,244,224,0.4)]
  focus-visible:ring-[rgba(255,244,224,0.3)] focus-visible:ring-1"

  Lines 131, 230 - Search Icon:
  // FROM:
  className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400"
  // TO:
  className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgba(255,244,224,0.4)]"

  Lines 135, 178, 234 - Empty State Text:
  // FROM:
  className="text-xs text-neutral-400 text-center py-2"
  // TO:
  className="text-xs text-[rgba(255,244,224,0.4)] text-center py-2"

  Lines 141, 184, 240 - Hover Item:
  // FROM:
  className="flex items-center space-x-2 p-1.5 rounded-md hover:bg-neutral-700/70 cursor-pointer"
  // TO:
  className="flex items-center space-x-2 p-1.5 rounded-md hover:bg-[rgba(255,244,224,0.06)] cursor-pointer"

  Lines 148, 191, 247 - Checkbox:
  // FROM:
  className="border-neutral-600 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
  // TO:
  className="border-[rgba(255,244,224,0.3)] data-[state=checked]:bg-[rgba(255,244,224,0.8)] data-[state=checked]:border-[rgba(255,244,224,0.8)]
  data-[state=checked]:text-[#190A35]"

  Lines 153, 195, 251 - Label Text:
  // FROM:
  className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 truncate text-white/90"
  // TO:
  className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 truncate text-[#FFF4E0]/90"

  Line 156 - Token Name Span:
  // FROM:
  <span className="text-neutral-400 text-xs">{token.name}</span>
  // TO:
  <span className="text-[rgba(255,244,224,0.5)] text-xs">{token.name}</span>

  Line 263 - Reset Filters Link:
  // FROM:
  className="h-8 text-xs text-white/60 hover:text-white/80"
  // TO:
  className="h-8 text-xs text-[rgba(255,244,224,0.64)] hover:text-[#FFF4E0] underline-offset-2"

  Line 278 - Block Number:
  // FROM:
  <span className="text-sm font-medium text-white/80">{blockNumber}</span>
  // TO:
  <span className="text-sm font-medium text-[rgba(255,244,224,0.8)]">{blockNumber}</span>

  3. PoolTable.tsx - Major Styling & Width Fixes (Todo #3 & #10)

  Critical Column Width Fix (Line 116-121):
  // FROM:
  column.id === 'tokens' ? "w-[250px]" :
  column.id === 'id' ? "w-[180px]" :
  column.id === 'protocol_system' ? "w-[150px]" :
  column.id === 'static_attributes.fee' ? "w-[100px]" :
  column.id === 'spotPrice' ? "w-[150px]" :
  column.id === 'updatedAt' ? "w-[180px]" : "w-auto"

  // TO (Balanced widths totaling ~800px):
  column.id === 'tokens' ? "w-[200px]" :
  column.id === 'id' ? "w-[140px]" :
  column.id === 'protocol_system' ? "w-[120px]" :
  column.id === 'static_attributes.fee' ? "w-[80px]" :
  column.id === 'spotPrice' ? "w-[120px]" :
  column.id === 'updatedAt' ? "w-[140px]" : "w-auto"

  Line 106 - Header Row:
  // FROM:
  <TableRow className="border-b border-white/10 sticky top-0 bg-neutral-900 z-10">
  // TO:
  <TableRow
    className="sticky top-0 z-10"
    style={{
      borderBottom: '1px solid transparent',
      borderImage: 'linear-gradient(90deg, rgba(255, 244, 224, 1) 0%, rgba(255, 244, 224, 0.64) 100%) 1',
      background: 'transparent'
    }}
  >

  Line 113 - Table Head Text:
  // FROM:
  "p-4 text-xs font-medium text-white/60"
  // TO:
  "px-4 py-3.5 text-[13px] font-medium text-[rgba(255,244,224,0.64)]"

  Line 133 - Sort Icon Color:
  // FROM:
  <ChevronsUpDown className="h-3 w-3 text-white/40" />
  // TO:
  <ChevronsUpDown className="h-3 w-3 text-[rgba(255,244,224,0.4)]" />

  Line 142 - Summary Row:
  // FROM:
  <TableRow className="border-b border-white/10 bg-white/5">
  // TO:
  <TableRow
    className=""
    style={{
      borderBottom: '1px solid rgba(255, 244, 224, 0.06)',
      background: 'rgba(255, 244, 224, 0.02)'
    }}
  >

  Line 144 - Summary Cell:
  // FROM:
  className="p-2 px-4 text-sm font-semibold text-white"
  // TO:
  className="py-2 px-4 text-base font-semibold text-[#FFF4E0]"

  Line 148 - Summary Subtext:
  // FROM:
  <span className="text-xs font-normal text-white/70">{summaryData.totalUniqueTokens} Unique Tokens</span>
  // TO:
  <span className="text-xs font-normal text-[rgba(255,244,224,0.7)]">{summaryData.totalUniqueTokens} Unique Tokens</span>

  Line 171 - Data Row Border:
  // FROM:
  "cursor-pointer border-b border-white/20"
  // TO:
  "cursor-pointer"
  // Add style prop:
  style={{
    borderBottom: '1px solid transparent',
    borderImage: 'linear-gradient(90deg, rgba(255, 244, 224, 1) 0%, rgba(255, 244, 224, 0.64) 100%) 1'
  }}

  Line 174 - Hover State:
  // FROM:
  : "hover:bg-white/5"
  // TO:
  : "hover:bg-[rgba(255,244,224,0.02)]"

  Lines 185, 210, 214, 216, 218 - Text Colors:
  // FROM:
  isRowSelected ? "text-gray-800" : "text-white"
  // TO:
  isRowSelected ? "text-gray-800" : "text-[#FFF4E0]"

  Line 192 - Pool ID Text:
  // FROM:
  isRowSelected ? "text-gray-700" : "text-white/80"
  // TO:
  isRowSelected ? "text-gray-700" : "text-[rgba(255,244,224,0.8)]"

  Line 227 - Cell Padding:
  // FROM:
  "p-4 text-sm"
  // TO:
  "px-4 py-3.5 text-sm"

  Line 241 - Empty State:
  // FROM:
  className="h-24 text-center text-white/60"
  // TO:
  className="h-24 text-center text-[rgba(255,244,224,0.6)]"

  4. ScrollArea Integration Fix (Todo #4)

  The current implementation has issues with the ref attachment. Need to modify the approach:

  Lines 91-103 - Replace entire ScrollArea implementation:
  // The issue is that ScrollArea's viewport is not directly accessible
  // Solution: Use the onScroll prop of ScrollAreaViewport
  <ScrollArea className="w-full flex-grow">
    <ScrollAreaPrimitive.Viewport
      className="h-full w-full"
      onScroll={(e) => {
        const target = e.currentTarget;
        if (!hasMorePools) return;
        if (target.scrollHeight - target.scrollTop - target.clientHeight < 200) {
          onLoadMore();
        }
      }}
    >
      <Table className="table-fixed w-full">
        {/* Table content */}
      </Table>
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar orientation="vertical" />
    <ScrollBar orientation="horizontal" />
  </ScrollArea>

  5. Icon Components Color Updates (Todo #5)

  TokenIcon.tsx (Line 40-41):
  // FROM:
  className={`rounded-full bg-gray-700 border-2 border-gray-800 flex items-center justify-center ${textSizeClass} overflow-hidden shrink-0`}
  // TO:
  className={`rounded-full bg-[rgba(255,244,224,0.1)] border-2 border-[rgba(255,244,224,0.2)] flex items-center justify-center ${textSizeClass} overflow-hidden
  shrink-0`}

  ProtocolLogo.tsx (Line 45-46):
  // FROM:
  className={`rounded-full bg-blue-700 border-2 border-blue-800 flex items-center justify-center ${textSizeClass} overflow-hidden shrink-0`}
  // TO:
  className={`rounded-full bg-[rgba(255,244,224,0.15)] border-2 border-[rgba(255,244,224,0.25)] flex items-center justify-center ${textSizeClass} overflow-hidden
  shrink-0`}

  StackedTokenIcons +N indicator (PoolTable.tsx Line 23):
  // FROM:
  <div className="w-6 h-6 rounded-full bg-gray-600 border-2 border-gray-800 flex items-center justify-center text-xs">
  // TO:
  <div className="w-6 h-6 rounded-full bg-[rgba(255,244,224,0.1)] border-2 border-[rgba(255,244,224,0.2)] flex items-center justify-center text-xs text-[#FFF4E0]">

  6. BlockProgressIcon Color Update

  Line 274 in PoolListFilterBar.tsx:
  // FROM:
  color="hsl(var(--primary))"
  // TO:
  color="#FF3366"

  7. Additional Considerations

  1. Remove all purple references throughout the codebase
  2. Update any focus states to use warm colors instead of purple
  3. Ensure consistent use of #FFF4E0 as the primary text color
  4. Test gradient borders across different browsers
  5. Verify backdrop-filter blur works correctly with the new background

  This comprehensive plan addresses all visual discrepancies between the current implementation and the TC Design, with specific line-by-line changes for each file.