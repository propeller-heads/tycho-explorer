# Tech Context: Tycho Explorer

## Technologies Used

### Frontend
*   **React**: Frontend library for building user interfaces.
*   **TypeScript**: Superset of JavaScript that adds static typing.
*   **Tailwind CSS**: Utility-first CSS framework for rapid UI development.
*   **Radix UI**: Low-level UI component library for building accessible design systems.
*   **Lucide React**: Icon library.
*   **Vite**: Next-generation frontend tooling for fast development.
*   **Bun**: Fast JavaScript runtime and package manager.
*   **vis-network**: Graph visualization library.
*   **WebSockets**: For real-time data communication with the API backend.
*   **CoinGecko API**: For fetching token and protocol images.

### Backend
*   **Rust**: Systems programming language for the API service.
*   **Tycho SDK**: For connecting to Tycho protocol data streams.
*   **Axum**: Web framework for the HTTP/WebSocket server.
*   **Tokio**: Async runtime for Rust.

### Infrastructure
*   **Docker**: Container platform for consistent deployments.
*   **Docker Compose**: Multi-container orchestration.
*   **Make**: Build automation for simple commands.

## Development Setup

### Monorepo Structure
```
tycho-explorer/
├── api/                  # Rust backend
├── frontend/            # React frontend
├── docker-compose.yml   # Production config
├── docker-compose.dev.yml # Dev config with hot reload
├── Makefile            # Simple commands
└── .env                # Configuration
```

### Quick Start
```bash
# Development with hot reload
make dev

# Production
make prod

# View logs
make logs
```

### Development Features
*   **Frontend Hot Reload**: Vite dev server with HMR on port 5173
*   **Backend Hot Reload**: cargo-watch rebuilds Rust on file changes
*   **Volume Mounts**: Source code mounted for live updates
*   **Separate Dev Ports**: API on 4001-4003, frontend on 5173

## Technical Constraints

*   Frontend is client-side only, backend provides WebSocket API.
*   Reliance on external APIs (Tycho protocol, CoinGecko) for data.
*   **CoinGecko API Rate Limits:** The free tier of the CoinGecko API imposes very strict rate limits (experimentally observed and later confirmed to be around 5-15 calls per minute). This necessitates careful management of API calls, including queueing, delays, and retry mechanisms, significantly impacting the perceived speed of features like logo loading.
*   **Strict Null Caching Policy:** Per user directive, `null` responses from API errors or explicit "no data" (e.g., no image for a coin) from CoinGecko are not cached. This can lead to repeated fetches for "known not found" items but ensures data freshness if an error was transient or data becomes available later.

## Dependencies

### Frontend
*   `react`, `react-dom`
*   `lucide-react`
*   `class-variance-authority`, `clsx` (for `cn` utility)
*   `@radix-ui/*` components
*   `tailwindcss`, `postcss`, `autoprefixer`
*   `typescript`
*   `vis-network`, `vis-data`
*   `vite` and related plugins

### Backend
*   `tycho-simulation` and related crates
*   `axum` for web server
*   `tokio` for async runtime
*   `serde` for serialization
*   `clap` for CLI parsing

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
*   **🚨 CRITICAL - Graph View Testing**: 
    *   ALWAYS verify zoom/pan persists through block updates
    *   Test that graph NEVER auto-centers or auto-fits
    *   Ensure viewport position is maintained exactly
    *   Test with rapid block updates to ensure stability
