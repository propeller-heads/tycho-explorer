// Generates an external link for a given pool based on its protocol and chain.
export const getExternalLink = (pool: { protocol_system: string; id: string }, chain: string): string | null => {
  // Destructure protocol_system from the pool object for easier access.
  const protocol = pool.protocol_system;
  const poolId = pool.id;
  
  // Normalize chain name to lowercase for consistent matching
  const chainLower = chain.toLowerCase();

  // Handle Uniswap protocols (v2, v3, v4).
  if (['uniswap_v2', 'uniswap_v3', 'uniswap_v4'].includes(protocol)) {
    return `https://app.uniswap.org/explore/pools/${chainLower}/${poolId}`;
  }
  // Handle Balancer v2 protocol.
  else if (protocol === 'vm:balancer_v2') {
    // Map chain names to Balancer's expected format
    const balancerChain = chainLower === 'ethereum' ? 'ethereum' : chainLower;
    return `https://balancer.fi/pools/${balancerChain}/v2/${poolId}`;
  }
  // Handle PancakeSwap v3 protocol.
  else if (protocol === 'pancakeswap_v3') {
    // Map chain names to PancakeSwap's expected format
    const pancakeChain = chainLower === 'ethereum' ? 'eth' : chainLower;
    return `https://pancakeswap.finance/info/v3/${pancakeChain}/pairs/${poolId}`;
  }
  // Handle PancakeSwap v2 protocol.
  else if (protocol === 'pancakeswap_v2') {
    // Map chain names to PancakeSwap's expected format
    const pancakeChain = chainLower === 'ethereum' ? 'eth' : chainLower;
    return `https://pancakeswap.finance/info/${pancakeChain}/pairs/${poolId}`;
  }
  // Fallback to block explorer for unknown protocols
  // Use getTokenExplorerLink but replace /token/ with /address/ for contract addresses
  return getTokenExplorerLink(poolId, chain).replace('/token/', '/address/');
};

// Generates a block explorer link for a given token based on the chain.
export const getTokenExplorerLink = (tokenAddress: string, chain: string): string => {
  // Normalize chain name to lowercase for consistent matching
  const chainLower = chain.toLowerCase();
  
  switch (chainLower) {
    case 'base':
      return `https://basescan.org/token/${tokenAddress}`;
    case 'unichain':
      return `https://unichain.blockscout.com/token/${tokenAddress}`;
    case 'ethereum':
    default:
      return `https://etherscan.io/token/${tokenAddress}`;
  }
};