# Tech Context: Pool Explorer

## Technologies Used

*   **React**: Frontend library for building user interfaces.
*   **TypeScript**: Superset of JavaScript that adds static typing.
*   **Tailwind CSS**: Utility-first CSS framework for rapid UI development.
*   **Radix UI**: Low-level UI component library for building accessible design systems.
*   **Lucide React**: Icon library.
*   **Vite**: Next-generation frontend tooling for fast development.
*   **WebSockets**: For real-time data communication with the Tycho backend.
*   **CoinGecko API**: For fetching token and protocol images.

## Development Setup

*   **Node.js & npm/Yarn/Bun**: Runtime environment and package manager.
*   **Vite Dev Server**: Local development server with hot module replacement.

## Technical Constraints

*   Client-side application only.
*   Reliance on external APIs (CoinGecko) and WebSocket for data.

## Dependencies

*   `react`, `react-dom`
*   `lucide-react`
*   `class-variance-authority`, `clsx` (for `cn` utility)
*   `@radix-ui/react-scroll-area`, `@radix-ui/react-tooltip` (from Radix UI)
*   `tailwindcss`, `postcss`, `autoprefixer`
*   `typescript`

## Tool Usage Patterns

*   **`replace_in_file`**: Preferred for targeted, precise modifications to existing files. It requires exact matching of `SEARCH` blocks.
*   **`write_to_file`**: Used as a fallback for larger, more complex changes or when creating new files, where providing the complete file content is more efficient or necessary.
*   **`read_file`**: Used liberally to understand existing code and file contents.
*   **`search_files`**: Used for broader code exploration and finding patterns across multiple files.
*   **`execute_command`**: Used for running development servers (`npm run dev`) or other CLI operations.
*   **`browser_action`**: Used for visual verification of UI changes and interactions in the browser.
*   **MCP Tools**: Used for interacting with external services like Figma (e.g., `get_figma_data`, `download_figma_images`).
