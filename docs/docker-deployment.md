# Docker Deployment Guide

This guide explains how to deploy Tycho Explorer using Docker, covering both development and production setups.

## Production Deployment

### Quick Start

```bash
# Clone and navigate to the project
git clone <repository-url>
cd tycho-explorer

# Configure environment
cp .env.example .env
# Edit .env with your API keys and settings

# Start all services
make up

# Or using docker-compose directly
docker-compose up -d
```

### Production Architecture

#### Shared Docker Image

In production, all three API services (Ethereum, Base, Unichain) use the **same Docker image**:

```yaml
# docker-compose.yml
tycho-api-ethereum:
  build: 
    context: ./api
    dockerfile: Dockerfile
  image: tycho-explorer/api:latest  # Builds and tags the image
  
tycho-api-base:
  image: tycho-explorer/api:latest  # Reuses the same image
  
tycho-api-unichain:
  image: tycho-explorer/api:latest  # Reuses the same image
```

Benefits:
- **3x faster builds** - Rust compilation happens only once
- **Smaller disk usage** - One image instead of three
- **Consistent deployments** - All services guaranteed to use the same binary

Each service runs with different CLI arguments:
- `--chain ethereum --tycho-url ${TYCHO_ETHEREUM_URL}`
- `--chain base --tycho-url ${TYCHO_BASE_URL}`
- `--chain unichain --tycho-url ${TYCHO_UNICHAIN_URL}`

#### Service Ports

| Service | Port | Description |
|---------|------|-------------|
| tycho-api-ethereum | 3001 | Ethereum chain API |
| tycho-api-base | 3002 | Base chain API |
| tycho-api-unichain | 3003 | Unichain API |
| frontend | 8080 | Web interface |

#### Resource Limits

Production services have memory limits:
- API services: 4GB each
- Frontend: 2GB

### Production Commands

```bash
# Start services (background)
make up

# View logs
make logs                        # All services
make logs SERVICE=frontend       # Specific service

# Stop services
make down

# Rebuild and restart
make up BUILD=1

# Clean everything (WARNING: deletes data)
make clean
```

## Development Deployment

### Quick Start

```bash
# Configure development environment
cp .env.example .env.dev
# Edit .env.dev

# Start development services
make up DEV=1
```

### Development Architecture

#### Shared Volumes for Fast Builds

Development uses shared Docker volumes to speed up compilation:

```yaml
volumes:
  cargo-cache:      # Downloaded dependencies
  cargo-registry:   # Git dependencies
  cargo-target:     # Compiled artifacts

services:
  tycho-api-ethereum-dev:
    volumes:
      - cargo-cache:/usr/local/cargo/registry
      - cargo-registry:/usr/local/cargo/git
      - cargo-target:/app/target
```

#### Sequential Startup

To prevent compilation conflicts, services start sequentially:

1. **Ethereum API** starts first, compiles everything
2. **Base & Unichain APIs** wait for Ethereum to be healthy
3. **Frontend** only waits for Ethereum (can start sooner)

```yaml
tycho-api-base-dev:
  depends_on:
    tycho-api-ethereum-dev:
      condition: service_healthy
```

#### Hot Reload

- **API**: Uses `cargo watch` for automatic recompilation
- **Frontend**: Uses Vite dev server with HMR

#### Development Ports

| Service | Port | Description |
|---------|------|-------------|
| tycho-api-ethereum-dev | 4001 | Ethereum API with hot reload |
| tycho-api-base-dev | 4002 | Base API with hot reload |
| tycho-api-unichain-dev | 4003 | Unichain API with hot reload |
| frontend-dev | 5173 | Frontend with HMR |

### Development Commands

```bash
# Start all services (logs in terminal)
make up DEV=1

# Start specific service
make up DEV=1 SERVICE=frontend-dev

# Force rebuild
make up DEV=1 BUILD=1

# View logs (if running in background)
make logs DEV=1 SERVICE=tycho-api-ethereum-dev
```

## Environment Configuration

### Required Variables

Both `.env` (production) and `.env.dev` (development) need:

```env
# Tycho API Configuration
TYCHO_API_KEY=your-api-key
TYCHO_ETHEREUM_URL=tycho-server-url
TYCHO_BASE_URL=tycho-base-server-url
TYCHO_UNICHAIN_URL=tycho-unichain-server-url

# TVL Threshold
TVL_THRESHOLD=30

# Frontend WebSocket URLs
VITE_WEBSOCKET_URL_ETHEREUM=ws://localhost:3001/ws
VITE_WEBSOCKET_URL_BASE=ws://localhost:3002/ws
VITE_WEBSOCKET_URL_UNICHAIN=ws://localhost:3003/ws
```

### Development vs Production Config

| Variable | Production | Development |
|----------|-----------|-------------|
| RUST_LOG | info | debug |
| Port range | 3001-3003, 8080 | 4001-4003, 5173 |
| WebSocket URLs | ws://localhost:300X/ws | ws://localhost:400X/ws |

## Troubleshooting

### macOS Frontend Access
On macOS, use `http://127.0.0.1:5173` instead of `localhost:5173` due to IPv6/IPv4 issues.

### Slow Initial Build
First build compiles all Rust dependencies. Subsequent builds use cache.

### Port Conflicts
Check if ports are already in use:
```bash
lsof -i :3001  # Check specific port
docker ps      # Check running containers
```

### Health Check Failures
Development services need time to compile. Health checks allow:
- 3 minutes start period
- 30 second intervals
- 4 retries

### Viewing Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f tycho-api-ethereum
```