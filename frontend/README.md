# Pool Explorer

![Graph View of the application](./graphview.png "Title")

Pool Explorer is a local user interface designed to explore Decentralized Exchange (DEX) pools. It provides low-latency access to comprehensive and trustlessly reliable data, making on-chain liquidity easy to observe and explore. With Pool Explorer, you can filter for specific pools and visually explore the entire set of DEX pools, enabling better decision-making for traders, DEXs, and protocols.

# Quick Start

To get started with Pool Explorer, follow these steps:

* Install bun: https://bun.sh/docs/installation
* You need to first get the tycho websocket api server running https://github.com/ex9-fyi/tycho-api
* You then start this application

```bash
# Build first
bun run build

# Then run the production build
bun run preview
```

# Environment variables

Use `.env` to configure e.g. the websocket server url that this app uses to fetch pool data.

# Mobile

The app is made to be mobile friendly but as it stands there are UI quirks with Chrome. It works well on Firefox.

# Logo loading

This is using Coingecko **free and public** APIs. The good thing is no one needs an API key. So the app loads token logos 15 seconds at a tiem and saves them on your browser for the future. Please be patient. 

# Quick developement setup

```
chmod +x ./start.sh
./start.sh --parallel
```

This is an non-optimized build.

