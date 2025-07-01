// Test data for NetworkManager testing

export const testNodes = [
  {
    id: '0x1',
    label: 'ETH',
    shape: 'circularImage',
    image: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
    size: 32,
    font: { size: 16 }
  },
  {
    id: '0x2',
    label: 'USDC',
    shape: 'circularImage', 
    image: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png',
    size: 32,
    font: { size: 16 }
  },
  {
    id: '0x3',
    label: 'DAI',
    shape: 'circularImage',
    image: 'https://assets.coingecko.com/coins/images/9956/small/4943.png',
    size: 32,
    font: { size: 16 }
  }
];

export const testEdges = [
  {
    id: 'e1',
    from: '0x1',
    to: '0x2',
    color: '#FF3366',
    width: 2,
    smooth: { enabled: true, type: 'continuous', roundness: 0.05 }
  },
  {
    id: 'e2', 
    from: '0x2',
    to: '0x3',
    color: '#00D4FF',
    width: 2,
    smooth: { enabled: true, type: 'continuous', roundness: 0.05 }
  }
];

// Additional nodes/edges for testing updates
export const newNode = {
  id: '0x4',
  label: 'WBTC',
  shape: 'circularImage',
  image: 'https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png',
  size: 32,
  font: { size: 16 }
};

export const newEdge = {
  id: 'e3',
  from: '0x1',
  to: '0x4',
  color: '#9333EA',
  width: 3,
  smooth: { enabled: true, type: 'curvedCW', roundness: 0.2 }
};
