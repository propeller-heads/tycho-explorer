// src/lib/coingecko.ts

// Defines the structure of a coin object from the CoinGecko API /coins/list endpoint
interface CoinGeckoCoin {
  id: string;
  symbol: string;
  name: string;
}

// Defines the structure of the image object within the /coins/{id} endpoint response
interface CoinGeckoImage {
  thumb: string;
  small: string;
  large: string;
}

// Defines the structure of the full coin details from the /coins/{id} endpoint response
interface CoinGeckoCoinDetail {
  id: string;
  symbol: string;
  name: string;
  image: CoinGeckoImage;
  // Add other fields if needed in the future
}

// In-memory cache for the full list of coins from /coins/list
let cachedCoinList: CoinGeckoCoin[] | null = null;
const COIN_LIST_CACHE_KEY = 'coingeckoCoinList';
const COIN_LIST_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
let inFlightCoinListFetch: Promise<CoinGeckoCoin[] | null> | null = null; // To prevent multiple simultaneous fetches

// In-memory cache for coin ID to large image URL mapping
const coinImageCache: Map<string, string | null> = new Map();
const COIN_IMAGE_URL_CACHE_PREFIX = 'coingeckoImageURL_';
// Using the same duration as coin list for simplicity, can be adjusted
const COIN_IMAGE_URL_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Queue for image requests to prevent CoinGecko API rate limits
interface QueuedImageRequest {
  coinId: string;
  resolve: (url: string | null) => void;
  reject: (reason?: any) => void;
}
let imageRequestQueue: QueuedImageRequest[] = [];
let isProcessingImageQueue = false;
const IMAGE_REQUEST_DELAY_MS = 15000; // 15000ms (15 seconds) delay between image API calls to strictly respect CoinGecko's 5-15 calls/min rate limit

/**
 * = Signature, Purpose Statement, Header
 * Consumes a token symbol (string).
 * Produces the CoinGecko coin ID (string) or null.
 * Fetches the list of all coins from CoinGecko, caches it, and searches for the given symbol.
 * Returns the coin's ID if found, otherwise null.
 */
