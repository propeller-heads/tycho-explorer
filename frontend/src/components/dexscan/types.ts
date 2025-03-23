// Types
export interface WebSocketPool {
  id: string;
  tokens: Array<{
    address: string;
    decimals: number;
    symbol: string;
    gas: number[];
  }>;
  protocol_system: string;
  static_attributes: {
    fee: string;
  };
  created_at: string;
}

export interface Pool extends WebSocketPool {
  spotPrice: number;
}

export interface PoolInfo {
  address: string;
  tvl: number;
  protocol: string;
  lastTradeTimestamp: string;
} 