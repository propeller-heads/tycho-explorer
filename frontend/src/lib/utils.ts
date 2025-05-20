import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Renders a hex ID (like a pool address or token address) in a shortened format.
// Example: 0xabcdef1234567890 -> 0xabcd...7890
export const renderHexId = (id: string): string => {
  if (!id) return '';
  // Assuming 0x prefix, we want 0x + 4 chars + ... + 4 chars
  // 0x (2) + first 4 (4) + ... (3) + last 4 (4) = 13 characters minimum for abbreviation
  if (id.length <= 10) return id; // Handles cases like "0x" + 8 chars or less, too short to abbreviate this way
  return `${id.substring(0, 6)}...${id.substring(id.length - 4)}`; // 0x + first 4 chars, ..., last 4 chars
};

// Generates an external link for a given pool based on its protocol.
export const getExternalLink = (pool: { protocol_system: string; id: string }): string | null => {
  // Destructure protocol_system from the pool object for easier access.
  const protocol = pool.protocol_system;

  // Handle Uniswap protocols (v2, v3, v4).
  if (['uniswap_v2', 'uniswap_v3', 'uniswap_v4'].includes(protocol)) {
    return `https://app.uniswap.org/explore/pools/ethereum/${pool.id}`;
  }
  // Handle Balancer v2 protocol.
  else if (protocol === 'vm:balancer_v2') {
    return `https://balancer.fi/pools/ethereum/v2/${pool.id}`;
  }
  // Handle PancakeSwap v3 protocol.
  else if (protocol === 'pancakeswap_v3') {
    return `https://pancakeswap.finance/info/v3/eth/pairs/${pool.id}`;
  }
  // Handle PancakeSwap v2 protocol.
  else if (protocol === 'pancakeswap_v2') {
    return `https://pancakeswap.finance/info/eth/pairs/${pool.id}`;
  }
  // Return null if no specific link is configured for the protocol.
  return null;
};