export async function getCoinId(symbol: string): Promise<string | null> {
  // Problem Analysis to Data Definitions:
  // Input: symbol (string, e.g., "ETH", "USDC")
  // Output: coinId (string, e.g., "ethereum", "usd-coin") or null
  // Data source: CoinGecko API /coins/list

  // Function Template:
  // 1. Check if coin list is cached. If not, fetch and cache.
  // 2. If fetch fails, return null.
  // 3. Search cached list for symbol (case-insensitive on symbol and name).
  // 4. Return ID if found, else null.

  // Function Definition:
  if (!cachedCoinList) {
    // Try to load from localStorage first
    const cachedDataString = localStorage.getItem(COIN_LIST_CACHE_KEY);
    if (cachedDataString) {
      try {
        const cached = JSON.parse(cachedDataString);
        if (cached.timestamp && (Date.now() - cached.timestamp < COIN_LIST_CACHE_DURATION) && cached.data) {
          console.log('Using cached CoinGecko coin list from localStorage');
          cachedCoinList = cached.data as CoinGeckoCoin[];
        } else {
          localStorage.removeItem(COIN_LIST_CACHE_KEY); // Cache expired or invalid
        }
      } catch (e) {
        console.error('Failed to parse cached coin list from localStorage', e);
        localStorage.removeItem(COIN_LIST_CACHE_KEY);
      }
    }
  }

  if (!cachedCoinList) {
    if (inFlightCoinListFetch) {
      // If a fetch is already in progress, await its result
      cachedCoinList = await inFlightCoinListFetch;
    } else {
      // No cached list and no in-flight fetch, so start one
      console.log('Initiating new CoinGecko coin list fetch');
      inFlightCoinListFetch = (async () => {
        let attempts = 0;
        const MAX_ATTEMPTS = 3;
        let fetchedData: CoinGeckoCoin[] | null = null;

        while (attempts < MAX_ATTEMPTS) {
          try {
            console.log(`[CoinGecko] Attempting to fetch: https://api.coingecko.com/api/v3/coins/list (Attempt: ${attempts + 1})`);
            const response = await fetch('https://api.coingecko.com/api/v3/coins/list');
            console.log('[CoinGecko] Response for /coins/list:', response.status, response.statusText);
            if (response.ok) {
              fetchedData = (await response.json()) as CoinGeckoCoin[];
              // Cache in-memory only on success
              cachedCoinList = fetchedData;
              // Cache in localStorage only on success
              try {
                localStorage.setItem(COIN_LIST_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data: fetchedData }));
              } catch (e) {
                console.error('Failed to save coin list to localStorage:', e);
              }
              break; // Success, exit retry loop
            } else if (response.status === 429 && attempts < MAX_ATTEMPTS - 1) {
              attempts++;
              const delay = 1000 * Math.pow(2, attempts); // Exponential backoff (2s, 4s, 8s)
              console.warn(`CoinGecko coins/list failed (429). Retrying in ${delay / 1000}s... (attempt ${attempts + 1}/${MAX_ATTEMPTS})`);
              await new Promise(r => setTimeout(r, delay));
            } else {
              // Other HTTP error or max retries for 429 reached
              console.error(`CoinGecko API error (coins/list): ${response.status} ${response.statusText}`);
              break; // Exit retry loop
            }
          } catch (error) {
            console.error('Failed to fetch CoinGecko coins list:', error);
            attempts++;
            if (attempts >= MAX_ATTEMPTS) break; // Max retries for network error
            // Optional: add a small delay for general network errors before retry
            await new Promise(r => setTimeout(r, 1000 * attempts)); 
          }
        }
        return fetchedData; // Return null if all attempts fail
      })();
      const result = await inFlightCoinListFetch; // Await the result of the (possibly retried) fetch
      if (result !== null) { // Only update cachedCoinList if the fetch was successful
        cachedCoinList = result;
      }
    }
  }

  if (!cachedCoinList) {
    // If after all attempts, cachedCoinList is still null, return null
    return null;
  }

  // Normalize the input symbol for case-insensitive comparison
  const normalizedSymbol = symbol.toLowerCase();

  // Search for the coin in the cached list
  // Match against symbol and name for better coverage
  const foundCoin = cachedCoinList.find(
    (coin) =>
      coin.symbol.toLowerCase() === normalizedSymbol ||
      coin.name.toLowerCase() === normalizedSymbol
  );

  return foundCoin ? foundCoin.id : null;
}

/**
 * = Signature, Purpose Statement, Header
 * Consumes a CoinGecko coin ID (string).
 * Produces the URL for the large version of the coin's image (string) or null.
 * Fetches coin details from CoinGecko using the ID, caches the image URL.
 * Returns the large image URL if found, otherwise null.
 */
export async function getCoinImageURL(coinId: string): Promise<string | null> {
  // Problem Analysis to Data Definitions:
  // Input: coinId (string, e.g., "ethereum")
  // Output: imageUrl (string) or null
  // Data source: CoinGecko API /coins/{id}

  // Function Template:
  // 1. Check cache for image URL. If found, return it.
  // 2. If not cached, fetch coin details.
  // 3. If fetch fails or image URL not present, cache and return null.
  // 4. Extract large image URL, cache, and return it.

  // Function Definition:
  // 1. Check in-memory cache first
  if (coinImageCache.has(coinId)) {
    return coinImageCache.get(coinId) ?? null;
  }

  // 2. Check localStorage cache
  const localStorageKey = `${COIN_IMAGE_URL_CACHE_PREFIX}${coinId}`;
  const cachedImageDataString = localStorage.getItem(localStorageKey);
  if (cachedImageDataString) {
    try {
      const cached = JSON.parse(cachedImageDataString);
      if (cached.timestamp && (Date.now() - cached.timestamp < COIN_IMAGE_URL_CACHE_DURATION)) {
        coinImageCache.set(coinId, cached.imageUrl); // Populate in-memory cache
        return cached.imageUrl;
      } else {
        localStorage.removeItem(localStorageKey); // Cache expired or invalid
      }
    } catch (e) {
      console.error(`Failed to parse cached image URL for ${coinId} from localStorage`, e);
      localStorage.removeItem(localStorageKey);
    }
  }

  // If not in cache, enqueue the request and return a promise
  return new Promise<string | null>((resolve, reject) => {
    imageRequestQueue.push({ coinId, resolve, reject });
    processImageQueue(); // Start processing if not already running
  });
}

