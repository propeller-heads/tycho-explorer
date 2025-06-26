import React, { useState, useEffect } from 'react';
import { getCoinLogoUrl } from '@/lib/coingecko';
import { tokenLogoBaseClasses, getTextSizeClass, sizeToRem } from './tokenIconStyles';

const protocolToCoinGeckoId: { [key: string]: string } = {
  'uniswap_v2': 'uniswap',
  'uniswap_v3': 'uniswap',
  'uniswap_v4': 'uniswap',
  'vm:curve': 'curve-dao-token',
  'vm:balancer_v2': 'balancer',
  'sushiswap_v2': 'sushi',
  'pancakeswap_v2': 'pancakeswap-token',
  'pancakeswap_v3': 'pancakeswap-token',
  'ekubo_v2': 'ekubo-protocol',
  // Add other mappings as needed
};

interface ProtocolLogoProps {
  protocolName: string;
  size?: number; // Tailwind size unit (e.g., 6 for w-6, h-6)
}

const ProtocolLogo: React.FC<ProtocolLogoProps> = ({ protocolName, size = 6 }) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    // Get protocol's CoinGecko ID from mapping
    const coinId = protocolToCoinGeckoId[protocolName?.toLowerCase() || ''];
    if (coinId) {
      // Get CDN URL directly (synchronous)
      const url = getCoinLogoUrl(coinId);
      setLogoUrl(url);
    }
  }, [protocolName]);

  const sizeRem = sizeToRem(size);
  const textSizeClass = getTextSizeClass(size);

  return (
    <div 
      className={`${tokenLogoBaseClasses} ${textSizeClass} text-[#FFFFFF] !bg-[rgba(255,255,255,0.15)]`}
      style={{ width: `${sizeRem}rem`, height: `${sizeRem}rem` }}
    >
      {logoUrl ? (
        <img src={logoUrl} alt={protocolName} className="w-full h-full object-cover rounded-full" />
      ) : (
        protocolName ? protocolName.substring(0, 1).toUpperCase() : 'P'
      )}
    </div>
  );
};

export default ProtocolLogo;