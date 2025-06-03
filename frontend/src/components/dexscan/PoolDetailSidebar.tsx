import React from 'react';
import { Pool, Token } from './types';
import SwapSimulator from './SwapSimulator'; // Import the refactored SwapSimulator
import { LucideX, ExternalLink } from 'lucide-react';
import { cn, renderHexId, getExternalLink } from '@/lib/utils';
import { usePoolData } from './context/PoolDataContext';

interface PoolDetailSidebarProps {
  pool: Pool | null;
  onClose: () => void;
}

const PoolDetailSidebar: React.FC<PoolDetailSidebarProps> = ({ pool, onClose }) => {
  const { selectedChain } = usePoolData();
  
  if (!pool) {
    return null;
  }

  const poolTokensText = pool.tokens.map(t => t.symbol).join(' / ');
  const poolExternalLink = getExternalLink(pool, selectedChain);

  console.log("sidebar: ", pool);
  return (
    <div 
      className={cn(
        "fixed top-0 right-0 h-full w-[435px] z-50 flex flex-col",
        "bg-[rgba(255,255,255,0.01)] backdrop-blur-[200px]", // Closer to Figma spec
        "border-l border-[rgba(255,255,255,0.06)]", // Closer to Figma spec
        "shadow-[-16px_0px_36px_0px_rgba(24,10,52,1)]" // Using arbitrary value for shadow
      )}
    >
      {/* Header Section */}
      <div className="flex items-start justify-between p-6 pb-4 border-b border-[rgba(255,255,255,0.1)]"> {/* Adjusted border color */}
        <div className="flex-grow min-w-0"> {/* Added min-w-0 for better truncation */}
          <h2 className="text-xl font-bold text-[#FFFFFF] truncate" title={poolTokensText}> {/* Figma text color */}
            {poolTokensText}
          </h2>
          <div className="flex items-center text-xs text-[rgba(255,255,255,0.64)] mt-1"> {/* Figma text color & opacity */}
            <span className="truncate">{pool.protocol_system}</span>
            <span className="mx-1.5">•</span>
            <span className="font-mono truncate">{renderHexId(pool.id)}</span>
            {poolExternalLink && (
              <a
                href={poolExternalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1.5 text-[rgba(255,255,255,0.64)] hover:text-[#FFFFFF]"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="p-1 text-[rgba(255,255,255,0.7)] hover:text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-md shrink-0" // Adjusted colors
          aria-label="Close pool details"
        >
          <LucideX className="h-5 w-5" />
        </button>
      </div>

      {/* Tabs Section - Only "Quote simulation" as per plan */}
      <div className="px-6 pt-4 border-b border-[rgba(255,255,255,0.1)]"> {/* Adjusted border color */}
        <div
          className="inline-block py-3 px-1 text-base font-semibold text-[#FFFFFF] border-b-2 border-purple-500" // Figma text color
        >
          Quote simulation
        </div>
        {/* "Liquidity curve" tab is omitted */}
      </div>

      {/* Content Area - Swap Simulator */}
      <div className="flex-grow p-6 overflow-y-auto"> {/* Added scrollbar styling for webkit */}
        <SwapSimulator
          poolId={pool.id}
          tokens={pool.tokens as Token[]}
          fee={pool.static_attributes.fee}
          pool={pool}
        />
      </div>
    </div>
  );
};

export default PoolDetailSidebar;
