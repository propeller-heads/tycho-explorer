# Progress: Pool Explorer - Pool List View Refactor Nearing Completion

This document outlines the current implementation status and planned work for the Pool Explorer project.

## Pool View

Currently we're working closing the gaps between the TC Design and the app.

## Graph View

Mostly works. There're fine tuning needed to be done. Specifically, the edge no longer widens, the background color is off.

## Evolution of Project Decisions

*   **Pool List View Refactoring (Column Widths - May 23, 2025):**
    *   **Scope**: Implemented dynamic column width sizing in `PoolTable.tsx` to match Figma's "fill" and "hug content" behavior.
    *   **Key Decisions & Features Implemented**:
        *   Changed `Table` component to use `table-auto`.
        *   Introduced `getColumnWidthClass` helper function to apply specific Tailwind width classes (`min-w-[...]`, `w-1/3`, `w-[...]`) to `TableHead` elements based on column ID.
        *   This ensures the "Tokens" column expands to fill available space, while other columns are sized more appropriately to their content, aligning with the Figma design's visual intent.
