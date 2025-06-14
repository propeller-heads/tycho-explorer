export const protocolReadable: { [key: string]: string } = {
  'uniswap_v2': 'Uniswap V2',
  'uniswap_v3': 'Uniswap V3',
  'uniswap_v4': 'Uniswap V4',
  'vm:curve': 'Curve',
  'sushiswap_v2': 'SushiSwap V2',
  'pancakeswap_v2': 'PancakeSwap V2',
  'pancakeswap_v3': 'PancakeSwap V3',
  'ekubo_v2': 'Ekubo V2',
};

// Helper function to get readable name with fallback
export const getReadableProtocolName = (protocolId: string): string => {
  return protocolReadable[protocolId] || protocolId;
};