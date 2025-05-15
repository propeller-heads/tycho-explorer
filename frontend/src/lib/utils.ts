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

export const getExternalLink = (pool: { protocol_system: string; id: string }): string | null => {
  const protocol = pool.protocol_system;
  if (['uniswap_v2', 'uniswap_v3', 'uniswap_v4'].includes(protocol)) {
    return `https://app.uniswap.org/explore/pools/ethereum/${pool.id}`;
  } else if (protocol === 'vm:balancer_v2') {
    return `https://balancer.fi/pools/ethereum/v2/${pool.id}`;
  }
  return null; // No link for other protocols
};
