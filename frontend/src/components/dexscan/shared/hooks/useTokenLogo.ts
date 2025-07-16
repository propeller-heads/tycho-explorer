import { useState, useEffect, useRef } from 'react';
import { getCoinId, getCoinLogoUrl, getCoinImageFromAPI } from '@/components/dexscan/shared/utils/coingecko/api';
import wethIcon from '@/assets/weth.png';

export function useTokenLogo(symbol: string, providedLogoURI?: string) {
  // Use custom WETH icon for WETH tokens
  const isWETH = symbol === 'WETH';
  
  // Start with provided URI or CDN URL
  const [logoUrl, setLogoUrl] = useState<string | null>(
    isWETH ? wethIcon : (providedLogoURI || getCoinLogoUrl(getCoinId(symbol)))
  );
  
  // Track if we've already tried API to prevent loops
  const triedApi = useRef(false);
  
  // Reset logo URL when symbol or providedLogoURI changes
  useEffect(() => {
    setLogoUrl(isWETH ? wethIcon : (providedLogoURI || getCoinLogoUrl(getCoinId(symbol))));
    triedApi.current = false;
  }, [symbol, providedLogoURI, isWETH]);
  
  // Try API when no logoUrl and haven't tried yet (skip for WETH)
  useEffect(() => {
    if (!logoUrl && symbol && !triedApi.current && !isWETH) {
      triedApi.current = true;
      getCoinImageFromAPI(symbol).then(url => {
        if (url) setLogoUrl(url);
      });
    }
  }, [logoUrl, symbol, isWETH]);

  // Handle image error - clear URL to trigger API fallback (don't clear for WETH)
  const handleError = () => {
    if (!isWETH) {
      setLogoUrl(null);
    }
  };

  return { logoUrl, handleError };
}

// Fallback letters helper (3 letters as requested)
export function getFallbackLetters(text: string): string {
  return text ? text.substring(0, 3).toUpperCase() : '?';
}

// Synchronous helper for initial render (used by GraphView)
export function getTokenLogoUrlSync(symbol: string): string | null {
  // Use custom WETH icon for WETH tokens
  if (symbol === 'WETH') {
    return wethIcon;
  }
  return getCoinLogoUrl(getCoinId(symbol));
}