/**
 * = Signature, Purpose Statement, Header
 * Processes the image request queue sequentially with delays to respect API rate limits.
 * Consumes requests from `imageRequestQueue`.
 * Produces side effects: fetches from CoinGecko, updates caches, resolves/rejects promises.
 */
async function processImageQueue() {
  // Function Definition:
  if (isProcessingImageQueue || imageRequestQueue.length === 0) {
    return;
  }

  isProcessingImageQueue = true;

  while (imageRequestQueue.length > 0) {
    const currentRequest = imageRequestQueue.shift();
    if (!currentRequest) {
      // This case should ideally not be hit if imageRequestQueue.length > 0
      // but as a safeguard, if for some reason it's undefined, break the loop.
      break; 
    }

    const { coinId, resolve, reject } = currentRequest;
    const localStorageKey = `${COIN_IMAGE_URL_CACHE_PREFIX}${coinId}`; // Define localStorageKey here

    // Double-check cache in case it was populated while waiting in queue
    if (coinImageCache.has(coinId)) {
      resolve(coinImageCache.get(coinId) ?? null);
      // No delay needed if served from cache
      continue; 
    }

    let imageUrl: string | null = null; // Declare imageUrl here

    try {
      console.log(`[CoinGecko] Queue: Attempting to fetch: https://api.coingecko.com/api/v3/coins/${coinId}`);
      // Fetch the coin details directly from CoinGecko API
      const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`);
      console.log(`[CoinGecko] Queue: Response for /coins/${coinId}: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        console.error(`CoinGecko API error (coins/${coinId}): ${response.status} ${response.statusText}`);
        // Do NOT cache null/failure in localStorage or in-memory if it's an API error
        reject(new Error(`API error: ${response.status}`)); // Reject the promise
      } else { // response.ok was true
        const data = (await response.json()) as CoinGeckoCoinDetail;

        // Extract the large image URL
        imageUrl = data.image?.large || null; // Assign to the declared variable

        // If imageUrl is null (CoinGecko says no image), do not cache it.
        // Otherwise, cache the image URL in both caches.
        if (imageUrl !== null) {
          console.log(`[CoinGecko] Queue: Found image URL for ${coinId}: ${imageUrl}`);
          coinImageCache.set(coinId, imageUrl);
          try {
            localStorage.setItem(localStorageKey, JSON.stringify({ timestamp: Date.now(), imageUrl: imageUrl }));
          } catch (e) {
            console.error(`Failed to save image URL for ${coinId} to localStorage`, e);
          }
        } else {
          // console.warn(`No large image URL found for coin ID: ${coinId}. Not caching null.`); // Already logged by getCoinImageURL if needed
          console.log(`[CoinGecko] Queue: No image URL found by CoinGecko for ${coinId}.`);
        }
        resolve(imageUrl); // Resolve the promise for this specific request
      }
    } catch (error) {
      console.error(`Failed to fetch CoinGecko coin details for ID ${coinId}:`, error);
      // Do NOT cache null/failure in localStorage or in-memory if it's a network error
      reject(error); // Reject the promise
    }

    // Wait before processing the next item, only if there are more items
    if (imageRequestQueue.length > 0) {
      console.log(`[CoinGecko] Queue: Delaying ${IMAGE_REQUEST_DELAY_MS}ms before next image fetch.`);
      await new Promise(r => setTimeout(r, IMAGE_REQUEST_DELAY_MS));
    }
  }

  isProcessingImageQueue = false; // All requests processed
}
