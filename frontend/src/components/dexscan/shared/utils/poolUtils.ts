// src/lib/poolUtils.ts
import { Pool } from '@/components/dexscan/app/types';

// Helper to parse hex fee value to percentage
export const parseFeeHexValue = (pool: Pool, feeHex: string | undefined): number | null => {
  if (!feeHex) return null;
  
  // Convert hex to decimal
  const feeDecimal = parseInt(feeHex, 16);
  
  if (isNaN(feeDecimal)) return null;
  
  let feePercentage: number;
  
  // Handle protocol-specific fee formats
  if (pool.protocol_system === 'uniswap_v2') {
    // For uniswap_v2, fee is in basis points, so divide by 100
    feePercentage = feeDecimal / 100;
  } else if (pool.protocol_system === 'vm:balancer_v2') {
    // For balancer_v2, fee is in 1e18 format, convert to percentage
    feePercentage = (feeDecimal / 1e18) * 100;
  } else if (pool.protocol_system === 'ekubo_v2') {
    // For ekubo_v2, fee appears to be in a high precision format
    // Example: 0x000346dc5d638865 = 922337203685477
    // This seems to be fee * 1e18, so we divide by 1e16 to get percentage
    feePercentage = feeDecimal / 1e16;
  } else {
    // For other protocols (uniswap_v3 and uniswap_v4)
    // pools have fees in unit of basis point scaled by 100x
    // Uniswap V3 example: fee = 3000 -> 0.3%
    // Uniswap V4 example: key_lp_fee is also in this format
    feePercentage = feeDecimal / 10000;
  }
  
  // Limit to 4 decimal places maximum
  return Math.round(feePercentage * 10000) / 10000;
};

// Extract fee parsing logic into a reusable function that handles different protocols
export const parsePoolFee = (pool: Pool): number | null => {
  // Special case for Uniswap V4 pools using 'key_lp_fee'
  if (pool.protocol_system === 'uniswap_v4' && pool.static_attributes['key_lp_fee' as keyof typeof pool.static_attributes]) {
    return parseFeeHexValue(pool, pool.static_attributes['key_lp_fee' as keyof typeof pool.static_attributes]);
  }
  
  // Regular case for other protocols using 'fee'
  return parseFeeHexValue(pool, pool.static_attributes?.fee);
};
