import React, { useState, useEffect } from 'react';
import { getCoinImageURL } from '@/lib/coingecko';
import { tokenLogoBaseClasses, getTextSizeClass, sizeToRem } from './tokenIconStyles';

const protocolToCoinGeckoId: { [key: string]: string } = {
  'uniswap_v2': 'uniswap',
  'uniswap_v3': 'uniswap',
  'uniswap_v4': 'uniswap',
  'vm:curve': 'curve-dao-token',
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
    let isMounted = true;
    const fetchLogo = async () => {
      const coinId = protocolToCoinGeckoId[protocolName?.toLowerCase() || ''];
      if (coinId) {
        const url = await getCoinImageURL(coinId);
        if (isMounted && url) {
          setLogoUrl(url);
        }
      }
    };
    if (protocolName) {
      fetchLogo();
    }
    return () => { isMounted = false; };
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
        // Log a warning if logo is not found, to help diagnose missing mappings
        // console.warn(`ProtocolLogo: No logo found for protocol: ${protocolName}`);
        protocolName ? protocolName.substring(0, 1).toUpperCase() : 'P'
      )}
    </div>
  );
};

export default ProtocolLogo;
