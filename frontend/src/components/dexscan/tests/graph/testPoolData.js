// Comprehensive test pool data for testing all scenarios
export const testPools = {
  // Uniswap V3 pools
  '0x1234567890abcdef1234567890abcdef12345678': {
    id: '0x1234567890abcdef1234567890abcdef12345678',
    protocol_system: 'uniswap_v3',
    tokens: [
      { address: '0x1', symbol: 'ETH' },
      { address: '0x2', symbol: 'USDC' }
    ],
    fee: '3000',
    updatedAt: new Date().toISOString(),
    lastUpdatedAtBlock: 18500000  // Current block - should highlight
  },
  
  // Another Uniswap V3 pool with same tokens (parallel edge)
  '0x2345678901bcdef2345678901bcdef23456789': {
    id: '0x2345678901bcdef2345678901bcdef23456789',
    protocol_system: 'uniswap_v3',
    tokens: [
      { address: '0x1', symbol: 'ETH' },
      { address: '0x2', symbol: 'USDC' }
    ],
    fee: '500',
    updatedAt: new Date().toISOString(),
    lastUpdatedAtBlock: 18499999
  },
  
  // Curve pool
  '0xabcdef1234567890abcdef1234567890abcdef12': {
    id: '0xabcdef1234567890abcdef1234567890abcdef12',
    protocol_system: 'vm:curve',
    tokens: [
      { address: '0x2', symbol: 'USDC' },
      { address: '0x3', symbol: 'DAI' }
    ],
    fee: '100',
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    lastUpdatedAtBlock: 18499950
  },
  
  // Balancer V2 pool
  '0x567890abcdef1234567890abcdef1234567890ab': {
    id: '0x567890abcdef1234567890abcdef1234567890ab',
    protocol_system: 'vm:balancer_v2',
    tokens: [
      { address: '0x1', symbol: 'ETH' },
      { address: '0x4', symbol: 'WBTC' }
    ],
    fee: '1000',
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
    lastUpdatedAtBlock: 18499900
  },
  
  // Multi-token Balancer pool
  '0x678901bcdef2345678901bcdef2345678901bcde': {
    id: '0x678901bcdef2345678901bcdef2345678901bcde',
    protocol_system: 'vm:balancer_v2',
    tokens: [
      { address: '0x1', symbol: 'ETH' },
      { address: '0x2', symbol: 'USDC' },
      { address: '0x3', symbol: 'DAI' }
    ],
    fee: '300',
    updatedAt: new Date().toISOString(),
    lastUpdatedAtBlock: 18500000  // Current block
  },
  
  // Uniswap V2 pool
  '0x789012cdef3456789012cdef3456789012cdef34': {
    id: '0x789012cdef3456789012cdef3456789012cdef34',
    protocol_system: 'uniswap_v2',
    tokens: [
      { address: '0x3', symbol: 'DAI' },
      { address: '0x4', symbol: 'WBTC' }
    ],
    fee: '3000',
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
    lastUpdatedAtBlock: 18499975
  },
  
  // Pool with token that has no logo (for testing API fallback)
  '0x890123def4567890123def4567890123def45678': {
    id: '0x890123def4567890123def4567890123def45678',
    protocol_system: 'uniswap_v3',
    tokens: [
      { address: '0x2', symbol: 'USDC' },
      { address: '0x5', symbol: 'RARE' }
    ],
    fee: '10000',
    updatedAt: new Date().toISOString(),
    lastUpdatedAtBlock: 18499980
  },
  
  // Another parallel edge case
  '0x901234ef5678901234ef5678901234ef56789012': {
    id: '0x901234ef5678901234ef5678901234ef56789012',
    protocol_system: 'vm:curve',
    tokens: [
      { address: '0x1', symbol: 'ETH' },
      { address: '0x2', symbol: 'USDC' }
    ],
    fee: '50',
    updatedAt: new Date().toISOString(),
    lastUpdatedAtBlock: 18499990
  },
  
  // Fourth ETH-USDC pool (Sushiswap V2)
  '0xa01234567890abcdefa01234567890abcdefa012': {
    id: '0xa01234567890abcdefa01234567890abcdefa012',
    protocol_system: 'sushiswap_v2',
    tokens: [
      { address: '0x1', symbol: 'ETH' },
      { address: '0x2', symbol: 'USDC' }
    ],
    fee: '3000',
    updatedAt: new Date().toISOString(),
    lastUpdatedAtBlock: 18499985
  },
  
  // Fifth ETH-USDC pool (Pancakeswap V3)
  '0xb12345678901abcdefb12345678901abcdefb123': {
    id: '0xb12345678901abcdefb12345678901abcdefb123',
    protocol_system: 'pancakeswap_v3',
    tokens: [
      { address: '0x1', symbol: 'ETH' },
      { address: '0x2', symbol: 'USDC' }
    ],
    fee: '2500',
    updatedAt: new Date().toISOString(),
    lastUpdatedAtBlock: 18499982
  }
};