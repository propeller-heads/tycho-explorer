# Development Setup

This guide explains how to run the Swift Price Oracle stack in development mode with hot reloading.

## Quick Start

1. **Copy environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and RPC URLs
   ```

2. **Start development services:**
   ```bash
   docker-compose -f docker-compose.dev.yml up
   ```

3. **Access the services:**
   - Frontend (with HMR): http://localhost:5173
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

### 🐛 Debug Mode
- Rust services run in debug mode (faster builds, more verbose)
- `RUST_BACKTRACE=1` enabled for better error messages
- `RUST_LOG=debug` for detailed logging

### ⚡ Faster Startup
- Reduced health check intervals
- Shorter startup periods
- No production optimizations

## Development Commands

```bash
# Start all services
docker-compose -f docker-compose.dev.yml up

# Start specific service
docker-compose -f docker-compose.dev.yml up swift-price-oracle

# Rebuild after dependency changes
docker-compose -f docker-compose.dev.yml build --no-cache

# View logs
docker-compose -f docker-compose.dev.yml logs -f tycho-api-ethereum

# Stop all services
docker-compose -f docker-compose.dev.yml down
```

## Differences from Production

| Feature | Development | Production |
|---------|------------|------------|
| Build Mode | Debug (Rust), Dev (Vite) | Release (Rust), Production (Vite) |
| Hot Reload | ✅ Enabled | ❌ Disabled |
| Port (Frontend) | 5173 | 8080 |
| Health Checks | 10s interval | 30s interval |
| Logging | Debug level | Info level |
| Volume Mounts | ✅ Source code | ❌ None |
| Container Names | *-dev suffix | Standard names |

## Troubleshooting

**Rust API not reloading?**
- Check that cargo-watch is running inside the container
- Ensure source files are properly mounted

**Frontend not accessible?**
- Vite binds to 0.0.0.0 for container access
- Check WebSocket URLs in .env match your setup

**Slow initial startup?**
- First build downloads and compiles dependencies
- Subsequent starts use cached layers

**Permission issues?**
- Volume mounts use your local file permissions
- Run `chmod` if needed on source files