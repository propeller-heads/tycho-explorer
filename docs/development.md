# Development Setup

This guide explains how to run the Tycho Explorer stack in development mode with hot reloading.

## Configuration Philosophy

**This project uses explicit configuration:**
- Configuration via environment files (.env for prod, .env.dev for dev)
- CLI arguments passed through docker-compose
- No complex startup scripts in Docker images

## Quick Start

1. **Setup environment files:**
   ```bash
   cp .env.example .env.dev
   # Edit .env.dev with your API keys and RPC URLs
   ```

2. **Start development services:**
   ```bash
   # Using Makefile (recommended)
   make up DEV=1
   
   # Individual services (automatically runs without dependencies)
   make up DEV=1 SERVICE=tycho-api-ethereum-dev
   make up DEV=1 SERVICE=frontend-dev
   ```

3. **Access the services:**
   - Frontend (with HMR): http://127.0.0.1:5173 ⚠️ Use IP on macOS, not localhost!
   - Tycho API Ethereum: http://localhost:4001
   - Tycho API Base: http://localhost:4002
   - Tycho API Unichain: http://localhost:4003

## Key Development Features

### 🔄 Hot Reloading
- **Frontend**: Vite dev server with HMR on port 5173
- **Rust API**: cargo-watch automatically rebuilds on file changes

### 📁 Volume Mounts
- Source code is mounted into containers for live updates
- Node modules are preserved to avoid conflicts
- **Shared cargo volumes** speed up compilation:
  - `cargo-cache`: Downloaded dependencies (shared)
  - `cargo-registry`: Git dependencies (shared)
  - `cargo-target`: Compiled artifacts (shared)

### 🐛 Debug Mode
- Rust services run in debug mode (faster builds, more verbose)
- `RUST_BACKTRACE=1` enabled for better error messages
- `RUST_LOG=debug` for detailed logging

### ⚡ Faster Startup
- **Sequential startup** prevents compilation conflicts:
  - Ethereum API compiles first
  - Base & Unichain wait and reuse compiled artifacts
  - Frontend only waits for Ethereum
- Extended health check periods (3 minutes) for initial compilation
- Shared build artifacts between services

## Development Commands

### Using Makefile (Simplified!)

```bash
# Start all services - TVL REQUIRED for APIs!
make up DEV=1 TVL=30

# Start specific service without dependencies
make up DEV=1 SERVICE=frontend DEPS=0
make up DEV=1 TVL=30 SERVICE=tycho-api-ethereum

# Rebuild and start
make up DEV=1 TVL=30 BUILD=1 SERVICE=frontend

# View logs
make logs DEV=1 SERVICE=frontend

# Stop all services
make down

# Clean everything (volumes, images, cache)
make clean

# Show available commands
make help
```

### Direct Docker Commands

```bash
# If you prefer not to use the Makefile
TVL_THRESHOLD=30 docker-compose -f docker-compose.dev.yml --env-file .env.dev up

# Individual service
TVL_THRESHOLD=30 docker-compose -f docker-compose.dev.yml --env-file .env.dev up tycho-api-ethereum
```

## Differences from Production

| Feature | Development | Production |
|---------|------------|------------|
| Build Mode | Debug (Rust), Dev (Vite) | Release (Rust), Production (Vite) |
| Hot Reload | ✅ Enabled | ❌ Disabled |
| Port (Frontend) | 5173 | 8080 |
| Port (APIs) | 4001-4003 | 3001-3003 |
| Health Checks | 10s interval | 30s interval |
| Logging | Debug level | Info level |
| Volume Mounts | ✅ Source code | ❌ None |
| Service Names | *-dev suffix | Standard names |
| Container Names | *-dev suffix | Standard names |
| Environment File | .env.dev | .env |
| Resource Limits | None (unlimited) | 4GB (APIs), 2GB (Frontend) |
| Docker Network | tycho-network-dev | tycho-network |

## Troubleshooting

### Common Issues

**Frontend shows 404 on localhost:5173?**
- **macOS IPv6 Issue**: Use `http://127.0.0.1:5173` instead of `localhost`
- Vite has known issues with IPv6 on macOS
- Your browser tries IPv6 (::1) first, but Vite may not respond correctly

**"TYCHO_URL not set" or similar errors?**
- Check that TVL_THRESHOLD is set in your .env.dev file
- Ensure all required environment variables are configured
- The app now uses CLI arguments for configuration (e.g., --tycho-url)

**Rust API not reloading?**
- Check that cargo-watch is running inside the container
- Ensure source files are properly mounted
- Try `make logs SERVICE=tycho-api-ethereum` to see build output

**Frontend not updating?**
- Vite HMR requires WebSocket connection
- Check browser console for WebSocket errors
- Ensure ports 4001-4003 are accessible

**Slow initial startup?**
- First build downloads and compiles dependencies
- Subsequent starts use cached layers
- Services automatically run without dependencies when SERVICE is specified

**Permission issues?**
- Volume mounts use your local file permissions
- Run `chmod` if needed on source files

### Tips for Faster Development

1. **Start only what you need**: `make up DEV=1 SERVICE=frontend-dev`
2. **Use the simplified Makefile**: All commands are now unified
3. **Check logs quickly**: `make logs DEV=1 SERVICE=frontend-dev`
4. **Clean when in doubt**: `make clean` removes all Docker artifacts

### Docker Architecture

1. **No ENTRYPOINT/CMD in Dockerfiles** - Commands come from docker-compose
2. **Configuration via CLI args** - e.g., `--tycho-url` instead of env vars
3. **Dev services use `-dev` suffix** - Allows running dev and prod simultaneously
4. **Resource limits in prod only** - Dev has unlimited resources for flexibility