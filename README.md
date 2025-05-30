# Tycho Explorer

A real-time DeFi pool explorer and swap simulator powered by the Tycho protocol.

## Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd tycho-explorer

# Set up environment files
cp .env.example .env        # Production config
cp .env.example .env.dev    # Development config
# Edit both files with your API keys

# Start development environment (TVL parameter is required!)
make up DEV=1 TVL=30

# Or start specific service without dependencies
make up DEV=1 SERVICE=frontend DEPS=0
```

## ⚠️ Known Issues

### Frontend Access on macOS
On macOS, `localhost:5173` may not work due to IPv6/IPv4 issues with Vite. Use `http://127.0.0.1:5173` instead.

### Required Parameters
- **TVL is REQUIRED** for API services - there are NO DEFAULT VALUES by design
- Example: `make up DEV=1 TVL=30` (not just `make up DEV=1`)

## Project Structure

```
tycho-explorer/
├── api/                # Rust backend API
├── frontend/          # React frontend application  
├── docs/              # Project documentation
├── docker-compose.yml # Production configuration
├── docker-compose.dev.yml # Development configuration
├── Makefile          # Convenience commands
└── .env              # Environment configuration
```

## Services

- **API (Rust)**: Real-time pool data streaming from Tycho protocol
  - Ethereum: http://localhost:3001 (prod) / 4001 (dev)
  - Base: http://localhost:3002 (prod) / 4002 (dev)
  - Unichain: http://localhost:3003 (prod) / 4003 (dev)

- **Frontend (React)**: Interactive pool explorer and swap simulator
  - Production: http://localhost:8080
  - Development: http://127.0.0.1:5173 (use IP instead of localhost on macOS)

## Development

### Makefile Commands

```bash
# Start all services in development mode (TVL required for APIs)
make up DEV=1 TVL=30

# Start specific service
make up DEV=1 SERVICE=frontend DEPS=0
make up DEV=1 TVL=30 SERVICE=tycho-api-ethereum

# Build services
make build DEV=1 SERVICE=frontend

# View logs
make logs SERVICE=frontend

# Stop services
make down

# Clean everything (volumes, images, cache)
make clean

# Show help
make help
```

### Parameters
- `DEV=1` - Use development mode (hot reload, debug logging)
- `TVL=value` - TVL threshold in millions (REQUIRED for API services)
- `SERVICE=name` - Target specific service
- `BUILD=1` - Rebuild before starting
- `DEPS=0` - Start without dependencies

## Documentation

See the `docs/` directory for detailed documentation:
- `docs/memory-bank/` - Project context and specifications
- `docs/development.md` - Development setup guide

## Requirements

- Docker & Docker Compose
- Tycho API key
- RPC URLs for supported chains

---

# Pool Explorer

![Graph View of the application](./graphview.png "Title")

Pool Explorer is a local user interface designed to explore Decentralized Exchange (DEX) pools. It provides low-latency access to comprehensive and trustlessly reliable data, making on-chain liquidity easy to observe and explore. With Pool Explorer, you can filter for specific pools and visually explore the entire set of DEX pools, enabling better decision-making for traders, DEXs, and protocols.

# Quick Start with Docker (Recommended)

The easiest way to run Pool Explorer with multi-chain support is using Docker Compose. This will set up:
- 3 Tycho API instances (Ethereum, Base, Unichain)
- 1 Pool Explorer frontend that can switch between chains

## Prerequisites

- Docker and Docker Compose installed
- Git

## Setup Instructions

1. **Clone the repository and navigate to the workspace**:
```bash
cd /user/a/ws  # Or your preferred workspace directory
```

2. **Configure environment variables**:
Create a `.env` file in the workspace root with the following content:
```env
# Tycho API Configuration
TYCHO_API_KEY=sampletoken
TYCHO_ETHEREUM_URL=tycho-beta.propellerheads.xyz
TYCHO_BASE_URL=tycho-base-beta.propellerheads.xyz
TYCHO_UNICHAIN_URL=tycho-unichain-beta.propellerheads.xyz

# RPC URLs (replace YOUR_KEY with actual API keys for Base and Unichain)
RPC_URL_ETHEREUM=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
RPC_URL_BASE=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY
RPC_URL_UNICHAIN=https://unichain.g.alchemy.com/v2/YOUR_KEY

# Logging
RUST_LOG=info,tower_http=debug

# Frontend WebSocket URLs (for browser access - use localhost with exposed ports)
VITE_WEBSOCKET_URL_ETHEREUM=ws://localhost:3001/ws
VITE_WEBSOCKET_URL_BASE=ws://localhost:3002/ws
VITE_WEBSOCKET_URL_UNICHAIN=ws://localhost:3003/ws
VITE_WEBSOCKET_URL=ws://localhost:3001/ws
```

3. **Build and start all services**:
```bash
docker compose build
docker compose up
```

4. **Access the application**:
- Frontend: http://localhost:8080
- Ethereum API: http://localhost:3001
- Base API: http://localhost:3002
- Unichain API: http://localhost:3003

5. **Switch between chains**:
- Use the chain selector dropdown in the WebSocket Connection panel
- The app will automatically clear data and connect to the selected chain

## Docker Commands

```bash
# Start all services in detached mode
docker compose up -d

# View logs for all services
docker compose logs -f

# View logs for specific service
docker compose logs -f tycho-api-ethereum
docker compose logs -f swift-price-oracle

# Stop all services
docker compose down

# Rebuild after code changes
docker compose build
docker compose up
```

# Manual Setup (Alternative)

If you prefer to run without Docker:

## Prerequisites

* Install bun: https://bun.sh/docs/installation
* Install Rust: https://www.rust-lang.org/tools/install
* Clone tycho-api: https://github.com/carloszanella/tycho-api

## Running Tycho API instances

Run three separate instances for each chain:

```bash
# Terminal 1 - Ethereum
cd tycho-api
cargo run -- --tvl-threshold 30 --chain ethereum --port 3001

# Terminal 2 - Base
cd tycho-api
cargo run -- --tvl-threshold 30 --chain base --port 3002

# Terminal 3 - Unichain
cd tycho-api
cargo run -- --tvl-threshold 30 --chain unichain --port 3003
```

## Running Pool Explorer

```bash
# Install dependencies
bun install

# Configure environment variables in .env
VITE_WEBSOCKET_URL_ETHEREUM=ws://localhost:3001/ws
VITE_WEBSOCKET_URL_BASE=ws://localhost:3002/ws
VITE_WEBSOCKET_URL_UNICHAIN=ws://localhost:3003/ws

# Development mode
bun run dev

# Or build and run production
bun run build
bun run preview
```

# Features

- **Multi-Chain Support**: Switch between Ethereum, Base, and Unichain
- **Real-time Updates**: WebSocket connection for live pool data
- **Mobile Friendly**: Fully responsive design for mobile browsers
- **Pool Filtering**: Filter by tokens, protocols, and pool IDs
- **Graph Visualization**: Interactive network graph of liquidity pools
- **Swap Simulation**: Simulate trades on selected pools

# Environment Variables

Configure in `.env` file:

- `VITE_WEBSOCKET_URL`: Default WebSocket URL
- `VITE_WEBSOCKET_URL_ETHEREUM`: Ethereum chain WebSocket URL
- `VITE_WEBSOCKET_URL_BASE`: Base chain WebSocket URL
- `VITE_WEBSOCKET_URL_UNICHAIN`: Unichain WebSocket URL

# Logo Loading

The app uses Coingecko's **free and public** APIs to load token logos. No API key required. Logos are loaded progressively and cached in your browser.

