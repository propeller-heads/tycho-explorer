// Module: HeaderActions
// Description: Defines the actions in the application header,
// including a documentation link and a chain selector.

// Import React and necessary hooks
import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
// Import SVG and PNG assets
import EthereumLogo from '@/assets/figma_header_icons/ethereum-logo.png';
import UnichainLogo from '@/assets/figma_header_icons/unichain-logo.svg';
import BaseLogo from '@/assets/figma_header_icons/base-logo.png';
// Import UI components
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
// Import icons from lucide-react
import { ChevronDown, Check, ExternalLink } from 'lucide-react';
// Import custom hooks and context consumers
import { usePoolData } from '@/components/dexscan/context/PoolDataContext';

// --- Constants for Strings and URLs ---
const DOCS_URL = "https://docs.propellerheads.xyz/";
const ALT_TEXT_EXTERNAL_LINK = "External link";
const TEXT_DOCS = "Docs (Run locally)";

// --- HeaderActions Component ---
const HeaderActions: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [chainSelectorOpen, setChainSelectorOpen] = React.useState(false);
  const {
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

  const handleChainSelect = (chain: string) => {
    setSearchParams({ chain }, { replace: true });
    connectToWebSocket(chain);
    setChainSelectorOpen(false);
  };

  return (
    // Always flex-row with proper spacing
    <div className="flex flex-row items-center gap-2 sm:gap-4">
      {/* Docs link - hidden on mobile */}
      <div className="hidden sm:flex">
        <a
          href={DOCS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-[#FFF4E1] text-sm font-medium hover:opacity-80 transition-opacity"
        >
          <span>{TEXT_DOCS}</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
      
      {/* Chain selector */}
      <Popover open={chainSelectorOpen} onOpenChange={setChainSelectorOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 h-[36px] w-auto pl-[12px] pr-[10px] rounded-[12px] hover:bg-[rgba(255,255,255,0.1)] text-[#FFFFFF] text-sm font-medium transition-colors bg-milk-bg-light"
          >
            {chainLogo && (
              <img src={chainLogo} alt={selectedChain} className="h-5 w-5" />
            )}
            <ChevronDown className="h-4 w-4 text-white/60" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          align="start" 
          alignOffset={-4}
          className="w-[180px] p-1 bg-[rgba(255,255,255,0.06)] backdrop-blur-md border border-white/10"
        >
          <div className="flex flex-col">
            {availableChains.map(chain => {
              const logo = chainLogoMap[chain];
              const isSelected = chain === selectedChain;
              
              return (
                <button
                  key={chain}
                  onClick={() => handleChainSelect(chain)}
                  className="flex items-center justify-between px-3 py-2 text-sm text-white hover:bg-white/10 rounded-md transition-colors"
                >
                  <span className="flex items-center gap-2">
                    {logo && (
                      <img src={logo} alt={chain} className="h-5 w-5" />
                    )}
                    {chain}
                  </span>
                  {isSelected && (
                    <Check className="h-4 w-4 text-white" />
                  )}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default HeaderActions;