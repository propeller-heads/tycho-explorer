// Mock pool data for testing tooltips (additional pools for testing)
export const mockPools = {
  // Additional test pool with different ID to avoid collision
  '0xfedcba0987654321fedcba0987654321fedcba': {
    id: '0xfedcba0987654321fedcba0987654321fedcba',
    protocol_system: 'uniswap_v3',
    tokens: [
      { address: '0x6', symbol: 'LINK' },
      { address: '0x7', symbol: 'AAVE' }
    ],
    fee: '3000',
    updatedAt: new Date().toISOString(),
    lastUpdatedAtBlock: 18500000
  },
  '0xdef0123456789abcdef0123456789abcdef0123': {
    id: '0xdef0123456789abcdef0123456789abcdef0123',
    protocol_system: 'vm:curve',
    tokens: [
      { address: '0x8', symbol: 'FRAX' },
      { address: '0x9', symbol: 'USDT' }
    ],
    fee: '100',
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    lastUpdatedAtBlock: 18499950
  },
  '0xabc4567890123defabc4567890123defabc4567': {
    id: '0xabc4567890123defabc4567890123defabc4567',
    protocol_system: 'vm:balancer_v2',
    tokens: [
      { address: '0xa', symbol: 'BAL' },
      { address: '0xb', symbol: 'GNO' }
    ],
    fee: '1000',
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
    lastUpdatedAtBlock: 18499900
  }
};

// Map edges to pools (no longer needed with direct pool ID lookup)
export const edgePoolMap = {};