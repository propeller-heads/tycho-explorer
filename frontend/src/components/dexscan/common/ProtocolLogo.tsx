import React, { useState, useEffect } from 'react';
import { getCoinImageURL } from '@/lib/coingecko';

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

  const sizeRem = size * 0.25; // Assuming 1 unit = 0.25rem
  const textSizeClass = size <= 4 ? 'text-[9px]' : 'text-[10px]';

  return (
    <div 
      className={`rounded-full bg-[rgba(255,244,224,0.15)] border-2 border-[rgba(255,244,224,0.25)] flex items-center justify-center ${textSizeClass} overflow-hidden shrink-0 text-[#FFF4E0]`}
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
