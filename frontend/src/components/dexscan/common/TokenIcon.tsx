import React, { useState, useEffect } from 'react';
import { Token } from '../types';
import { getCoinId, getCoinLogoUrl, getCoinImageFromAPI } from '@/lib/coingecko';
import { tokenLogoBaseClasses, getTextSizeClass, sizeToRem } from './tokenIconStyles';

interface TokenIconProps {
  token: Token;
  size?: number; // Tailwind size unit (e.g., 6 for w-6, h-6)
}

const TokenIcon: React.FC<TokenIconProps> = ({ token, size = 6 }) => {
  const [iconUrl, setIconUrl] = useState<string | null>(
    token.logoURI || getCoinLogoUrl(getCoinId(token.symbol))
  );
  
  // Add API fallback when no CDN URL
  useEffect(() => {
    if (!iconUrl && token.symbol) {
      getCoinImageFromAPI(token.symbol).then(url => url && setIconUrl(url));
    }
  }, [iconUrl, token.symbol]);
  
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
          onError={() => setIconUrl(null)}
        />
      ) : (
        token.symbol ? token.symbol.substring(0, 3).toUpperCase() : '?'
      )}
    </div>
  );
};

export default TokenIcon;