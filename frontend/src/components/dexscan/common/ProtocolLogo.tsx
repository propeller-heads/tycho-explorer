import React from 'react';
import { useTokenLogo, getFallbackLetters } from '@/hooks/useTokenLogo';
import { tokenLogoBaseClasses, getTextSizeClass, sizeToRem } from './tokenIconStyles';

// Protocol to symbol mapping
const protocolToSymbol: Record<string, string> = {
  'uniswap_v2': 'UNI',
  'uniswap_v3': 'UNI',
  'uniswap_v4': 'UNI',
  'vm:curve': 'CRV',
  'vm:balancer_v2': 'BAL',
  'sushiswap_v2': 'SUSHI',
  'pancakeswap_v2': 'CAKE',
  'pancakeswap_v3': 'CAKE',
  'ekubo_v2': 'EKUBO',
  // Add other mappings as needed
};

interface ProtocolLogoProps {
  protocolName: string;
  size?: number; // Tailwind size unit (e.g., 6 for w-6, h-6)
}

const ProtocolLogo: React.FC<ProtocolLogoProps> = ({ protocolName, size = 6 }) => {
  const symbol = protocolToSymbol[protocolName?.toLowerCase()] || '';
  const { logoUrl, handleError } = useTokenLogo(symbol);

  const sizeRem = sizeToRem(size);
  const textSizeClass = getTextSizeClass(size);

  return (
    <div 
      className={`${tokenLogoBaseClasses} ${textSizeClass} text-[#FFFFFF] !bg-[rgba(255,255,255,0.15)]`}
      style={{ width: `${sizeRem}rem`, height: `${sizeRem}rem` }}
    >
      {logoUrl ? (
        <img 
          src={logoUrl} 
          alt={protocolName} 
          className="w-full h-full object-cover rounded-full"
          onError={handleError}
        />
      ) : (
        getFallbackLetters(protocolName)[0] // Just first letter for protocols
      )}
    </div>
  );
};

export default ProtocolLogo;