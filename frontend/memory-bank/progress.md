# Progress: Pool Explorer - Core Features and API Robustness

This document outlines the current implementation status and planned work for the Pool Explorer project.

## Pool View

The Pool List View has undergone significant refactoring to align with the TC Design, including the implementation of infinite scroll and comprehensive styling updates. Token and protocol logos are now loading, though initial loading for uncached images is slow due to strict API rate limits from CoinGecko.

## Graph View

Mostly works. There're fine tuning needed to be done. Specifically, the edge no longer widens, the background color is off. Logo fetching in the graph view will benefit from the same `coingecko.ts` improvements.

## What Works

*   Real-time data updates via WebSocket.
*   Pool List View:
    *   Infinite scroll.
    *   Advanced filtering (tokens, protocols, pool IDs).
    *   Sorting by various columns.
    *   TC Design styling largely applied.
    *   **Token and Protocol Logo Fetching:** Logos are now fetched from CoinGecko. The system includes:
        *   Robust handling of the `/coins/list` API call (single-flight, retries on 429).
        *   A request queue for individual image URL fetches with a 10-second delay between API calls to respect CoinGecko's rate limits.
        *   Strict "never cache nulls" policy for API errors or if CoinGecko explicitly states no image is available.
*   Pool Detail Sidebar (basic structure).
*   Swap Simulator (basic structure).

## What's Left to Build / Refine

*   Full implementation and styling of Pool Detail Sidebar and Swap Simulator.
*   Graph View:
    *   Fine-tuning interactions (edge widening).
    *   Correcting background color.
    *   Ensuring robust logo display using the updated `coingecko.ts`.
*   Thorough testing of all features, especially filter/sort interactions with infinite scroll and logo loading.
*   Overall color scheme consistency review.
*   Potential performance optimizations if logo loading speed is deemed too slow for UX, balanced against API limits.

## Known Issues / Characteristics

*   **Slow Initial Logo Loading:** Due to the necessary 15-second delay between CoinGecko API calls for images (to respect their 5-15 calls/minute free tier limit), initial loading of a set of new (uncached) logos will be sequential and slow. Subsequent views will be faster due to caching.
*   **Missing Logos for Some Assets:** Some tokens/protocols may not have logos if CoinGecko does not provide an image URL for them. The application will show fallback text in these cases.
*   Graph View: Edge widening and background color issues as noted.

## Evolution of Project Decisions

*   **CoinGecko API Integration for Logos - Robustness and Rate Limiting (May 23, 2025):**
    *   **Scope:** Investigated and resolved issues causing token/protocol logos not to load, primarily due to CoinGecko API rate limits.
    *   **Key Decisions & Features Implemented (in `src/lib/coingecko.ts`):**
        *   **Single In-Flight Fetch for `/coins/list`:** Ensured only one network request for the global coin list is active at a time, preventing multiple concurrent calls.
        *   **Retry Mechanism for `/coins/list`:** Added retries with exponential backoff if the `/coins/list` fetch fails with HTTP 429.
        *   **Request Queue for Image URLs:** Implemented a queue to serialize individual image URL fetches (`/coins/<id>`).
        *   **API Call Delay:** Introduced a 10-second delay (`IMAGE_REQUEST_DELAY_MS`) between queued image API calls to adhere to CoinGecko's 5-15 calls/minute limit.
        *   **Strict "Never Cache Nulls" Policy:** Modified caching logic to not store `null` responses resulting from API errors or if CoinGecko explicitly reports no image available for an ID. Only successful image URL strings are cached.
    *   **Outcome:** Logos now load reliably, though slowly for uncached items. 429 errors from CoinGecko are mitigated.

*   **Pool List View Refactoring (Infinite Scroll & TC Design Styling - May 23, 2025):**
    *   **Scope**: Implemented infinite scroll functionality and applied the TC Design system's visual styles across `ListView.tsx`, `PoolTable.tsx`, `TokenIcon.tsx`, `ProtocolLogo.tsx`, and `BlockProgressIcon.tsx`.
    *   **Key Decisions & Features Implemented**:
        *   Replaced traditional pagination with infinite scroll.
        *   Modified `src/components/ui/scroll-area.tsx` to expose `onViewportScroll`.
        *   Updated `ListView.tsx` for infinite scroll state management.
        *   Applied TC Design color palette and styling.
        *   Adjusted column widths in `PoolTable.tsx`.

*   **Pool List View Refactoring (Column Widths - May 23, 2025):**
    *   **Scope**: Implemented dynamic column width sizing in `PoolTable.tsx`.
    *   **Key Decisions & Features Implemented**:
        *   Used `table-auto`.
        *   Introduced `getColumnWidthClass` helper.
