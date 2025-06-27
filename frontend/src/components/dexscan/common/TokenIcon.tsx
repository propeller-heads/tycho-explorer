import React from 'react';
import { Token } from '../types';
import { useTokenLogo, getFallbackLetters } from '@/hooks/useTokenLogo';
import { tokenLogoBaseClasses, getTextSizeClass, sizeToRem } from './tokenIconStyles';

interface TokenIconProps {
  token: Token;
  size?: number; // Tailwind size unit (e.g., 6 for w-6, h-6)
}

const TokenIcon: React.FC<TokenIconProps> = ({ token, size = 6 }) => {
  const { logoUrl, handleError } = useTokenLogo(token.symbol, token.logoURI);
  
  // Get styling values from shared utilities
  const sizeRem = sizeToRem(size);
  const textSizeClass = getTextSizeClass(size);

  return (
    <div
      className={`${tokenLogoBaseClasses} ${textSizeClass}`}
      style={{ width: `${sizeRem}rem`, height: `${sizeRem}rem` }}
    >
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={token.symbol}
          className="w-full h-full object-cover rounded-full"
          onError={handleError}
        />
      ) : (
        getFallbackLetters(token.symbol)
      )}
    </div>
  );
};

export default TokenIcon;