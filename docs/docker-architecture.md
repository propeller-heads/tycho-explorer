# Docker Architecture - Actual Implementation

## Overview
This document describes the actual Docker implementation for Tycho Explorer, reflecting the simplified approach we adopted.

## Key Design Principles

### 1. No ENTRYPOINT/CMD in Dockerfiles
- All execution commands are specified in docker-compose
- Dockerfiles only set up the environment and copy files
- This provides maximum flexibility for different environments

### 2. Configuration via CLI Arguments
- Critical parameters like `--tycho-url` are passed as CLI arguments
- Environment variables are only used for secrets (API keys, RPC URLs)
- TVL_THRESHOLD moved from Makefile parameter to .env file

### 3. Simplified Dockerfiles
- No complex startup scripts
- No environment variable echoing
- Direct execution of binaries
- Minimal runtime dependencies

### 4. Service Naming Convention
- Development services have `-dev` suffix
- Allows running dev and prod environments simultaneously
- Examples: `tycho-api-ethereum-dev`, `frontend-dev`

### 5. Resource Management
- **Development**: No resource limits for flexibility
- **Production**: 4GB for API services, 2GB for frontend
- Prevents resource exhaustion in production

## Implementation Details

### API Dockerfile Structure

```dockerfile
# Build stage - compile Rust binary
FROM rust:latest as builder
# ... build process ...

# Runtime stage - minimal image
FROM debian:bookworm-slim
# Install only essential dependencies (curl for healthchecks)
# Copy binary
# No ENTRYPOINT/CMD - let docker-compose handle it
```

### Frontend Dockerfile Structure

```dockerfile
# Build stage - compile React app
FROM oven/bun:latest as builder
# ... build process with env vars ...

# Runtime stage - nginx
FROM nginx:alpine
# Copy built files
# No complex startup scripts
```

## Configuration Flow

```
.env/.env.dev → docker-compose → CLI arguments → Application
```

1. Environment files define variables
2. Docker-compose interpolates variables
3. Commands pass config as CLI arguments
4. Application receives full configuration

## Development vs Production

### Development Mode
- Uses `docker-compose.dev.yml`
- Sources from `.env.dev`
- Hot reloading enabled (cargo-watch, vite)
- No resource limits
- Services suffixed with `-dev`
- Runs in foreground for logs

### Production Mode
- Uses `docker-compose.yml`
- Sources from `.env`
- Optimized builds
- Resource limits enforced
- Standard service names
- Runs in background

## Lessons Learned

1. **Simplicity wins**: Removing complex startup scripts made debugging easier
2. **Explicit configuration**: CLI args are clearer than environment variable magic
3. **Separation of concerns**: Dockerfiles build, docker-compose configures
4. **Flexibility**: No ENTRYPOINT allows easy command overrides
5. **Consistency**: Same patterns for both dev and prod, just different values

## Common Commands

```bash
# Development
make up DEV=1
make up DEV=1 SERVICE=tycho-api-ethereum-dev

# Production
make up
make up SERVICE=tycho-api-ethereum

# Debugging
make logs DEV=1 SERVICE=frontend-dev
docker compose -f docker-compose.dev.yml exec tycho-api-ethereum-dev env
```

## Troubleshooting

### "executable file not found" errors
- Ensure you've rebuilt after Dockerfile changes
- Check that the full path is specified in docker-compose command

### Environment variable issues
- Variables in `command:` arrays need proper quoting
- Use `/bin/sh -c` for complex commands with variable interpolation

### Service naming conflicts
- Use `-dev` suffix for development services
- Check both service names and container names