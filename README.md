# Tycho Explorer

A real-time DeFi pool explorer and swap simulator powered by the Tycho protocol.

## Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd tycho-explorer

# Set up environment
cp .env.example .env
# Edit .env with your API keys

# Start development environment
make dev

# Or start production
make prod
```

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
  - Development: http://localhost:5173

## Development

```bash
# Start dev environment with hot reload
make dev

# View logs
make logs

# Rebuild images
make build

# Stop services
make stop

# Clean everything
make clean
```

## Documentation

See the `docs/` directory for detailed documentation:
- `docs/memory-bank/` - Project context and specifications
- `docs/development.md` - Development setup guide

## Requirements

- Docker & Docker Compose
- Tycho API key
- RPC URLs for supported chains