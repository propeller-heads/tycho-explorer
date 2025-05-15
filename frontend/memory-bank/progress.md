# Progress: Pool Explorer - Graph View Refactoring Largely Complete

This document outlines the current implementation status and planned work for the Pool Explorer project.

## What Works (Implemented Features based on `src/components/dexscan/`)

### Core UI & Navigation:
*   **Main Layout (`DexScanContent.tsx`)**:
    *   Primary content area, tab-based navigation, URL synchronization.
    *   **Content area height adjusted** for better viewport fit (`calc(100vh - 104px)`).
    *   **Horizontal margins adjusted** to `mx-6` (24px).
*   **Global Background (`App.tsx`)**:
    *   **Implemented TC Design's multi-layered background** (dark purple base, comets, rays, noise texture) app-wide.
*   **Header (`DexScanHeader.tsx`, etc.)**:
    *   Standard structure in place.
*   **WebSocket Connection (`WebSocketConfig.tsx`, `PoolDataContext.tsx`)**:
    *   Functional.
    *   **Enhanced `PoolDataContext.tsx`** to track `lastBlockTimestamp` and `estimatedBlockDuration` for the animated block timer.

### Pool List View (`ListView.tsx`):
*   Largely functional as per initial assessment. (No new changes in this phase).

### Graph View (`graph/` components):
*   **TC Design Alignment Substantially Completed:**
    *   **Graph View Main Frame (`GraphViewContent.tsx`):** Styled with Figma-specified background color, texture, **border (`rgba(255,244,224,0.2)`)**, rounded corners, and backdrop-filter.
    *   **`GraphControls.tsx` Overhaul:**
        *   Layout: Single-row, responsive (stacks on small screens).
        *   Filter Displays: Styled clickable boxes for token/protocol selection (text-based, "Select..." placeholders, comma-separated lists, icons, `max-w-xs`, popovers align start). **Dropdown arrows now rotate 180 degrees with transition.** Token clear 'x' icon styled.
        *   "Render Graph" Button: Removed.
        *   "Reset filters" Link: Styled text link, moved to left filter group.
        *   Animated Block Number Display: Implemented with `BlockProgressIcon.tsx` (Folly red progress) and live block number.
    *   **Filter Popover Content (`GraphControls.tsx`):**
        *   Popover Frame: Styled per TC Design (bg, border, radius, shadow, backdrop-filter).
        *   Token Search Bar: Styled per TC Design, auto-focuses, dynamic Folly red border (2px) on focus.
        *   List Items: Styled rows (padding, hover bg). Token text shows symbol + smaller, lighter address summary. Entire rows are clickable.
        *   **Token Address Summary:** Now a clickable Etherscan link, styled with underline and gray color (`rgba(255, 244, 224, 0.64)`).
        *   **Token List Sorting:** Selected tokens appear first, then all tokens are sorted lexicographically.
        *   Checkboxes: Styled with Tailwind to approximate Figma's red-filled checked state.
        *   "Done" Button/Footer: Removed.
    *   **Graph Auto-Rendering (`GraphViewContent.tsx`):** Implemented; graph updates on filter changes. "Displaying X tokens..." text removed.
    *   **Node Styling (`GraphView.tsx`):**
        *   Shape: "circle", default size 25.
        *   Default Style: Dark background, light cream border/text. Text-only (no logos).
        *   Selected Style: `2px solid #FF3366` border correctly applied.
    *   **Edge Styling (`GraphView.tsx`, `GraphViewContent.tsx`):**
        *   Default: Thin (`1px`), subtle light color (`rgba(255,244,224,0.07)`), straight lines.
        *   Conditional Styling: updated in current block" (orange, 2px).
    *   **Tooltip Styling & Content (`GraphView.tsx`):**
        *   Container: Styled per Figma (bg, border, blur, shadow).
        *   Interim Content: Symbol, Pool Count, clickable Address.
        *   **Token Address URL:** Styled with gray color (`rgba(255, 244, 224, 0.64)`) to match popover.
        *   **Tooltip Dismissal:** Tooltip now hides on any click outside the tooltip popup itself or volunteelected node.

### Header Components (`src/components/dexscan/header/`):
*   **`HeaderActions.tsx`**:
    *   WebSocket Connection popover card styled with blur, transparency, and other styles to match filter popovers.

### Data Types (`types.ts`):
*   `WebSocketPool` and `Pool` interfaces defined.

## What's Left to Build / Verify

* Edge coloring by protocol
* Multiple edges between tokens, one per protocol
* The graph layout should be less rigid, now there is a hub and spoke style by default
* When a pool updates, flashing the pool edge, making it fat until the next block update comes in.
* Verify if the "Websocket config UI should match that of TC styling" is fully complete now that the popover card and select dropdown are styled.

## Current Status Summary

*   Foundational UI, navigation, and WebSocket data handling are in place.
*   Pool List view is largely functional.
*   **Market Graph view has undergone a major refactoring effort and now substantially aligns with the TC Design's visual and interactive specifications for core elements.** This includes global background, graph panel framing (border updated), controls layout and styling (rotating popover arrows), filter popover design (sorting, Etherscan links), node/edge appearances, and tooltip (Etherscan link styling, dismissal behavior).
*   **Graph rendering and interaction issues (token deselection, zoom reset) have been investigated and resolved.**
    *   The graph correctly re-renders upon token deselection; its disappearance is expected if no valid graph remains.
    *   User zoom level is now preserved on new block data updates by setting `physics.stabilization.fit: false` in `GraphView.tsx`.
