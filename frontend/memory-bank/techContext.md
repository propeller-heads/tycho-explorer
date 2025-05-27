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
*   Reliance on external APIs and WebSocket for data.
*   **CoinGecko API Rate Limits:** The free tier of the CoinGecko API imposes very strict rate limits (experimentally observed and later confirmed to be around 5-15 calls per minute). This necessitates careful management of API calls, including queueing, delays, and retry mechanisms, significantly impacting the perceived speed of features like logo loading.
*   **Strict Null Caching Policy:** Per user directive, `null` responses from API errors or explicit "no data" (e.g., no image for a coin) from CoinGecko are not cached. This can lead to repeated fetches for "known not found" items but ensures data freshness if an error was transient or data becomes available later.

## Dependencies

*   `react`, `react-dom`
*   `lucide-react`
*   `class-variance-authority`, `clsx` (for `cn` utility)
*   `@radix-ui/react-scroll-area`, `@radix-ui/react-tooltip` (from Radix UI)
*   `tailwindcss`, `postcss`, `autoprefixer`
*   `typescript`

## Tool Usage Patterns

*   **`replace_in_file`**: Preferred for targeted, precise modifications to existing files. It requires exact matching of `SEARCH` blocks.
*   **`write_to_file`**: Used as a fallback for larger, more complex changes or when creating new files, where providing the complete file content is more efficient or necessary. Also used when `replace_in_file` fails repeatedly.
*   **`read_file`**: Used liberally to understand existing code and file contents.
*   **`search_files`**: Used for broader code exploration and finding patterns across multiple files.
*   **`execute_command`**: Used for running development servers (`npm run dev`) or other CLI operations.
*   **`browser_action`**: Used for visual verification of UI changes and interactions in the browser, and for analyzing console/network logs during debugging.
*   **MCP Tools**: Used for interacting with external services like Figma (e.g., `get_figma_data`, `download_figma_images`).

## Mobile Development Patterns

*   **`use-mobile.tsx` hook**: Central hook for mobile device detection, used across components
*   **Touch Event Handling**: Direct event listeners on canvas elements for immediate response
*   **Responsive Utilities**: Tailwind's responsive prefixes (sm:, md:, lg:) for adaptive layouts
*   **Mobile Physics**: vis-network configurations optimized for mobile viewing
*   **Touch Targets**: Minimum 44px height for all interactive elements on mobile

## Testing Considerations

*   **Mobile Testing**: Test on various mobile devices and screen sizes
*   **Touch Interactions**: Verify all touch gestures work smoothly
*   **TypeScript**: Use `npx tsc --noEmit` for type checking
*   **Performance**: Monitor graph performance on lower-end mobile devices
