import { useState, useEffect } from 'react';
import { getTokenLogoUrlSync } from '@/components/dexscan/shared/hooks/useTokenLogo';
import { getCoinImageFromAPI } from '@/components/dexscan/shared/utils/coingecko/api';

// Fetch missing token logos from API
export function useTokenLogos(filteredPools) {
  const [apiLogos, setApiLogos] = useState({});
  
  useEffect(() => {
    const fetchMissingLogos = async () => {
      const symbolsToFetch = [];
      
      // Find tokens without CDN logos
      filteredPools.forEach(pool => {
        pool.tokens.forEach(token => {
          // Comment this out to see if token logo API fetching works
          const cdnUrl = getTokenLogoUrlSync(token.symbol);
          if (!cdnUrl && !apiLogos[token.address]) {
            console.warn(`pushing symbols for fetching`);
            symbolsToFetch.push({ 
              symbol: token.symbol, 
              address: token.address 
            });
          }
        });
      });
      
      // Fetch from API
      for (const { symbol, address } of symbolsToFetch) {
        const apiUrl = await getCoinImageFromAPI(symbol);
        if (apiUrl) {
          setApiLogos(prev => ({ ...prev, [address]: apiUrl }));
        }
      }
    };
    
    if (filteredPools.length > 0) {
      fetchMissingLogos();
    }
  }, [filteredPools]); // Don't include apiLogos to avoid infinite loop
  
  return apiLogos;
}