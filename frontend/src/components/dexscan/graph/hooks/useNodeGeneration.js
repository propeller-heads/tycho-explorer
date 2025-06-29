import { useMemo } from 'react';
import { getTokenLogoUrlSync } from '@/hooks/useTokenLogo';

// Default gray circle SVG for nodes without logos
const DEFAULT_NODE_IMAGE = 'data:image/svg+xml;base64,' + btoa(
  '<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">' +
  '<circle cx="16" cy="16" r="16" fill="#D3D3D3"/></svg>'
);

/**
 * Generate vis-network nodes from filtered pools
 */
export function useNodeGeneration(filteredPools, apiLogos) {
  return useMemo(() => {
    const tokenMap = new Map();
    
    // Build unique tokens from filtered pools
    filteredPools.forEach(pool => {
      pool.tokens.forEach(token => {
        if (!tokenMap.has(token.address)) {
          tokenMap.set(token.address, {
            id: token.address,
            label: token.symbol,
            symbol: token.symbol,
            address: token.address
          });
        }
      });
    });

    // Convert to nodes array with logos
    return Array.from(tokenMap.values()).map(node => ({
      ...node,
      shape: 'circularImage',
      image: getTokenLogoUrlSync(node.symbol) || apiLogos[node.address] || DEFAULT_NODE_IMAGE,
      brokenImage: DEFAULT_NODE_IMAGE,
      size: 32,
      font: { size: 16 }
    }));
  }, [filteredPools, apiLogos]);
}