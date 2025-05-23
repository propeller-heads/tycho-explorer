# Progress: Pool Explorer - Pool List View Refactor Nearing Completion

This document outlines the current implementation status and planned work for the Pool Explorer project.

## What Works (Implemented Features based on `src/components/dexscan/`)

### Core UI & Navigation:
*   **Main Layout (`DexScanContent.tsx`)**: Functional.
*   **Global Background (`App.tsx`)**: TC Design multi-layered background implemented.
*   **Header (`DexScanHeader.tsx`, etc.)**: Standard structure in place.
*   **WebSocket Connection (`WebSocketConfig.tsx`, `PoolDataContext.tsx`)**: Functional.

### Pool List View (`ListView.tsx` & Sub-components):
*   **Current State (As of May 22, 2025 - Visual Alignment Complete)**:
    *   **`types.ts`**: `Token` interface defined and exported, includes optional `name` and `logoURI`.
    *   **`common/TokenIcon.tsx` (New Shared Component)**: Created. Fetches token images from CoinGecko. Uses inline styles for dynamic sizing.
    *   **`common/ProtocolLogo.tsx` (New Shared Component)**: Created. Fetches protocol logos from CoinGecko via ID mapping. Uses inline styles for dynamic sizing.
        *   **Fallback Styling**: Changed fallback background color to `bg-white/5 border border-white/10` for a more neutral, transparent appearance.
    *   **`PoolListFilterBar.tsx` (New & Implemented)**:
        *   Structure and styling per TC Design. Props for `BlockProgressIcon` corrected. Uses imported `Token` type.
        *   **Popover Content Implemented**: For Tokens (with search, list, checkboxes, `TokenIcon`), Protocols (list, checkboxes), and Pool IDs (search, list using `renderHexId`, checkboxes).
        *   **Block Circular Timer Color**: Changed `color` prop for `BlockProgressIcon` to `#FF3366` (red).
    *   **`ListView.tsx` (Refactored)**:
        *   Imports updated; uses imported `Token` type for filters.
        *   `ListViewFilters` interface defined for `selectedTokens: Token[]`, `selectedProtocols: string[]`, `selectedPoolIds: string[]`.
        *   `COLUMNS` constant updated: Tokens (non-sortable), Pool ID (non-sortable), Protocol (sortable), Fee Rate (sortable), Spot Price (sortable), Last Update (sortable). TVL/Depth columns removed.
        *   State management for infinite scroll (`displayedPoolsCount`) and new filter structure implemented.
        *   `usePoolData` hook integrated. Helper functions for populating filter lists created.
        *   `sortPools` and `filterPools` logic updated. `summaryData` calculation added.
        *   `handleFilterChange` and `handleResetFilters` implemented.
        *   Render logic uses new components; main panel styled per TC Design (blur, border).
        *   **Background Styling**: Main panel container `div` updated to `bg-[rgba(255,244,224,0.02)]` and `border-[rgba(255,244,224,0.3)]` for improved transparency and Figma alignment.
    *   **`PoolDetailSidebar.tsx` (New & Styled)**:
        *   Created and styled as an overlay panel per TC Design (using arbitrary Tailwind values for precise color/shadow matching).
        *   Header implemented with pool info (multi-token aware) and close button.
        *   "Quote simulation" tab styled as active. "Liquidity curve" tab omitted.
        *   Refactored `SwapSimulator.tsx` integrated.
    *   **`PoolTable.tsx` (Refactored)**:
        *   Props updated for `displayedPools`, `summaryData`, infinite scroll. Old filter props removed.
        *   `ScrollArea` adapted with `useEffect` for infinite scroll detection.
        *   Table headers styled per TC Design; sort icons updated. Sticky header styling added.
        *   New summary row implemented (Total Pools, Unique Tokens, Protocols).
        *   Data row styling updated (border, hover/selected states: whitish background, black text).
        *   Cell rendering updated: `StackedTokenIcons` (uses `TokenIcon`), `ProtocolLogo`, `renderHexId`, `getExternalLink`, `formatTimeAgo`.
        *   **Column Widths**: Adjusted `TableHead` widths for 'tokens', 'id', 'protocol_system', 'static_attributes.fee', 'spotPrice', and 'updatedAt' to match Figma specifications.
    *   **`SwapSimulator.tsx` (Refactored)**:
        *   Restructured with `SwapCard` and `TokenDisplay` sub-components. `Tabs` removed. Styled for sidebar. Mock simulation logic and state management in place.

## What's Left to Build / Verify (Pool List View Refactor - Final Polish)

1.  **Verify Visual Changes**:
    *   Confirm the pool table background is now purple-like and transparent.
    *   Confirm if comet rays are now visible behind the pool table.
    *   Confirm protocol logos are rendering correctly (or if the new fallback is visible).
    *   Confirm column widths are as expected.
    *   Confirm the block circular timer is red.
2.  **Thorough Testing**:
    *   All filter functionalities (Tokens, Protocols, Pool IDs), including multi-select, search, clear, and reset.
    *   Sorting for all designated columns.
    *   Infinite scroll behavior (edge cases, performance with many items).
    *   Row selection, sidebar display/dismissal.
    *   Swap simulation functionality and UI in the sidebar.
    *   Overall responsiveness and visual consistency.
3.  **Address any remaining TS errors or warnings.**

## Current Status Summary (Overall System)

*   Foundational UI, navigation, WebSocket data handling are stable.
*   **Market Graph view is aligned with TC Design.**
*   **Pool List view refactoring is visually aligned with TC Design.** All requested visual discrepancies have been addressed. Focus is now on comprehensive testing and minor refinements.
*   Overall system stability confirmed by user prior to starting List View refactor planning.

## Current Status Summary (Overall System)

*   Foundational UI, navigation, WebSocket data handling are stable.
*   **Market Graph view is aligned with TC Design.**
*   **Pool List view refactoring is nearly complete.** Core structural, functional, and major styling changes implemented. Focus is now on final polish, comprehensive testing, and minor refinements.
*   Overall system stability confirmed by user prior to starting List View refactor planning.

## Evolution of Project Decisions

*   **(Graph View refactoring decisions from May 2025 detailed in previous versions - summarized above)**
*   **Pool List View Refactoring (Finalized & Implemented - May 21, 2025):**
    *   **Scope**: Comprehensive alignment of `ListView.tsx` and related components with Figma designs.
    *   **Key Decisions & Features Implemented**:
        *   Unified main panel with TC Design styling.
        *   New `PoolListFilterBar.tsx` with fully implemented popover-based multi-select filters for Tokens, Protocols, and Pool IDs.
        *   `MetricsCards.tsx` removed; metrics integrated into table summary row.
        *   Table columns redefined; TVL & Depth info removed. Sortability updated.
        *   Rich cell rendering with CoinGecko icons for tokens and protocols.
        *   Infinite scroll replaces pagination.
        *   Row hover/selected state: Whitish background, black text.
        *   New `PoolDetailSidebar.tsx` as an overlay, styled per TC Design, housing a refactored `SwapSimulator.tsx`.
        *   "Liquidity curve" tab in sidebar explicitly excluded.
        *   Shared `TokenIcon` and `ProtocolLogo` components created.
