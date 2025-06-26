// src/lib/coingecko.ts
import { getCoinIdBySymbol } from './coingeckoCoinId';

/**
 * ARCHITECTURE OVERVIEW:
 * 
 * This module implements a fallback mechanism for fetching coin logos from CoinGecko API
 * when the primary CDN source doesn't have the logo.
 * 
 * Key concepts:
 * 1. Single Queue: All API operations are serialized through one queue (logoQueue)
 * 2. Rate Limiting: 3 second delay between API calls (30 requests/minute limit)
 * 3. Caching: LocalStorage caches both the coin list and individual logo URLs
 * 4. Retry Logic: 10 attempts with exponential backoff for failed requests
 * 5. CORS Proxy: All API calls go through corsproxy.io to bypass browser CORS
 */

/**
 * Get CoinGecko coin ID from symbol using local mapping
 * @param symbol - Token symbol (e.g., 'BTC', 'ETH')
 * @returns CoinGecko coin ID or null if not found
 */
export function getCoinId(symbol: string): string | null {
  if (!symbol) return null;
  return getCoinIdBySymbol(symbol);
}

/**
 * Get CDN URL for coin logo (primary source)
 * @param coinId - CoinGecko coin ID
 * @returns CDN URL or null if no coinId
 */
export function getCoinLogoUrl(coinId: string | null): string | null {
  if (!coinId) return null;
  return `https://cdn.jsdelivr.net/gh/simplr-sh/coin-logos/images/${coinId}/large.png`;
}

/**
 * Helper to add CORS proxy to URLs
 * This is necessary because browsers block direct API calls to CoinGecko
 * @param url - Original API URL
 * @returns Proxied URL that bypasses CORS
 */
function addCorsProxy(url: string): string {
  return `https://corsproxy.io/?${encodeURIComponent(url)}`;
}

/**
 * Pure function that fetches data with retry logic and optional caching
 * 
 * This function:
 * 1. Checks cache first if cacheKey is provided
 * 2. Attempts fetch up to 10 times
 * 3. Uses exponential backoff between retries (3s, 6s, 12s, 24s...)
 * 4. Caches successful responses
 * 
 * @param url - URL to fetch
 * @param cacheKey - Optional localStorage key for caching
 * @returns Parsed JSON data or null if all attempts fail
 */
async function fetchWithRetry(url: string, cacheKey?: string): Promise<any> {
  // Try up to 10 times
  for (let i = 0; i < 10; i++) {
    // Check cache first if key provided - prevents unnecessary API calls
    if (cacheKey) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) return JSON.parse(cached);
    }
    
    try {
      // Make the actual fetch through CORS proxy
      const res = await fetch(addCorsProxy(url));
      if (res.ok) {
        const data = await res.json();
        // Cache successful response
        if (cacheKey) localStorage.setItem(cacheKey, JSON.stringify(data));
        return data;
      }
    } catch {
      // Network error - will retry
    }
    
    // Wait before retry with exponential backoff
    // 3s, 6s, 12s, 24s, 48s, 96s, 192s, 384s, 768s
    if (i < 9) await new Promise(r => setTimeout(r, 3000 * Math.pow(2, i)));
  }
  
  // All attempts failed
  return null;
}

/**
 * Global queue for serializing all logo fetch operations
 * This ensures:
 * 1. No concurrent API calls (respects rate limit)
 * 2. No duplicate list fetches (second request finds it in cache)
 * 3. Simple state management (just one promise chain)
 */
let logoQueue = Promise.resolve();

/**
 * Fetch coin image from CoinGecko API as fallback
 * 
 * This is the main export that components use when CDN doesn't have the logo.
 * 
 * Flow:
 * 1. Check if we already have the logo URL cached
 * 2. Queue the operation (waits for previous operations to complete)
 * 3. Wait 3 seconds for rate limiting
 * 4. Fetch coin list (or use cached version)
 * 5. Find the coin by symbol
 * 6. Fetch coin details to get image URL
 * 7. Cache and return the result
 * 
 * @param symbol - Token symbol (e.g., 'BTC', 'ETH')
 * @returns Image URL or null if not found
 */
export async function getCoinImageFromAPI(symbol: string): Promise<string | null> {
  // Quick cache check - no need to queue if we already have it
  const cached = localStorage.getItem(`cg_${symbol}`);
  if (cached) return cached;
  
  // Queue this logo fetch operation
  // Each operation waits for the previous one to complete
  const result = logoQueue.then(async () => {
    // RE-CHECK cache when our turn comes!
    // This prevents duplicate fetches when multiple components request the same symbol
    const cachedNow = localStorage.getItem(`cg_${symbol}`);
    if (cachedNow) return cachedNow;
    
    // Rate limiting: wait 3 seconds before making API calls
    // This ensures we stay under 30 requests/minute
    await new Promise(r => setTimeout(r, 3000));
    
    // Step 1: Get the coin list
    // This maps symbols to coin IDs (e.g., 'BTC' -> 'bitcoin')
    // The list is cached after first fetch, so subsequent calls are instant
    const list = await fetchWithRetry(
      'https://api.coingecko.com/api/v3/coins/list',
      'cg_list'
    );
    
    // Find the coin in the list by symbol (case-insensitive)
    const coin = list?.find((c: any) => 
      c.symbol.toLowerCase() === symbol.toLowerCase()
    );
    
    // If symbol not found in list, return null
    if (!coin) return null;
    
    // Step 2: Get coin details using the ID
    // This contains the image URLs
    const data = await fetchWithRetry(
      `https://api.coingecko.com/api/v3/coins/${coin.id}`
    );
    
    // Extract the large image URL
    const url = data?.image?.large;
    
    // Cache the result for this symbol
    if (url) localStorage.setItem(`cg_${symbol}`, url);
    
    return url;
  });
  
  // Update the queue to point to this operation
  // .catch(() => {}) ensures the queue continues even if this operation fails
  logoQueue = result.catch(() => {});
  
  // Return the promise so the component can await the result
  return result;
}