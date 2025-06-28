// Mock pool data for testing tooltips
export const mockPools = {
  'pool1': {
    id: '0x1234567890abcdef1234567890abcdef12345678',
    protocol_system: 'uniswap_v3',
    tokens: [
      { address: '0x1', symbol: 'ETH' },
      { address: '0x2', symbol: 'USDC' }
    ],
    fee: '3000',
    updatedAt: new Date().toISOString(),
    lastUpdatedAtBlock: 18500000
  },
  'pool2': {
    id: '0xabcdef1234567890abcdef1234567890abcdef12',
    protocol_system: 'curve',
    tokens: [
      { address: '0x2', symbol: 'USDC' },
      { address: '0x3', symbol: 'DAI' }
    ],
    fee: '100',
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    lastUpdatedAtBlock: 18499950
  },
  'pool3': {
    id: '0x567890abcdef1234567890abcdef1234567890ab',
    protocol_system: 'balancer_v2',
    tokens: [
      { address: '0x1', symbol: 'ETH' },
      { address: '0x4', symbol: 'WBTC' }
    ],
    fee: '1000',
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
    lastUpdatedAtBlock: 18499900
  }
};

// Map edges to pools
export const edgePoolMap = {
  'e1': 'pool1',
  'e2': 'pool2',
  'e3': 'pool3'
};