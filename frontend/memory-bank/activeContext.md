# Active Context: Pool Explorer - Memory Bank Initialization

## Current Work Focus

The current task is to initialize the Memory Bank for the Pool Explorer project. This involves creating and populating the six core documentation files:

1.  `projectbrief.md` (Completed)
2.  `productContext.md` (Completed)
3.  `techContext.md` (Completed)
4.  `systemPatterns.md` (Completed)
5.  `activeContext.md` (This file - In Progress)
6.  `progress.md` (Next to be created)

The information for these files is being sourced from:
*   `docs/specification.md`
*   `package.json`
*   `vite.config.ts`
*   The file structure and content of `src/components/dexscan/`
*   `.clinerules`

## Recent Changes

*   Created `memory-bank/projectbrief.md`.
*   Created `memory-bank/productContext.md`.
*   Created `memory-bank/techContext.md`.
*   Created `memory-bank/systemPatterns.md`.

## Next Steps

1.  Complete the content for this file (`activeContext.md`).
2.  Create and populate `memory-bank/progress.md` to reflect the initial understanding of the project's implementation status based on the provided files.
3.  Confirm completion of the Memory Bank initialization.

## Active Decisions and Considerations

*   **Information Granularity**: Striving to capture essential details in each Memory Bank file without excessive verbosity. The goal is to provide a comprehensive yet digestible overview for future sessions.
*   **Source of Truth**: Relying on the provided project files (`specification.md`, `package.json`, source code) as the primary sources of information.
*   **Interpretation**: Some aspects, like the exact functionality of uninspected sub-components (e.g., within `src/components/dexscan/graph/`), are inferred based on naming conventions and context. Deeper dives into these areas will occur as specific tasks require them.

## Important Patterns and Preferences (from `.clinerules` and project structure)

*   **Modularity**: The project structure (e.g., `dexscan` components, `ui` components) and `.clinerules` emphasize modular design.
*   **Clarity and Comments**: `.clinerules` requires comments above concepts.
*   **Small Functions/Files**: A preference for concise code units.
*   **Data-Driven UI**: The application heavily relies on data fetched via WebSockets to drive its views.
*   **React Best Practices**: Usage of Context API, hooks, and component composition aligns with modern React development.
*   **Shadcn/ui and Tailwind CSS**: These form the core of the UI's look and feel, and component construction.

## Learnings and Project Insights (Initial)

*   The project is a sophisticated data visualization tool for DeFi liquidity.
*   Real-time data handling via WebSockets is a critical aspect.
*   Two primary views (List and Graph) are central to the user experience.
*   The existing codebase in `src/components/dexscan/` provides a solid foundation for these core features.
*   The `PoolDataContext` is a key architectural piece for managing shared state and data.
*   The `.clinerules` provide strong guidance on coding style and design principles.
