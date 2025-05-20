# Active Context: Pool Explorer - Memory Bank Update

## Current Work Focus

**Updating Memory Bank after adding PancakeSwap support to `getExternalLink` utility function.**
*   **Task**: Add PancakeSwap v2 and v3 URLs to the `getExternalLink` function in `src/lib/utils.ts`.
    *   **Status**: Completed.
*   **Current Step**: Updating all relevant Memory Bank files to reflect the addition of PancakeSwap support in `getExternalLink` and to correctly document the current project state.

## Recent Changes

The following changes were implemented to refactor the Graph View and related components:

*   **Global Styling (`App.tsx`):**
    *   Implemented an app-wide, multi-layered background using downloaded Figma assets (dark purple base, comets, rays, noise texture) to ensure visual consistency across all views.
*   **`DexScanContent.tsx`:**
    *   Adjusted horizontal margins for the main content area to `mx-6` (24px) to match Figma panel placement.
    *   Modified the content container height to `calc(100vh - 104px)` for better viewport fit, with child views (`GraphViewContent`, `ListView`) taking `100%` of this calculated height.
*   **`GraphViewContent.tsx`:**
    *   Styled the main Graph View frame with Figma-specified background color (`rgba(255,244,224,0.02)`), background texture (`graph_frame_bg_artboard.png`), **border (`1px solid rgba(255,244,224,0.2)`)**, rounded corners (`12px`), and backdrop-filter (`blur(24px)`).
    *   Implemented auto-rendering logic for the graph, triggering updates on filter changes. The manual "Render Graph" button and related handlers were removed.
    *   Refined edge styling logic to use default subtle colors/widths from `networkOptions` and apply specific styles for "protocol match" or "updated in current block" states.
    *   Removed the "Displaying X tokens and Y connections" text.
*   **`GraphControls.tsx`:**
    *   **Layout:** Converted to a single horizontal row, responsive (stacks on small screens). "Reset filters" text link moved to the left group.
    *   **Filter Displays (Tokens & Protocols):** Replaced old UI with styled clickable boxes showing "Select..." or comma-separated selections. **Dropdown arrows now rotate 180 degrees with a smooth transition when popovers are open.** Token filter has a `LucideX` icon (in styled circular wrapper) to clear selections. Popovers align to the start of the trigger. Trigger buttons have `max-w-xs`.
    *   **Block Number Display:** Implemented with an animated circular progress icon (`BlockProgressIcon.tsx`) using Folly red (`#FF3366`) and the live block number.
    *   **Popover Content:**
        *   Frames styled per Figma (bg, border, radius, shadow, backdrop-filter).
        *   Token search bar styled per Figma, with auto-focus on open and dynamic Folly red border on focus (2px thick).
        *   List items styled (padding, hover bg).
        *   `formatTokenWithAddress` updated to return JSX for differential styling of symbol vs. address summary (address part smaller and lighter). **The address summary is now a clickable Etherscan link, styled with an underline and consistent gray color.**
        *   **Token list in popover now sorts selected tokens to the top, then lexicographically.**
        *   Checkboxes styled with Tailwind classes to approximate Figma's red-filled checked state.
        *   "Done" button/footer removed from popovers; selections apply instantly.
        *   Entire list item rows made clickable for selection.
*   **`PoolDataContext.tsx`:**
    *   Enhanced to track `lastBlockTimestamp` and `estimatedBlockDuration` to support the animated block progress icon.
*   **`useGraphData.ts`:**
    *   Updated to pass through `lastBlockTimestamp` and `estimatedBlockDuration` from the context.
    *   **Implemented `applyParallelEdgeSmoothness` function:** This function processes edges to identify parallel connections (multiple edges between the same two nodes). For such groups, it dynamically assigns `smooth.type` (alternating 'curvedCW' and 'curvedCCW') and incrementally increasing `smooth.roundness` values to create a fanned-out visual effect, ensuring all parallel edges are distinguishable. Single edges receive a default, nearly straight curve. This addresses the issue of parallel edges stacking on top of each other.
    *   **Corrected Edge Coloring Logic**: Modified the logic to ensure that if no protocols are selected in the filter (`selectedProtocols.length === 0`), all edges connecting selected tokens are rendered in a neutral gray (`#848484`). If specific protocols are selected, only edges belonging to those protocols receive their specific colors, while other non-matching edges are gray. Highlighting of edges updated in the current block (by width) is preserved in both scenarios.
    *   **Exposed Raw Pool Data**: Modified to return the raw `pools` object from `PoolDataContext` as `rawPoolsData` to be used for accurate tooltip calculations.
