# Development Setup

This guide explains how to run the Tycho Explorer stack in development mode with hot reloading.

## Important: NO DEFAULT VALUES

**⚠️ This project has a strict NO DEFAULTS policy!**
- You MUST explicitly provide all required parameters
- There are NO default values anywhere in the codebase
- TVL threshold must ALWAYS be specified when running API services

## Quick Start

1. **Setup environment files:**
   ```bash
   # Production environment: .env
   # Development environment: .env.dev
   # Edit with your API keys and RPC URLs
   ```

2. **Start development services:**
   ```bash
   # Using Makefile (recommended)
   make up DEV=1 TVL=30
   
   # Individual services
   make ethereum-api DEV=1 TVL=30
   make base-api DEV=1 TVL=100
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

### Using Makefile (Recommended)

```bash
# Start all services - TVL REQUIRED!
make up DEV=1 TVL=30

# Start individual services - TVL REQUIRED!
make ethereum-api DEV=1 TVL=30
make base-api DEV=1 TVL=50
make unichain-api DEV=1 TVL=100

# Stop services
make down DEV=1

# Clean volumes
make clean DEV=1

# Production mode (uses .env instead of .env.dev)
make ethereum-api TVL=30
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
| Container Names | *-dev suffix | Standard names |
| Environment File | .env.dev | .env |
| TVL Threshold | MUST be specified | MUST be specified |

## Troubleshooting

**"TVL_THRESHOLD: parameter null or not set" error?**
- You MUST specify TVL when running API services
- Example: `make ethereum-api DEV=1 TVL=30`
- This project has NO default values!

**Rust API not reloading?**
- Check that cargo-watch is running inside the container
- Ensure source files are properly mounted

**Frontend not accessible?**
- Vite binds to 0.0.0.0 for container access
- Check WebSocket URLs in .env.dev match dev ports (4001-4003)

**Slow initial startup?**
- First build downloads and compiles dependencies
- Subsequent starts use cached layers

**Permission issues?**
- Volume mounts use your local file permissions
- Run `chmod` if needed on source files