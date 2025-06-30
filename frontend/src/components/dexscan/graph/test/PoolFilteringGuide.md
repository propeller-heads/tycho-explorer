# Pool Filtering Logic Guide

## Key Concept
Selected tokens must be a **superset** of pool tokens for the pool to be included.
In other words: A pool is shown only if ALL its tokens are selected.

## Test Pool Summary

### Pool 1: Uniswap V3 (ETH-USDC)
- Tokens: ETH, USDC
- Shows when: ETH AND USDC selected

### Pool 2: Uniswap V3 (ETH-USDC) 
- Tokens: ETH, USDC
- Shows when: ETH AND USDC selected
- Note: Parallel edge with Pool 1

### Pool 3: vm:curve (USDC-DAI)
- Tokens: USDC, DAI
- Shows when: USDC AND DAI selected

### Pool 4: vm:balancer_v2 (ETH-WBTC)
- Tokens: ETH, WBTC
- Shows when: ETH AND WBTC selected

### Pool 5: vm:balancer_v2 (ETH-USDC-DAI)
- Tokens: ETH, USDC, DAI
- Shows when: ETH AND USDC AND DAI selected

### Pool 6: Uniswap V2 (DAI-WBTC)
- Tokens: DAI, WBTC
- Shows when: DAI AND WBTC selected

### Pool 7: Uniswap V3 (USDC-RARE)
- Tokens: USDC, RARE
- Shows when: USDC AND RARE selected

### Pool 8: vm:curve (ETH-USDC)
- Tokens: ETH, USDC
- Shows when: ETH AND USDC selected
- Note: Third parallel edge with Pools 1 & 2

### Pool 9: sushiswap_v2 (ETH-USDC)
- Tokens: ETH, USDC
- Shows when: ETH AND USDC selected
- Note: Fourth parallel edge

### Pool 10: pancakeswap_v3 (ETH-USDC)
- Tokens: ETH, USDC
- Shows when: ETH AND USDC selected
- Note: Fifth parallel edge

## Expected Results by Selection

| Selected Tokens | Pools Shown | Count |
|----------------|-------------|-------|
| None | None | 0 |
| ETH only | None | 0 |
| USDC only | None | 0 |
| DAI only | None | 0 |
| ETH + USDC | Pools 1, 2, 8, 9, 10 | 5 |
| ETH + DAI | None | 0 |
| ETH + WBTC | Pool 4 | 1 |
| USDC + DAI | Pool 3 | 1 |
| DAI + WBTC | Pool 6 | 1 |
| ETH + USDC + DAI | Pools 1, 2, 3, 5, 8, 9, 10 | 7 |
| All tokens | All pools | 10 |

## Protocol Filtering
When protocols are deselected, the pools remain but edges turn gray (unselected color).