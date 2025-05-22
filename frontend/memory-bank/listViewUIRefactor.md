Okay, here is the fully reiterated and consolidated final plan for refactoring the Pool List View to align with the TC Design, incorporating all clarifications and ensuring consistency.

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