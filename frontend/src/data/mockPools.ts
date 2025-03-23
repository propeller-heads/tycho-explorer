// Sample pool data for development and testing
export const mockPools = [
  {
    address: "0x",
    id: "0xa91f80380d9cc9c86eb98d2965a0ded9e200beef",
    tokens: [
      {
        address: "0x68749665ff8d2d112fa859aa293f07a622782f38",
        decimals: 6,
        symbol: "XAUt",
        gas: [39551]
      },
      {
        address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
        decimals: 6,
        symbol: "USDT",
        gas: [34601]
      }
    ],
    protocol_system: "uniswap_v3",
    protocol_type_name: "uniswap_v3_pool",
    chain: "ethereum",
    contract_ids: [],
    static_attributes: {
      pool_address: "0xa91f80380d9cc9c86eb98d2965a0ded9e200beef",
      fee: "0x0bb8",
      tick_spacing: "0x3c"
    },
    creation_tx: "0x92940fe4a339cde88fa5bfe5fcac7568063fe23f548c66c248fefd4c729d9e10",
    created_at: "2022-07-09T19:55:19",
    tvl: 1000000,
    spot_price: "3245.89"
  },
  {
    address: "0x",
    id: "0x7d2768de32b0b80b7a3454c06bdac94a69ddbeef",
    tokens: [
      {
        address: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
        decimals: 18,
        symbol: "WETH",
        gas: [30000]
      },
      {
        address: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
        decimals: 6,
        symbol: "USDC",
        gas: [30000]
      }
    ],
    protocol_system: "uniswap_v3",
    protocol_type_name: "uniswap_v3_pool",
    chain: "ethereum",
    contract_ids: [],
    static_attributes: {
      pool_address: "0x7d2768de32b0b80b7a3454c06bdac94a69ddbeef",
      fee: "0x0bb8",
      tick_spacing: "0x3c"
    },
    creation_tx: "0x" + "0".repeat(64),
    created_at: "2022-07-09T19:55:19",
    tvl: 5000000,
    spot_price: "1875.23"
  },
  {
    address: "0x",
    id: "0x6b175474e89094c44da98b954eedeac49527beef",
    tokens: [
      {
        address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
        decimals: 18,
        symbol: "mETH",
        gas: [30000]
      },
      {
        address: "0x514910771af9ca656af844b4ce37794c6fed0b6b",
        decimals: 6,
        symbol: "USDT",
        gas: [30000]
      }
    ],
    protocol_system: "uniswap_v3",
    protocol_type_name: "uniswap_v3_pool",
    chain: "ethereum",
    contract_ids: [],
    static_attributes: {
      pool_address: "0x6b175474e89094c44da98b954eedeac49527beef",
      fee: "0x0bb8",
      tick_spacing: "0x3c"
    },
    creation_tx: "0x" + "0".repeat(64),
    created_at: "2022-07-09T19:55:19",
    tvl: 3000000,
    spot_price: "1875.12"
  }
];

export default mockPools;
