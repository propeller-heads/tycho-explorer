import { useState, useEffect, useRef } from 'react';
import { getCoinId, getCoinLogoUrl, getCoinImageFromAPI } from '@/lib/coingecko';

export function useTokenLogo(symbol: string, providedLogoURI?: string) {
  // Start with provided URI or CDN URL
  const [logoUrl, setLogoUrl] = useState<string | null>(
    providedLogoURI || getCoinLogoUrl(getCoinId(symbol))
  );
  
  // Track if we've already tried API to prevent loops
  const triedApi = useRef(false);
  
  // Reset logo URL when symbol or providedLogoURI changes
  useEffect(() => {
    setLogoUrl(providedLogoURI || getCoinLogoUrl(getCoinId(symbol)));
    triedApi.current = false;
  }, [symbol, providedLogoURI]);
  
  // Try API when no logoUrl and haven't tried yet
  useEffect(() => {
    if (!logoUrl && symbol && !triedApi.current) {
      triedApi.current = true;
      getCoinImageFromAPI(symbol).then(url => {
        if (url) setLogoUrl(url);
      });
    }
  }, [logoUrl, symbol]);

  // Handle image error - clear URL to trigger API fallback
  const handleError = () => {
    setLogoUrl(null);
  };

  return { logoUrl, handleError };
}

// Fallback letters helper (3 letters as requested)
export function getFallbackLetters(text: string): string {
  return text ? text.substring(0, 3).toUpperCase() : '?';
}

// Synchronous helper for initial render (used by GraphView)
export function getTokenLogoUrlSync(symbol: string): string | null {
  return getCoinLogoUrl(getCoinId(symbol));
}