// Types
export interface Token {
  address: string;
  decimals: number;
  symbol: string;
  name?: string; // Adding name as it's used in TokenForFilter
  gas?: number[]; // Optional as it's not always used directly
  logoURI?: string; // Optional, for client-side enrichment
}

export interface WebSocketPool {
  id: string;
  tokens: Token[]; // Use the new Token interface
  protocol_system: string;
  static_attributes: {
    fee: string;
  };
  created_at: string;
}

export interface Pool extends WebSocketPool {
  spotPrice: number;
  updatedAt: string;
  lastUpdatedAtBlock: number;
}
