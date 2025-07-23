# Tycho Explorer Architecture

## 1. What Tycho Explorer Does

Tycho Explorer shows users live data about DEX pools. Users can see which pools exist and get price quotes for token swaps. The app updates in real-time as trades happen on the blockchain.

## 2. Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Frontend (React)                            │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Views: PoolList.tsx, NetworkGraph.tsx, SwapInterface.tsx   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  State: useWebSocket.ts, usePools.ts, FilterContext.tsx     │   │
│  └─────────────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────────┘
                            │ WebSocket + HTTP
┌───────────────────────────┴─────────────────────────────────────────┐
│                         Backend (Rust)                               │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  API: ws.rs (WebSocket), pools.rs, simulation.rs            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Cache: Pool state, Route finder, Price calculator          │   │
│  └─────────────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────────┘
                            │ Tycho SDK
┌───────────────────────────┴─────────────────────────────────────────┐
│              Blockchains: Ethereum, Base, Unichain                  │
└─────────────────────────────────────────────────────────────────────┘
```

## 3. When There Is a New Block

```
Blockchain                    Backend                         Frontend
    │                            │                               │
    │ New Block                  │                               │
    │ Pool State Change          │                               │
    ├──────────────────────────> │                               │
    │                            │                               │
    │                     Tycho SDK receives:                    │
    │                     • Pool address                         │
    │                     • Token balances                       │
    │                     • Block number                          │
    │                            │                               │
    │                     ws.rs processes event                  │
    │                     pools.rs updates cache                 │
    │                            │                               │
    │                            │ WebSocket broadcast:          │
    │                            │ {                             │
    │                            │   pool: "0x123...",          │
    │                            │   token0Amount: "1000",      │
    │                            │   token1Amount: "2000",      │
    │                            │   timestamp: 1234567890       │
    │                            │ }                             │
    │                            ├─────────────────────────────> │
    │                            │                               │
    │                            │              useWebSocket.ts parses
    │                            │              usePools.ts updates Map
    │                            │                               │
    │                            │              PoolList.tsx rerenders
    │                            │              NetworkGraph.tsx updates nodes
```

**Data flow**: Raw blockchain events → Structured pool updates → UI changes

## 4. When User Gets a Swap Quote

```
Frontend                      Backend                      Blockchain Data
    │                            │                               │
User enters amount               │                               │
in SwapInterface.tsx             │                               │
    │                            │                               │
    │ HTTP POST /api/simulate    │                               │
    │ {                          │                               │
    │   tokenIn: "0xA0b8...",   │                               │
    │   tokenOut: "0x6B17...",  │                               │
    │   amountIn: "1000000",    │                               │
    │   slippage: 0.5           │                               │
    │ }                          │                               │
    ├──────────────────────────> │                               │
    │                            │                               │
    │                     simulation.rs receives                 │
    │                            │                               │
    │                     Check pool cache <─────────────────────┤
    │                     Find all paths:                        │
    │                     • Direct: A→B                          │
    │                     • 2-hop: A→C→B                        │
    │                     • 3-hop: A→C→D→B                      │
    │                            │                               │
    │                     Calculate for each path:               │
    │                     • Output amount                        │
    │                     • Price impact                         │
    │                     • Gas estimate                         │
    │                            │                               │
    │ Response:                  │                               │
    │ {                          │                               │
    │   routes: [{               │                               │
    │     path: ["A","C","B"],   │                               │
    │     amountOut: "1845",     │                               │
    │     priceImpact: 0.3       │                               │
    │   }]                       │                               │
    │ }                          │                               │
    │ <──────────────────────────┤                               │
    │                            │                               │
SwapInterface.tsx                │                               │
displays results                 │                               │
```

**Data flow**: User input → Route calculation → Best path selection → Quote display

---