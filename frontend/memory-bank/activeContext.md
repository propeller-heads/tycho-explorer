# Active Context: Pool Explorer - Pool List View Refactor Nearing Completion

## Current Work Focus

**Finalizing the refactor of the Pool List View to align with TC Design.**
*   **Previous Task**: Implemented foundational changes for Pool List View, including new components, state management, and initial styling.
*   **Current Step**: Implemented filter popover content in `PoolListFilterBar.tsx` and refined icon components (`TokenIcon.tsx`, `ProtocolLogo.tsx`) for dynamic sizing and image fetching.
*   **Next**: Final styling polish across all components, thorough testing, and addressing any remaining minor issues.

## Recent Changes (Pool List View Refactor - May 21, 2025)

*   **`types.ts`**: `Token` interface defined and exported.
*   **`PoolListFilterBar.tsx` (New & Refined)**:
    *   Initial structure created. Props for `BlockProgressIcon` corrected. Uses imported `Token` type.
    *   **Implemented Popover Content**:
        *   Token Filter: Search input, scrollable list of tokens with checkboxes and icons (using shared `TokenIcon`).
        *   Protocol Filter: Scrollable list of protocols with checkboxes.
        *   Pool ID Filter: Search input, scrollable list of Pool IDs (displayed with `renderHexId`) with checkboxes.
    *   `renderHexId` imported for Pool ID display.
    *   Shared `TokenIcon` component imported and used.
*   **`ListView.tsx` (Refactored)**:
    *   Core refactoring complete (imports, state, `COLUMNS`, infinite scroll, summary data, sidebar integration).
*   **`PoolDetailSidebar.tsx` (New - Styled)**:
    *   Basic file structure created.
    *   Styled with TC Design panel aesthetics (blur, border, shadow using arbitrary Tailwind values).
    *   Header implemented with pool name, protocol/ID, close button.
    *   "Quote simulation" tab styled as active.
    *   Refactored `SwapSimulator.tsx` integrated.
*   **`PoolTable.tsx` (Refactored)**:
    *   Core refactoring complete (props, infinite scroll, header/summary/row styling, cell rendering).
    *   Local `TokenIcon` and `ProtocolLogo` definitions removed.
    *   Imports shared `TokenIcon.tsx` and `ProtocolLogo.tsx`.
*   **`SwapSimulator.tsx` (Refactored)**:
    *   Core refactoring complete (restructured with `SwapCard`, `TokenDisplay`; `Tabs` removed; styled for sidebar).
*   **`common/TokenIcon.tsx` (New Shared Component)**:
    *   Created by extracting logic from `PoolTable.tsx`.
    *   Uses inline styles for dynamic sizing based on `size` prop.
*   **`common/ProtocolLogo.tsx` (New Shared Component)**:
    *   Created by extracting logic from `PoolTable.tsx`.
    *   Uses inline styles for dynamic sizing. Fetches logos from CoinGecko via ID mapping.

## Next Steps (Pool List View Refactor Completion)

1.  **Refine Icon Components (Final Check)**:
    *   Ensure `StackedTokenIcons` in `PoolTable.tsx` has correct CSS for overlap.
    *   Verify robust image fetching and fallbacks in `TokenIcon` and `ProtocolLogo`.
2.  **Styling Adjustments & Polish**:
    *   Fine-tune paddings, margins, fonts, colors, borders, shadows across `ListView`, `PoolListFilterBar`, `PoolTable`, and `PoolDetailSidebar` for precise Figma alignment.
    *   Verify sticky header behavior in `PoolTable.tsx`.
3.  **Thorough Testing**:
    *   All filter functionalities (Tokens, Protocols, Pool IDs), including multi-select, search, and reset.
    *   Sorting for all designated columns.
    *   Infinite scroll behavior (edge cases: no pools, few pools, loading more).
    *   Row selection, sidebar display/dismissal.
    *   Swap simulation in the sidebar.
    *   Overall responsiveness.
4.  **Address any remaining TS errors or warnings.**

## Active Decisions and Considerations (Pool List View Refactor)
*   (This section remains largely the same as the finalized plan, documenting the agreed-upon features and behaviors)
*   **TC Design Alignment**: Primary goal.
*   **No TVL/Depth Information**: Confirmed.
*   **Filter Bar**: Token, Protocol, Pool ID (multi-select popovers). Pool ID tag display: "IDs: 0xab..."
*   **Table**: Columns (Tokens, Pool ID, Protocol, Fee, Spot, Last Update). Sortable (Protocol, Fee, Spot, Last Update). Summary row (Pools, Unique Tokens, Protocols). Icons for Tokens/Protocols (CoinGecko).
*   **Infinite Scroll**: Replaces pagination.
*   **Row Hover/Selected**: Whitish background, black text.
*   **Sidebar**: Overlay, "Quote simulation" tab only (no "Liquidity curve").
*   **Icon/Logo Strategy**: CoinGecko API.

## Active Decisions and Considerations (Graph Rendering & Interaction - Historical)
*   (Remains unchanged)

## Important Patterns and Preferences
*   (Remains unchanged)

## Learnings and Project Insights
*   (Remains unchanged)
