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

// In-memory cache for coin ID to large image URL mapping
const coinImageCache: Map<string, string | null> = new Map();
const COIN_IMAGE_URL_CACHE_PREFIX = 'coingeckoImageURL_';
// Using the same duration as coin list for simplicity, can be adjusted
const COIN_IMAGE_URL_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours


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
    console.log('Fetching new CoinGecko coin list');
    try {
      // Fetch the list of coins via the proxy
      const response = await fetch('/api/coingecko/coins/list');
      if (!response.ok) {
        console.error(`CoinGecko API error (coins/list via proxy): ${response.status} ${response.statusText}`);
        return null;
      }
      const data = (await response.json()) as CoinGeckoCoin[];
      // Cache in-memory
      cachedCoinList = data;
      // Cache in localStorage
      try {
        localStorage.setItem(COIN_LIST_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data: data }));
      } catch (e) {
        console.error('Failed to save coin list to localStorage', e);
        // This might happen if localStorage is full or disabled.
        // The in-memory cache will still work for the session.
      }
    } catch (error) {
      console.error('Failed to fetch CoinGecko coins list:', error);
      return null;
    }
  }

  if (!cachedCoinList) {
    // Should not happen if fetch was successful or cache loaded, but as a safeguard
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
        // console.log(`Using cached image URL for ${coinId} from localStorage`);
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

  // 3. Fetch from network if not in any cache or cache expired
  // console.log(`Fetching new image URL for coin ID: ${coinId}`);
  try {
    // Fetch the coin details via the proxy
    const response = await fetch(`/api/coingecko/coins/${coinId}`);
    if (!response.ok) {
      console.error(`CoinGecko API error (coins/${coinId} via proxy): ${response.status} ${response.statusText}`);
      // Cache failure as null in both caches to prevent re-fetching for a while
      coinImageCache.set(coinId, null);
      try {
        localStorage.setItem(localStorageKey, JSON.stringify({ timestamp: Date.now(), imageUrl: null }));
      } catch (e) { /* LocalStorage full or disabled */ }
      return null;
    }
    const data = (await response.json()) as CoinGeckoCoinDetail;

    // Extract the large image URL
    const imageUrl = data.image?.large || null; // Ensure it's null if undefined

    // Cache the image URL (or null if not found) in both caches
    coinImageCache.set(coinId, imageUrl);
    try {
      localStorage.setItem(localStorageKey, JSON.stringify({ timestamp: Date.now(), imageUrl: imageUrl }));
    } catch (e) {
      console.error(`Failed to save image URL for ${coinId} to localStorage`, e);
    }

    if (!imageUrl) {
      console.warn(`No large image URL found for coin ID: ${coinId}`);
    }
    return imageUrl;

  } catch (error) {
    console.error(`Failed to fetch CoinGecko coin details for ID ${coinId}:`, error);
    // Cache failure as null in both caches
    coinImageCache.set(coinId, null);
    try {
      localStorage.setItem(localStorageKey, JSON.stringify({ timestamp: Date.now(), imageUrl: null }));
    } catch (e) { /* LocalStorage full or disabled */ }
    return null;
  }
}
