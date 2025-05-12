# Progress: Pool Explorer - Graph View Refactoring Planned

This document outlines the current implementation status and planned work for the Pool Explorer project.

## What Works (Implemented Features based on `src/components/dexscan/`)

### Core UI & Navigation:
*   **Main Layout (`DexScanContent.tsx`)**:
    *   Primary content area, tab-based navigation (Pool List/Market Graph), URL synchronization.
*   **Header (`DexScanHeader.tsx`, etc.)**:
    *   Structure for branding, view selection, actions. `ViewSelector.tsx` handles view switching.
*   **WebSocket Connection (`WebSocketConfig.tsx`, `PoolDataContext.tsx`)**:
    *   UI for WS URL/chain config. Context for WS state management (URL, status, chain, block number, pool data). Connection status display.

### Pool List View (`ListView.tsx`):
*   **Display**: Pool table, overall metrics, pagination.
*   **Data Columns**: Pool Address, Tokens, Protocol, Fee Rate, Spot Price, Dates, Last Block.
*   **Interactivity**: Sorting, filtering (token, protocol, pool ID), pool selection for details.
*   **Pool Detail Card**: Info, `SwapSimulator.tsx`.
*   **Fee Parsing & External Links**: Implemented.

### Swap Simulator (`SwapSimulator.tsx`, etc.):
*   UI for swap input. Placeholder for results. (Full backend simulation TBD).

### Graph View (`graph/GraphViewContent.tsx`, etc.):
*   Basic container and rendering logic (`GraphView.tsx`, `useGraphData.ts`) exist.
*   **Current state does not match TC Design.** A detailed refactoring plan is in place (see "Evolution of Project Decisions").

### Data Types (`types.ts`):
*   `WebSocketPool` and `Pool` interfaces defined.

## What's Left to Build / Verify (Focus: Graph View Refactor)

### Graph View - TC Design Alignment (High Priority - Current Focus):
*   **App-Wide Background Implementation**:
    *   Apply TC Design's multi-layered background (dark purple base, comets, rays, noise) globally (e.g., in `App.tsx`).
*   **Graph View Main Frame Styling**:
    *   Implement the distinct styled frame (semi-transparent fill, specific texture, border, backdrop-blur) for `GraphViewContent.tsx`.
*   **`GraphControls.tsx` Overhaul**:
    *   Redesign to a single-row layout.
    *   Implement new styled text-based filter displays (for tokens/protocols) with placeholder text and comma-separated selections, triggering popovers.
    *   Replace "Reset" button with a "Reset filters" text link.
    *   Remove "Render Graph" button (implement auto-rendering).
    *   Add animated block number display (circular progress icon filling with `#FF3366`, live block number text). This requires enhancing `PoolDataContext.tsx` to track block timestamps and estimate duration.
*   **Graph Auto-Rendering**:
    *   Implement logic for graph to update automatically on filter changes.
*   **`GraphView.tsx` Node Styling**:
    *   Default: Styled boxes with centered token name/symbol text (no logos for now).
    *   Selected: Apply `2px solid #FF3366` border.
*   **`GraphView.tsx` Edge Styling**:
    *   Style to be thin, light-colored, and straight lines.
*   **`GraphView.tsx` Tooltip Styling & Content**:
    *   Style container per Figma (semi-transparent, blurred, bordered).
    *   Interim Content: Token Symbol, Pool Count, clickable Address. (TVL/Volume omitted for now).

### Other Pending Items (from initial assessment, lower priority than current Graph View refactor):
*   **Pool List View - TVL Column**: Verify data source and implement display.
*   **Graph View - Advanced Features (Post-Refactor)**:
    *   Node click details (full TVL, top pools - depends on data).
    *   Scale nodes by TVL.
    *   Simulate on pool (in graph).
    *   Edge coloring by protocol (confirm final design for this).
    *   Highlighting edges updated in the last block.
*   **Metrics - TVL**: Verify data and implement for overall/filter view TVL.
*   **Nice-to-Have Requirements**: Trading curve simulation, path finder, event timeline, visual solving, swap execution, % depth, advanced two-token filter.

## Current Status Summary

*   Foundational UI, navigation, and WebSocket data handling are in place.
*   Pool List view is largely functional.
*   **Market Graph view is the current focus for a major refactoring effort to align with TC Design.** A detailed plan for this is established.
*   Many advanced features from the specification remain pending.

## Evolution of Project Decisions

*   **(Previous decisions regarding initial setup omitted for brevity)**
*   **Graph View Refactoring Plan (May 2025):**
    *   **Overall Goal:** Align current Graph View with TC Design (Figma).
    *   **Key Changes & Implementation Steps:**
        1.  **Asset Download:** Fetch specified Figma assets (global backgrounds like comets/rays/noise; graph frame texture; UI icons for filters) via MCP tool. Store in `src/assets/figma_generated/`.
        2.  **Global Background:** Implement multi-layered app-wide background (dark purple base, decorative SVGs, noise texture) in `App.tsx` or root layout.
        3.  **Graph View Frame:** Style the main container in `GraphViewContent.tsx` with its unique semi-transparent fill, texture, border, and backdrop-blur.
        4.  **`GraphControls.tsx` Refactor:**
            *   Convert to single-row layout.
            *   Replace filter buttons/badges with styled text boxes (showing "Select tokens/protocols" or comma-separated list) that trigger selection popovers. Use downloaded icons.
            *   Change "Reset" button to "Reset filters" text link.
            *   Remove "Render Graph" button.
            *   Implement animated block number display: circular icon showing fill progress (`#FF3366`) based on estimated block time (requires `PoolDataContext` update for timestamps/duration estimation), plus block number text.
        5.  **Auto-Rendering:** Graph updates automatically on filter changes.
        6.  **Node Styling (`GraphView.tsx`):** Text-only nodes (symbol/name) for now. Default: dark box, light border/text. Selected: `2px solid #FF3366` border.
        7.  **Edge Styling (`GraphView.tsx`):** Thin, light-colored, straight lines.
        8.  **Tooltip Styling & Content (`GraphView.tsx`):** Styled container per Figma. Interim content: Symbol, Pool Count, Address. (TVL/Volume deferred).
    *   This plan was developed through iterative discussion, clarifying details like the animated block timer, selected node styling, interim content for nodes/tooltips, and the scope of background elements.
