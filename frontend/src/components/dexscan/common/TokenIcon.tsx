import React, { useState, useEffect } from 'react';
import { Token } from '../types';
import { getCoinId, getCoinImageURL } from '@/lib/coingecko';
import { tokenLogoBaseClasses, getTextSizeClass, sizeToRem } from './tokenIconStyles';

interface TokenIconProps {
  token: Token;
  size?: number; // Tailwind size unit (e.g., 6 for w-6, h-6)
}

const TokenIcon: React.FC<TokenIconProps> = ({ token, size = 6 }) => {
  const [iconUrl, setIconUrl] = useState<string | null>(token.logoURI || null);

  useEffect(() => {
    if (token.logoURI) {
      setIconUrl(token.logoURI);
      return;
    }
    let isMounted = true;
    const fetchIcon = async () => {
      const coinId = await getCoinId(token.symbol); // Or use token.address if mapping exists
      if (coinId) {
        const url = await getCoinImageURL(coinId);
        if (isMounted && url) {
          setIconUrl(url);
        }
      }
    };
    if (!iconUrl && token.symbol) { // Ensure symbol exists before fetching
        fetchIcon();
    }
    return () => { isMounted = false; };
  }, [token.symbol, token.address, token.logoURI, iconUrl]); // Added token.address to dependencies

  // Get styling values from shared utilities
  const sizeRem = sizeToRem(size);
  const textSizeClass = getTextSizeClass(size);

  return (
    <div 
      className={`${tokenLogoBaseClasses} ${textSizeClass}`}
      style={{ width: `${sizeRem}rem`, height: `${sizeRem}rem` }}
    >
      {iconUrl ? (
        <img src={iconUrl} alt={token.symbol} className="w-full h-full object-cover rounded-full" />
      ) : (
        token.symbol ? token.symbol.substring(0, 1).toUpperCase() : '?'
      )}
    </div>
  );
};

export default TokenIcon;
