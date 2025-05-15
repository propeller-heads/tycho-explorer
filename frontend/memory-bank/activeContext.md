# Active Context: Pool Explorer - Graph View Refactoring Review

## Current Work Focus

**Diagnosing and resolving graph layout issues in the Pool Explorer's Graph View.**
*   **Primary Issue**: Multiple edges between the same two token nodes are stacking on top of each other, appearing as a single edge, instead of fanning out as depicted in the Figma design.
*   **Goal**: Achieve an organic, force-directed layout where parallel edges are visually distinct and gently curved, closely matching the Figma reference (`node-id=7903-5193`).
*   **Current Step**: Refining global `networkOptions` in `GraphView.tsx` (physics, layout defaults) and planning modifications to `useGraphData.ts` to implement dynamic `smooth.type` and `smooth.roundness` for parallel edges.

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
*   **`GraphView.tsx`:**
    *   **Nodes:** Default shape changed to "circle" with updated default styling (colors, font size). Selected nodes now correctly display a `2px solid #FF3366` border, managed by updating the node's data in the `DataSet`.
    *   **Edges:** Default styling (color, width, straight lines) defined in `networkOptions`.
    *   **Tooltip:**
        *   HTML content styled to match Figma design (bg, border, blur, shadow, text styles). Content is interim (Symbol, Pool Count, Address).
        *   **Token address URL in tooltip now styled with a gray color (`rgba(255, 244, 224, 0.64)`) to match popover.**
        *   **Tooltip now disappears on any click outside the tooltip popup itself or the selected node (including clicks outside the graph area).**
*   **New Component (`BlockProgressIcon.tsx`):** Created for the animated block progress display.
*   **WebSocket Connection Popover (`src/components/dexscan/header/HeaderActions.tsx`):**
    *   The main popover card is now styled with blur, transparency, and other visual styles consistent with filter popovers.

## Next Steps

1.  **User Exploration**: User to experiment with the updated global `networkOptions` in `GraphView.tsx` to achieve a satisfactory base node layout.
2.  **Implement Edge Fanning Logic**: Modify `useGraphData.ts` to:
    *   Group pools by the pair of tokens they connect.
    *   For parallel edges, dynamically assign `smooth: { type: 'curvedCW'/'curvedCCW', roundness: ... }` to create a fanned-out effect.
3.  **Iterative Tuning**: Collaboratively tune `roundness` values and physics parameters to match the Figma design aesthetic.
4.  Verify that edge coloring by protocol and width changes for updated pools remain correct with the new layout logic.

## Active Decisions and Considerations (Graph Layout Focus)

*   **Root Cause of Edge Stacking**: Confirmed to be the default `smooth: { type: 'continuous' }` applied to all edges in `useGraphData.ts` without differentiation for parallel edges.
*   **Target Layout (Figma `node-id=7903-5193`)**: Organic, force-directed node placement with clearly fanned-out, gently curved parallel edges.
*   **`vis-network` Configuration Strategy**:
    *   **Global (`GraphView.tsx`)**:
        *   `layout.hierarchical.enabled: false`.
        *   `physics.enabled: true` with `barnesHut` solver. Key parameters to tune: `gravitationalConstant`, `centralGravity`, `springLength`, `avoidOverlap`.
        *   Default node and edge styles (shape, base colors, base width, no arrows).
    *   **Dynamic Per-Edge (`useGraphData.ts`)**:
        *   Logic to identify parallel edges.
        *   Assign alternating `smooth.type: 'curvedCW'/'curvedCCW'` to parallel edges.
        *   Assign varying `smooth.roundness` to parallel edges to control the fanning spread.
        *   Continue applying protocol-based color and update-based width.
*   **Initial `networkOptions` in `GraphView.tsx`**: Updated with settings to promote an organic layout (e.g., `gravitationalConstant: -15000`, `springLength: 150`, `avoidOverlap: 0.2`, `hierarchical.enabled: false`).

## Important Patterns and Preferences

*   Adherence to `.clinerules` maintained.
*   Iterative refinement based on user feedback is key, especially for visual tuning of the graph.

## Learnings and Project Insights

*   Understanding `vis-network`'s `smooth.type` and `smooth.roundness` properties is critical for controlling the appearance of parallel edges.
*   Achieving a specific aesthetic (like the Figma design) often requires a combination of global physics/layout settings and dynamic per-element styling.
*   The default behavior of `smooth: { type: 'continuous' }` for multiple edges between the same nodes leads to visual stacking if not further differentiated.
*   (Previous learnings regarding UI component translation and feedback cycles remain relevant).
