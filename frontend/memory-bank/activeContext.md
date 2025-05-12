# Active Context: Pool Explorer - Graph View Refactoring Plan

## Current Work Focus

The current primary task is to refactor the **Market Graph View** (`src/components/dexscan/graph/`) to align its visual styling, component organization, and interactive behaviors with the TC Design (Figma mockups, specifically node `7903:5193` for the Graph View and `7895:5185` for global background elements). This involves implementing a detailed, multi-step plan developed through discussion.

## Recent Changes

*   Completed initial Memory Bank setup (`projectbrief.md`, `productContext.md`, `techContext.md`, `systemPatterns.md`, initial `activeContext.md` and `progress.md`).
*   Conducted a detailed analysis of the TC Design for the Graph View by fetching and reviewing Figma data.
*   Compared the TC Design with the current application's Graph View (via screenshot).
*   Collaboratively developed a comprehensive, step-by-step plan to refactor the Graph View. This plan includes:
    *   Downloading specific Figma assets (backgrounds, UI icons).
    *   Implementing an app-wide layered background.
    *   Restyling the Graph View's main content frame.
    *   Overhauling `GraphControls.tsx` layout and components (filters, reset link, animated block number display).
    *   Implementing auto-rendering of the graph on filter changes.
    *   Updating node, edge, and tooltip styling in `GraphView.tsx` to match TC Design, with interim solutions for data availability (text-only nodes, simplified tooltip content).

## Next Steps

1.  **Download Figma Assets**:
    *   Use the `download_figma_images` MCP tool to fetch specified background textures and UI icons.
    *   Target storage path: `src/assets/figma_generated/`.
    *   Asset list includes global backgrounds (noise, comets, god rays), graph frame texture, and UI icons (close 'x', dropdown arrow).
2.  Proceed with the phased implementation of the Graph View refactoring plan (global background, graph frame, controls, graph elements, etc.) as detailed in `progress.md` under "Evolution of Project Decisions."

## Active Decisions and Considerations

*   **App-Wide Background**: The elaborate TC Design background (dark purple base, comets, rays, noise) will be implemented globally (e.g., in `App.tsx`) to affect both List and Graph views.
*   **Graph View Frame**: A distinct, styled frame (semi-transparent fill, specific texture, border, backdrop-blur) will wrap the Graph View's controls and visualization area, appearing "on top" of the global background.
*   **Graph Controls Redesign**: `GraphControls.tsx` will be significantly refactored to a single-row layout. Filter selection will use styled text-based displays (e.g., "Select tokens" or "ETH, USDT...") triggering popovers, instead of the current button+badge system.
*   **Auto-Rendering**: The "Render Graph" button will be removed; the graph will update automatically upon changes to token or protocol filters.
*   **Animated Block Number Display**: The dot next to the block number in controls will be an animated progress indicator (filling with `#FF3366` color) representing the current block's estimated duration. This requires logic in `PoolDataContext.tsx` to track block timestamps and estimate duration.
*   **Node Styling (Interim)**: Nodes will be text-based (token symbol/name) for now, without logos. Selected nodes will have a `2px solid #FF3366` border.
*   **Edge Styling**: Edges will be thin, light-colored, and straight.
*   **Tooltip Content (Interim)**: Tooltip will show Token Symbol, Pool Count, and clickable Address. TVL and Volume data will be omitted until available. Tooltip container will be styled per Figma.
*   **Asset Management**: Downloaded Figma assets will be stored in `src/assets/figma_generated/`.

## Important Patterns and Preferences (from `.clinerules` and project structure)

*   Continue adherence to modularity, clarity, small functions/files, and React best practices.
*   Styling will primarily use Tailwind CSS, with custom CSS/inline styles for specific Figma effects if necessary.

## Learnings and Project Insights

*   Detailed Figma analysis is crucial for accurate UI implementation.
*   Iterative refinement of the plan through discussion leads to a more robust and accurate approach.
*   The block number display is a more complex feature than initially assumed, involving animation and block time estimation.
