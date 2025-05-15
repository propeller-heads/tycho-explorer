// src/lib/poolUtils.ts
import { Pool } from '@/components/dexscan/types';

// Helper to parse hex fee value to percentage
export const parseFeeHexValue = (pool: Pool, feeHex: string | undefined): number => {
  if (!feeHex) return 0;
  
  // Convert hex to decimal
  const feeDecimal = parseInt(feeHex, 16);
  
  // Handle protocol-specific fee formats
  if (pool.protocol_system === 'uniswap_v2') {
    // For uniswap_v2, fee is in basis points, so divide by 100
    return isNaN(feeDecimal) ? 0 : feeDecimal / 100;
  } else if (pool.protocol_system === 'vm:balancer_v2') {
    // For balancer_v2, fee is in 1e18 format, convert to percentage
    return isNaN(feeDecimal) ? 0 : (feeDecimal / 1e18) * 100;
  }
  
  // For other protocols (uniswap_v3 and uniswap_v4)
  // pools have fees in unit of basis point scaled by 100x
  // Uniswap V3 example: fee = 3000 -> 0.3%
  // Uniswap V4 example: key_lp_fee is also in this format
  const feeValue = feeDecimal / 10000;
  return isNaN(feeValue) ? 0 : feeValue;
};

// Extract fee parsing logic into a reusable function that handles different protocols
export const parsePoolFee = (pool: Pool): number => {
  // Special case for Uniswap V4 pools using 'key_lp_fee'
  if (pool.protocol_system === 'uniswap_v4' && pool.static_attributes['key_lp_fee' as keyof typeof pool.static_attributes]) {
    return parseFeeHexValue(pool, pool.static_attributes['key_lp_fee' as keyof typeof pool.static_attributes]);
  }
  
  // Regular case for other protocols using 'fee'
  return parseFeeHexValue(pool, pool.static_attributes?.fee);
};