*   **`GraphViewContent.tsx` (Updates for Tooltip Data):**
    *   Now receives `rawPoolsData` from `useGraphData` hook.
    *   Passes `rawPoolsData` as a prop to the `GraphView` component.
*   **`GraphView.tsx`:**
    *   **Nodes:** Default shape changed to "circle" with updated default styling (colors, font size). Selected nodes now correctly display a `2px solid #FF3366` border, managed by updating the node's data in the `DataSet`.
    *   **Edges:** Default styling (color, width, nearly straight lines via `smooth: {type: 'continuous', roundness: 0.05}`) defined in `networkOptions`. Parallel edge curving is now handled dynamically in `useGraphData.ts`.
    *   **`networkOptions` Update**: Explicitly set `physics.stabilization.fit: false` to prevent zoom reset on data updates. Added a comment explaining this.
    *   **Tooltip:**
        *   HTML content styled to match Figma design (bg, border, blur, shadow, text styles).
        *   **Pool Count Calculation**: The `getTokenData` method in `GraphManager` now calculates "Pool Count" by iterating through the `rawPoolsData` (passed from `GraphViewContent`) to count how many pools the token participates in.
        *   **Real-time Pool Count Update**: The pool count in an active tooltip now updates in real-time when new block data arrives. This is achieved by:
            *   Adding an ID to the pool count `<span>` in the tooltip's HTML.
            *   A new `refreshCurrentTooltipData()` method in `GraphManager` updates this `<span>`'s content.
            *   The main component's `useEffect` (reacting to `rawPoolsData` changes) calls `refreshCurrentTooltipData()`.
        *   **Token address URL in tooltip now styled with a gray color (`rgba(255, 244, 224, 0.64)`) to match popover.**
        *   **Node Tooltip now disappears on any click outside the tooltip popup itself or the selected node (including clicks outside the graph area).**
        *   **Node Tooltip Address Copy**: Added a "Copy" button for the token address in the node tooltip.
    *   **Edge Tooltip (New Functionality)**:
        *   Implemented `showEdgeInfoPopover` in `GraphManager` to display pool details (ID, protocol, fee, last update block) on edge click.
        *   Pool ID is formatted using `renderHexId` and linked using `getExternalLink` (or Etherscan).
        *   Added a "Copy" button for the full pool ID in the edge tooltip.
        *   Edge tooltip dismisses on other graph interactions (click, zoom, drag).
*   **New Component (`BlockProgressIcon.tsx`):** Created for the animated block progress display.
*   **WebSocket Connection Popover (`src/components/dexscan/header/HeaderActions.tsx`):**
    *   The main popover card is now styled with blur, transparency, and other visual styles consistent with filter popovers.
*   **Utility Functions (`src/lib/utils.ts`, `src/lib/poolUtils.ts`):**
    *   Renamed `formatPoolId` to `renderHexId` in `utils.ts` for clarity.
    *   Centralized `parsePoolFee` and `parseFeeHexValue` into `poolUtils.ts`.
    *   `getExternalLink` in `utils.ts` updated to support PancakeSwap v2 and v3 protocols.

## Next Steps

1.  Complete Memory Bank update.
2.  Await next task from the user.

## Active Decisions and Considerations (Graph Rendering & Interaction)

*   **Graph Re-rendering on Token Deselection**:
    *   **Observation**: Graph disappears if deselection leads to no displayable tokens/edges.
    *   **Conclusion**: This is expected behavior due to conditional rendering in `GraphViewContent.tsx` (`selectedTokens.length > 0 && graphDisplayNodes.length > 0`) and data filtering in `useGraphData.ts`. No code change required for this aspect.