*   **Header components (WebSocket popover) have been styled for consistency with the TC Design's blur/transparency aesthetic.** (Note: Shared `Select` component changes were reverted by user).
*   **The previous focus on diagnosing edge stacking has been completed.** This involved tuning global `networkOptions` in `GraphView.tsx` and implementing dynamic edge styling in `useGraphData.ts`. Current focus is on ongoing layout tuning by the user.

## Evolution of Project Decisions

*   **(Previous decisions regarding initial setup omitted for brevity)**
*   **Graph View Refactoring (May 2025 - Current Phase):**
    *   **Overall Goal:** Align current Graph View with TC Design (Figma) and refine UX based on feedback.
    *   **Completed Sub-tasks:**
        1.  Downloaded Figma assets (backgrounds, UI icons).
        2.  Implemented app-wide multi-layered background.
        3.  Styled Graph View main frame (bg, texture, border, blur, margins, height).
        4.  Refactored `GraphControls.tsx`: single-row responsive layout, new styled filter display buttons (text-based, icons, rotating arrow, popover triggers), "Reset filters" text link, removed "Render Graph" button.
        5.  Implemented animated block number display with `BlockProgressIcon.tsx`.
        6.  Enabled graph auto-rendering on filter changes.
        7.  Updated node styling (circle shape, text-only, default/selected styles including Folly red border).
        8.  Updated edge styling (thin, light default, conditional highlights, straight lines).
        9.  Updated tooltip (styled container, interim content).
        10. Styled filter popover contents: frame, token search bar (styled, auto-focus, dynamic focus border), list items (padding, hover, styled address summary), approximated checkbox styles, removed "Done" buttons.
        11. Addressed various UX fixes: popover item clickability, selected node border color.
        12. **Updated token selection popover in `GraphControls.tsx`:**
            *   Sorted token list: selected first, then lexicographically.
            *   Made token address summary a clickable, underlined, gray Etherscan link.
        13. **Updated graph tooltip in `GraphView.tsx`:**
            *   Styled token address Etherscan link to be gray.
            *   Implemented tooltip dismissal on any click outside the tooltip popup or its selected node.
        14. **Updated `GraphControls.tsx` popover arrows to rotate with transition.**
        15. **Updated WebSocket Connection popover in `HeaderActions.tsx` to use blur/transparency styling.**
        16. **Updated `GraphViewContent.tsx` border to be `rgba(255,244,224,0.2)`.**
    *   **Key Decisions during refactor (UI Alignment Phase):** Used Folly red for block timer dot; selected node border is Folly red; node content is text-only for now; tooltip content is interim; popover selections apply instantly (no "Done" button); address summary in token lists styled differently and links to Etherscan; tooltip dismissal is now more comprehensive; popover styling (blur, transparency, rotating arrows) applied to GraphControls and WebSocket popover. Shared Select component styling changes were reverted.
    *   **Graph Layout Refinement (Current - May 15, 2025 onwards):**
        *   **Problem Identified**: Parallel edges in the graph stack on top of each other instead of fanning out as per Figma design.
        *   **Root Cause**: Default `smooth: { type: 'continuous' }` applied to all edges in `useGraphData.ts` without differentiation for parallel edges.
        *   **Goal**: Achieve an organic, force-directed layout with fanned-out parallel edges.
        *   **Strategy**:
            1.  Update global `networkOptions` in `GraphView.tsx`:
                *   Set `layout.hierarchical.enabled: false`.
                *   Enable and tune `physics.barnesHut` solver (e.g., `gravitationalConstant`, `springLength`, `avoidOverlap`).
                *   (Initial options applied: `gravitationalConstant: -15000`, `springLength: 150`, `avoidOverlap: 0.2`).
            2.  **Modified `useGraphData.ts` (Completed May 15, 2025):**
                *   Implemented `applyParallelEdgeSmoothness` helper function.
                *   This function groups edges by the pair of nodes they connect.
                *   For parallel edges, it dynamically assigns `smooth: { type: 'curvedCW'/'curvedCCW', roundness: ... }` with incrementally increasing `roundness` values to create a fanned-out effect, ensuring all parallel edges are distinguishable.
                *   Single edges between a pair receive a default, nearly straight curve.
        *   **Status**: Edge fanning logic implemented.
    *   **Graph Rendering and Interaction Refinements (May 15, 2025):**
        *   **Problem 1**: Graph not re-rendering as expected on token deselection.
            *   **Analysis**: Determined this was expected behavior. The graph disappears if conditional rendering logic in `GraphViewContent.tsx` determines no valid graph to show (no selected tokens or no resulting nodes).
            *   **Outcome**: No code change needed; behavior clarified.
        *   **Problem 2**: User's zoom level reset on new block data.
            *   **Root Cause**: `vis-network` defaults `physics.stabilization.fit` to `true`, causing a re-fit on `network.setData()` calls triggered by new block data.
            *   **Solution**: Explicitly added `physics.stabilization: { fit: false }` to `networkOptions` in `GraphView.tsx` to preserve user zoom. A comment was added explaining this.
        *   **Status**: Zoom preservation implemented. User to continue exploring and tuning `networkOptions` in `GraphView.tsx` (physics) and fanning parameters in `useGraphData.ts` for optimal visual results.
