// Module: HeaderActions
// Description: Defines the actions in the application header,
// including a documentation link and a chain selector with connection indicator.

// Import React and necessary hooks
import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
// Import SVG and PNG assets
import CallMadeIcon from '@/assets/figma_header_icons/call_made.svg';
import EthereumLogo from '@/assets/figma_header_icons/ethereum-logo.png';
import UnichainLogo from '@/assets/figma_header_icons/unichain-logo.svg';
import BaseLogo from '@/assets/figma_header_icons/base-logo.png';
// Import UI components
import { Button } from '@/components/ui/button';
// Import icons from lucide-react
import { ChevronDown } from 'lucide-react';
// Import custom hooks and context consumers
import { usePoolData } from '@/components/dexscan/context/PoolDataContext';

// --- Constants for Strings and URLs ---
const DOCS_URL = "https://docs.propellerheads.xyz/";
const ALT_TEXT_EXTERNAL_LINK = "External link";
const TEXT_DOCS = "Docs";

// --- CSS Class Constants ---
const DOCS_LINK_CLASSES = "flex items-center gap-1 text-sm font-normal text-[#FFFFFF] hover:text-[#FFFFFF]/90 transition-colors";

// --- HeaderActions Component ---
const HeaderActions: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    isConnected,
    selectedChain,
    availableChains,
    connectToWebSocket
  } = usePoolData();

  // Map chain name to corresponding logo
  const chainLogoMap: { [key: string]: string } = {
    'Ethereum': EthereumLogo,
    'Unichain': UnichainLogo,
    'Base': BaseLogo,
  };
  
  const chainLogo = chainLogoMap[selectedChain];

  // Update URL when chain selection changes
  useEffect(() => {
    const currentChainInUrl = searchParams.get('chain');
    if (currentChainInUrl !== selectedChain) {
      setSearchParams({ chain: selectedChain }, { replace: true });
    }
  }, [selectedChain, searchParams, setSearchParams]);

  const handleChainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newChain = e.target.value;
    setSearchParams({ chain: newChain }, { replace: true });
    connectToWebSocket(newChain);
  };

  return (
    <div className="flex items-center gap-2 sm:gap-4">
      <a
        href={DOCS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={DOCS_LINK_CLASSES}
      >
        <span className="hidden sm:inline">{TEXT_DOCS}</span>
        <img src={CallMadeIcon} alt={ALT_TEXT_EXTERNAL_LINK} className="h-4 w-4" />
      </a>
      
      {/* Direct chain selector with connection status */}
      <div className="relative flex items-center">
        {/* Connection status dot */}
        <div className={`absolute left-2 w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-400' : 'bg-red-400'
        }`} />
        
        {/* Chain selector styled as button */}
        <select
          value={selectedChain}
          onChange={handleChainChange}
          className="appearance-none h-9 pl-5 pr-8 rounded-xl bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.1)] text-[#FFFFFF] text-sm font-medium transition-colors cursor-pointer flex items-center gap-2"
          style={{
            backgroundImage: `url(${chainLogo})`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 8px center',
            backgroundSize: '20px 20px'
          }}
        >
          {availableChains.map(chain => (
            <option key={chain} value={chain}>
              {chain}
            </option>
          ))}
        </select>
        
        {/* Dropdown arrow overlay */}
        <ChevronDown className="absolute right-2 h-4 w-4 pointer-events-none text-white/60" />
      </div>
    </div>
  );
};

export default HeaderActions;