import { Pool } from '../graph/types';

export const enhancePoolsWithMockData = (pools: any[]): Pool[] => {
  return pools.map(pool => ({
    ...pool,
    token0: pool.token0 || pool.token1,
    token0Symbol: pool.token0Symbol || pool.token1,
    token1Symbol: pool.token1Symbol || pool.token2 || pool.token1
  }));
};

export const getUniqueProtocols = (pools: Pool[]): string[] => {
  const protocols = new Set<string>();
  pools.forEach(pool => {
    if (pool.protocol_system) {
      protocols.add(pool.protocol_system);
    }
  });
  return Array.from(protocols).sort();
};

export const calculateOverallMetrics = (pools: Pool[], protocols: string[]) => {
  return {
    totalPools: pools.length,
    totalProtocols: protocols.length
  };
};

export const calculateFilteredMetrics = (filteredPools: Pool[]) => {
  const protocols = getUniqueProtocols(filteredPools);
  return {
    totalPools: filteredPools.length,
    totalProtocols: protocols.length
  };
};

// Adding formatting utilities
export const formatTVL = (value: number): string => {
  if (value === undefined || value === null) return '$0';
  
  if (value === 0) return '$0';
  
  if (value < 1000) {
    return `$${Math.round(value)}`;
  } else if (value < 1000000) {
    return `$${(value / 1000).toFixed(1)}K`;
  } else if (value < 1000000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else {
    return `$${(value / 1000000000).toFixed(1)}B`;
  }
};

export const formatPoolId = (id: string): string => {
  if (!id) return '';
  if (id.length <= 10) return id;
  return `${id.substring(0, 6)}...${id.substring(id.length - 4)}`;
};

export const formatFeeRate = (rate: any): string => {
  if (rate === undefined || rate === null) return '0%';
  return `${Number(rate).toFixed(2)}%`;
};

export const formatPriceChange = (change: any): { value: string, className: string } => {
  if (change === undefined || change === null) return { value: '0%', className: '' };
  
  const numChange = Number(change);
  const value = `${numChange > 0 ? '+' : ''}${numChange.toFixed(2)}%`;
  const className = numChange > 0 
    ? 'text-green-600' 
    : numChange < 0 
      ? 'text-red-600' 
      : '';
      
  return { value, className };
};
