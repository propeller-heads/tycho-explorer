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
  const [coinId, setCoinId] = useState<string | null>(null);
  const [triedStatic, setTriedStatic] = useState(false);

  useEffect(() => {
    if (token.logoURI) {
      setIconUrl(token.logoURI);
      return;
    }
    let isMounted = true;
    const fetchIcon = async () => {
      const id = await getCoinId(token.symbol); // Or use token.address if mapping exists
      if (isMounted && id) {
        setCoinId(id);
        // Try static logo first
        setIconUrl(`/logos/${id}.png`);
        setTriedStatic(false);
      }
    };
    if (!iconUrl && token.symbol) { // Ensure symbol exists before fetching
        fetchIcon();
    }
    return () => { isMounted = false; };
  }, [token.symbol, token.address, token.logoURI]); // Removed iconUrl from dependencies

  // Handle image load error - fallback to Coingecko API
  const handleImageError = async () => {
    if (!triedStatic && coinId) {
      setTriedStatic(true);
      const url = await getCoinImageURL(coinId);
      if (url) {
        setIconUrl(url);
      } else {
        setIconUrl(null);
      }
    } else {
      setIconUrl(null);
    }
  };

  // Get styling values from shared utilities
  const sizeRem = sizeToRem(size);
  const textSizeClass = getTextSizeClass(size);

  return (
    <div 
      className={`${tokenLogoBaseClasses} ${textSizeClass}`}
      style={{ width: `${sizeRem}rem`, height: `${sizeRem}rem` }}
    >
      {iconUrl ? (
        <img 
          src={iconUrl} 
          alt={token.symbol} 
          className="w-full h-full object-cover rounded-full" 
          onError={handleImageError}
        />
      ) : (
        token.symbol ? token.symbol.substring(0, 1).toUpperCase() : '?'
      )}
    </div>
  );
};

export default TokenIcon;
