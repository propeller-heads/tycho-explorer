# Progress: Pool Explorer - Pool List View Refactor Nearing Completion

This document outlines the current implementation status and planned work for the Pool Explorer project.

## Pool View

The Pool List View has undergone significant refactoring to align with the TC Design, including the implementation of infinite scroll and comprehensive styling updates.

## Graph View

Mostly works. There're fine tuning needed to be done. Specifically, the edge no longer widens, the background color is off.

## Evolution of Project Decisions

*   **Pool List View Refactoring (Infinite Scroll & TC Design Styling - May 23, 2025):**
    *   **Scope**: Implemented infinite scroll functionality and applied the TC Design system's visual styles across `ListView.tsx`, `PoolTable.tsx`, `TokenIcon.tsx`, `ProtocolLogo.tsx`, and `BlockProgressIcon.tsx`.
    *   **Key Decisions & Features Implemented**:
        *   Replaced traditional pagination with infinite scroll for a smoother user experience.
        *   Modified `src/components/ui/scroll-area.tsx` to expose an `onViewportScroll` prop for scroll detection.
        *   Updated `ListView.tsx` to manage `displayedPoolsCount` and `isLoadingMore` states, and to handle loading more pools on scroll.
        *   Integrated scroll detection and a loading indicator into `PoolTable.tsx`.
        *   Applied comprehensive TC Design color palette (warm cream/beige tones, specific `rgba` values, `#FFF4E0` primary text) and gradient borders throughout the Pool List View components.
        *   Adjusted column widths in `PoolTable.tsx` to match Figma specifications precisely.
        *   Updated styling for `TokenIcon.tsx`, `ProtocolLogo.tsx`, and `BlockProgressIcon.tsx` to align with the new theme.
*   **Pool List View Refactoring (Column Widths - May 23, 2025):**
    *   **Scope**: Implemented dynamic column width sizing in `PoolTable.tsx` to match Figma's "fill" and "hug content" behavior.
    *   **Key Decisions & Features Implemented**:
        *   Changed `Table` component to use `table-auto`.
        *   Introduced `getColumnWidthClass` helper function to apply specific Tailwind width classes (`min-w-[...]`, `w-1/3`, `w-[...]`) to `TableHead` elements based on column ID.
        *   This ensures the "Tokens" column expands to fill available space, while other columns are sized more appropriately to their content, aligning with the Figma design's visual intent.
