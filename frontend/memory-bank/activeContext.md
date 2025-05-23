# Active Context: Pool Explorer - Pool List View Refactor Nearing Completion

## Current Work Focus

**Finalizing the refactor of the Pool List View to align with TC Design.**
*   **Previous Task**: Implemented foundational changes for Pool List View, including new components, state management, and initial styling.
*   **Current Step**: Completed all requested visual alignment tasks for Pool List View.
*   **Next**: Thorough testing and addressing any remaining minor issues.

## Recent Changes (Pool List View Refactor - May 21-22, 2025)

*   **`types.ts`**: `Token` interface defined and exported.
*   **`PoolListFilterBar.tsx` (New & Refined)**:
    *   Initial structure created. Props for `BlockProgressIcon` corrected. Uses imported `Token` type.
    *   **Implemented Popover Content**:
        *   Token Filter: Search input, scrollable list of tokens with checkboxes and icons (using shared `TokenIcon`).
        *   Protocol Filter: Scrollable list of protocols with checkboxes.
        *   Pool ID Filter: Search input, scrollable list of Pool IDs (displayed with `renderHexId`) with checkboxes.
    *   `renderHexId` imported for Pool ID display.
    *   Shared `TokenIcon` component imported and used.
    *   **Block Circular Timer Color**: Changed `color` prop for `BlockProgressIcon` to `#FF3366` (red).
*   **`ListView.tsx` (Refactored)**:
    *   Core refactoring complete (imports, state, `COLUMNS`, infinite scroll, summary data, sidebar integration).
    *   **Background Styling**: Main panel container `div` updated to `bg-[rgba(255,244,224,0.02)]` and `border-[rgba(255,244,224,0.3)]` for improved transparency and Figma alignment.
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
    *   **Column Widths**: Adjusted `TableHead` widths for 'tokens', 'id', 'protocol_system', 'static_attributes.fee', 'spotPrice', and 'updatedAt' to match Figma specifications.
*   **`SwapSimulator.tsx` (Refactored)**:
    *   Core refactoring complete (restructured with `SwapCard`, `TokenDisplay`; `Tabs` removed; styled for sidebar).
*   **`common/TokenIcon.tsx` (New Shared Component)**:
    *   Created by extracting logic from `PoolTable.tsx`.
    *   Uses inline styles for dynamic sizing based on `size` prop.
*   **`common/ProtocolLogo.tsx` (New Shared Component)**:
    *   Created by extracting logic from `PoolTable.tsx`.
    *   Uses inline styles for dynamic sizing. Fetches logos from CoinGecko via ID mapping.
    *   **Fallback Styling**: Changed fallback background color to `bg-white/5 border border-white/10` for a more neutral, transparent appearance.

### Completed Visual Alignment Tasks (May 22, 2025)

*   **Pool Table Background**: `ListView.tsx` main panel now uses `bg-[rgba(255,244,224,0.02)]` and `border-[rgba(255,244,224,0.3)]`. This should resolve the "creamy and brown" background and allow the global purple background/comet rays to show through.
*   **Protocol Logos**: `ProtocolLogo.tsx` fallback styling updated to be more subtle (`bg-white/5 border border-white/10`). The underlying logic for fetching logos remains the same, but the visual fallback is improved. Further debugging (e.g., uncommenting `console.warn` in `ProtocolLogo.tsx`) would be needed if logos still don't render.
*   **Column Widths**: `PoolTable.tsx` column widths adjusted to match Figma specifications (e.g., Tokens `w-[260px]`, Pool ID `w-[150px]`, Protocol `w-[180px]`, Fee rate `w-[100px]`, Spot Price `w-[120px]`, Last update `w-[180px]`).
*   **Block Circular Timer Color**: `PoolListFilterBar.tsx` now passes `color="#FF3366"` to `BlockProgressIcon`, ensuring the timer is red.

## Next Steps (Pool List View Refactor Completion)

1.  **Verify Visual Changes**:
    *   Confirm the pool table background is now purple-like and transparent.
    *   Confirm if comet rays are now visible behind the pool table.
    *   Confirm protocol logos are rendering correctly (or if the new fallback is visible).
    *   Confirm column widths are as expected.
    *   Confirm the block circular timer is red.
2.  **Thorough Testing**:
    *   All filter functionalities (Tokens, Protocols, Pool IDs), including multi-select, search, clear, and reset.
    *   Sorting for all designated columns.
    *   Infinite scroll behavior (edge cases: no pools, few pools, loading more).
    *   Row selection, sidebar display/dismissal.
    *   Swap simulation in the sidebar.
    *   Overall responsiveness.
3.  **Address any remaining TS errors or warnings.**

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