*   **Zoom Reset on New Block Data**:
    *   **Root Cause**: `vis-network` defaults `physics.stabilization.fit` to `true`. When `network.setData()` is called (due to new block data updating graph props), this default causes the graph to re-fit the viewport.
    *   **Solution**: Explicitly set `physics.stabilization.fit: false` in `networkOptions` within `GraphView.tsx`. This prevents the automatic re-fitting and preserves user zoom/pan.
*   **Edge Stacking (Previously Addressed)**:
    *   **Root Cause**: Default `smooth: { type: 'continuous' }` without differentiation for parallel edges.
    *   **Solution**: Dynamic assignment of `smooth.type` and `smooth.roundness` in `useGraphData.ts` via `applyParallelEdgeSmoothness`.
*   **Edge Coloring When No Protocol is Selected**:
    *   **Observation**: Edges were colored by their specific protocol even if no protocol filter was active.
    *   **Root Cause**: The condition `selectedProtocols.length === 0` in `useGraphData.ts` was incorrectly interpreted as "show all protocols with their colors" instead of "no protocol filter active, so use default gray".
    *   **Solution**: Updated `useGraphData.ts` to explicitly set edge color to a neutral gray (`#848484`) when `selectedProtocols.length === 0`. If protocols *are* selected, matching edges get protocol colors, and non-matching edges get the neutral gray.
*   **Graph Node Tooltip (Token Address)**:
    *   **Pool Count**: Displays the actual number of pools a token participates in, calculated from raw pool data.
    *   **Real-time Update**: Pool count updates in real-time with new block data.
    *   **Copy Functionality**: Token address is copyable.
*   **Graph Edge Tooltip (Pool ID)**:
    *   **Display**: Shows Pool ID (formatted, linked, and copyable), Protocol, Fee, and Last Update Block.
    *   **Dismissal**: Hides on other graph interactions.
*   **`vis-network` Configuration Strategy**:
    *   **Global (`GraphView.tsx`)**:
        *   `layout.hierarchical.enabled: false`.
        *   `physics.enabled: true` with `barnesHut` solver. Tuned parameters: `gravitationalConstant: -25000`, `centralGravity: 0.1`, `springLength: 300`, `avoidOverlap: 0.7`.
        *   **`physics.stabilization.fit: false` added to preserve user zoom.**
        *   Default node/edge styles.
    *   **Dynamic Per-Edge (`useGraphData.ts`)**:
        *   `applyParallelEdgeSmoothness` for fanning parallel edges.
        *   Protocol-based coloring (now correctly handling the "no protocol selected" case) and update-based width logic.

## Important Patterns and Preferences

*   Adherence to `.clinerules` maintained.
*   Iterative refinement based on user feedback is key.
*   Understanding `vis-network` default options is crucial for predictable behavior.

## Learnings and Project Insights

*   **Conditional Rendering Impact**: The interplay between data processing in hooks (`useGraphData`) and conditional rendering logic in components (`GraphViewContent`) directly determines UI visibility.
*   **`vis-network` Defaults**: `vis-network` often has sensible defaults, but for specific behaviors like preserving zoom on data updates, explicit configuration (e.g., `stabilization.fit: false`) is necessary. Relying on defaults without verification can lead to unexpected outcomes.
*   **`DataSet.update()` vs. `DataSet.clear()`/`add()` vs. `network.setData()`**: Understanding how `vis-network` and `vis-data` handle data updates is key. `network.setData()` (or `clear`/`add` on datasets) signals a more significant change that can trigger layout and fit recalculations based on network options.
*   **Tooltip Data Sourcing**: For accurate data like pool participation count, it's more reliable to use the complete raw dataset (`rawPoolsData`) rather than deriving from potentially filtered graph elements (like `edgesDataset` in `GraphManager`).
*   **DOM Manipulation for Live Updates**: For highly dynamic elements within a third-party library's generated DOM (like a `vis-network` tooltip), direct DOM manipulation (e.g., `querySelector` and updating `textContent`) can be an effective way to achieve real-time updates without forcing a full re-render of the library's component.
*   (Previous learnings regarding `smooth.type`/`roundness`, UI alignment, etc., remain relevant).
