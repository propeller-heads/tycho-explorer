# Active Context: Pool Explorer - Resolved Logo Loading Issues

## Current Work Focus

The recent work focused on investigating and resolving issues related to token and protocol logos not loading in the Pool List View and potentially the Market Graph View. This task is now considered complete, with logos loading reliably, albeit slowly due to API rate limits.

## Recent Changes

The investigation into missing logos revealed critical issues with CoinGecko API rate limiting and previous caching strategies. The following changes were implemented primarily in `src/lib/coingecko.ts`:

*   **Robust Coin List Fetching (`getCoinId` for `/api/coingecko/coins/list`):**
    *   Implemented a **single in-flight fetch mechanism** (`inFlightCoinListFetch` promise) to ensure only one network request for the global coin list is active at any time, even with concurrent calls.
    *   Added a **retry mechanism** (up to 3 attempts with exponential backoff, e.g., 2s, 4s delays) for the `/coins/list` fetch if it encounters HTTP 429 ("Too Many Requests") errors.
    *   **Refined Caching:** Successful responses are cached in memory and `localStorage`. Failures (e.g., `null` result after all retries) do **not** overwrite previously valid cached data and are **not** stored as failures in `localStorage`, allowing future attempts.

*   **Queued & Delayed Image URL Fetching (`getCoinImageURL` for `/api/coingecko/coins/<id>`):**
    *   Implemented an **asynchronous request queue** (`imageRequestQueue`) for fetching individual coin/protocol image URLs.
    *   A single "worker" function (`processImageQueue`) processes this queue sequentially.
    *   A **mutex flag** (`isProcessingImageQueue`) ensures only one worker instance runs, preventing race conditions.
    *   A significant **delay (`IMAGE_REQUEST_DELAY_MS = 10000ms` or 10 seconds)** is enforced between each API call made by the queue worker to respect CoinGecko's strict rate limits (experimentally found to be necessary).
    *   **Strict "Never Cache Nulls" Policy:**
        *   API errors (4xx, 5xx, network issues) during image URL fetch attempts are **not** cached. The promise for the request is rejected.
        *   If CoinGecko successfully responds but indicates no image is available for a `coinId` (i.e., `data.image?.large` is `null`), this `null` result is also **not** cached. The promise resolves with `null`, allowing UI fallbacks, but the system will re-attempt the fetch if the image is requested again later.
        *   Only actual, valid image URL strings are cached.

*   **Logging:** Added detailed `console.log` statements in `src/lib/coingecko.ts` to trace API call attempts, responses, queue activity, and delays for easier debugging.

*   **`ListView.tsx` State:** This component was reverted by the user to its original state, meaning it does **not** contain proactive pre-fetching logic. Image loading relies on `TokenIcon.tsx` and `ProtocolLogo.tsx` initiating their own fetches upon rendering, which then utilize the robust `coingecko.ts` mechanisms.

## Next Steps

*   Monitor the application for any regressions or new issues related to logo fetching.
*   Evaluate if the 10-second delay between image fetches, while necessary for reliability with the free CoinGecko API, is acceptable for user experience in the long term. Future optimizations might involve exploring paid API tiers, alternative image sources, or more advanced caching/proxying if faster loading is critical.
*   Await the next development task.

## Important Patterns and Preferences

*   **API Robustness:** External API interactions must be resilient to transient errors (like rate limiting) using mechanisms such as retries and queues.
*   **Rate Limiting:** Strict adherence to external API rate limits is paramount. Delays between requests must be configured based on observed API behavior and official documentation if available.
*   **Caching Strategy:** Caching policies need careful consideration. The "never cache nulls from API errors or explicit 'no data' responses" policy was strictly implemented as per user directive, understanding the trade-off of potentially re-fetching "known not founds."
*   **Modularity:** Complex API interaction logic is centralized in `src/lib/coingecko.ts`, allowing UI components (`TokenIcon`, `ProtocolLogo`) to be simpler consumers.

## Learnings and Project Insights

*   **CoinGecko Free API Limits:** The free tier of the CoinGecko API has very strict rate limits (experimentally found to be around 5-15 calls per minute, later confirmed by user research). Even single initial calls can be rate-limited.
*   **Debugging Process:** The resolution involved an iterative process:
    1.  Initial symptom: Logos not loading.
    2.  Hypothesis 1: Faulty image paths or component logic (disproven by code review).
    3.  Hypothesis 2: Caching of `null` values preventing retries (confirmed by user clearing localStorage, leading to 429s).
    4.  Hypothesis 3: API rate limiting (confirmed by 429 errors).
    5.  Solution Iteration 1: Basic queue and delay (still saw 429s, delay too short, `coins/list` also an issue).
    6.  Solution Iteration 2: Single-flight and retries for `coins/list`, increased delay for image queue, stricter null caching (this proved effective).
*   **Mutex Necessity:** The `isProcessingImageQueue` mutex is crucial for the correct sequential operation of the asynchronous image request queue, preventing race conditions.
*   **Trade-offs:** The 10-second delay for image loading is a direct trade-off for reliability under strict API limits. The "never cache nulls for 'no data'" policy is a trade-off for data freshness vs. request efficiency.
