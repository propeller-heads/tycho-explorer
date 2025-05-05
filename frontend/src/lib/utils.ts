import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatPoolId = (id: string): string => {
  if (!id) return '';
  if (id.length <= 10) return id;
  return `${id.substring(0, 6)}...${id.substring(id.length - 4)}`;
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