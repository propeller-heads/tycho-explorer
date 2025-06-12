# Dockerization Plan for Multi-Chain Swift Price Oracle & Tycho API

## Overview
This document contains the complete plan for dockerizing the Swift Price Oracle frontend and Tycho API backend to support multiple blockchain networks (Ethereum, Base, Unichain).

## Architecture
- **3 Backend Services**: Separate Tycho API instances for each chain
- **1 Frontend Service**: React app that can switch between chains
- **Docker Compose**: Orchestrates all services
- **Ubuntu 24.04 LTS**: Base image for all services

## Logging Strategy
- 🔵 Docker Build: Blue logs for build process
- 🟢 Service Startup: Green logs for successful starts
- 🔴 Errors: Red logs for failures
- 🟡 Warnings: Yellow logs for issues
- 🟣 Network: Purple logs for container communication
- 🔷 Environment: Cyan logs for env var loading

## File Structure
```
/Users/j/ws/
├── docker-compose.yml
├── .env (required - no defaults)
├── swift-price-oracle/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── nginx.conf
└── tycho-api/
    ├── Dockerfile
    └── .dockerignore
```

## Implementation Details

### 1. Swift Price Oracle Dockerfile

```dockerfile
# Build stage
FROM oven/bun:latest as builder
WORKDIR /app

# Log the build process
RUN echo "🔵 [BUILD] Starting frontend build process..."

# Copy package files
COPY package.json bun.lockb ./
RUN echo "🔵 [BUILD] Installing dependencies with bun..."
RUN bun install --frozen-lockfile || (echo "🔴 [ERROR] Failed to install dependencies" && exit 1)

# Copy source code
COPY . .
RUN echo "🔵 [BUILD] Building production bundle..."
RUN bun run build || (echo "🔴 [ERROR] Build failed" && exit 1)
RUN echo "🟢 [BUILD] Frontend build completed successfully"

# Production stage
FROM ubuntu:24.04
RUN echo "🔵 [PROD] Setting up Ubuntu 24.04 with nginx..."
RUN apt-get update && apt-get install -y nginx && rm -rf /var/lib/apt/lists/*

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html
RUN echo "🟢 [PROD] Static files copied to nginx directory"

# Copy nginx config
COPY nginx.conf /etc/nginx/sites-available/default
RUN echo "🟢 [PROD] Nginx configuration applied"

# Add startup script for logging
RUN echo '#!/bin/bash\n\
echo "🟢 [STARTUP] Starting nginx server on port 80..."\n\
echo "🔷 [ENV] VITE_WEBSOCKET_URL_ETHEREUM: $VITE_WEBSOCKET_URL_ETHEREUM"\n\
echo "🔷 [ENV] VITE_WEBSOCKET_URL_BASE: $VITE_WEBSOCKET_URL_BASE"\n\
echo "🔷 [ENV] VITE_WEBSOCKET_URL_UNICHAIN: $VITE_WEBSOCKET_URL_UNICHAIN"\n\
nginx -g "daemon off;"' > /start.sh && chmod +x /start.sh

EXPOSE 80
CMD ["/start.sh"]
```

### 2. Tycho API Dockerfile

```dockerfile
# Build stage
FROM rust:latest as builder
WORKDIR /app

RUN echo "🔵 [BUILD] Starting Rust build process..."

# Copy dependency files
COPY Cargo.toml Cargo.lock ./
RUN echo "🔵 [BUILD] Building dependencies first (this may take a while)..."
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release 2>&1 | tee /tmp/cargo-deps.log || (echo "🔴 [ERROR] Dependency build failed" && cat /tmp/cargo-deps.log && exit 1)
RUN rm -rf src

# Copy actual source
COPY . .
RUN echo "🔵 [BUILD] Building tycho-api binary..."
RUN touch src/main.rs
RUN cargo build --release 2>&1 | tee /tmp/cargo-build.log || (echo "🔴 [ERROR] Build failed" && cat /tmp/cargo-build.log && exit 1)
RUN echo "🟢 [BUILD] Rust build completed successfully"

# Runtime stage
FROM ubuntu:24.04
RUN echo "🔵 [PROD] Setting up Ubuntu 24.04 runtime..."
RUN apt-get update && apt-get install -y ca-certificates curl && rm -rf /var/lib/apt/lists/*

# Copy binary
COPY --from=builder /app/target/release/tycho-api /usr/local/bin/
RUN echo "🟢 [PROD] Binary copied successfully"

# Add startup script with logging
RUN echo '#!/bin/bash\n\
echo "🟢 [STARTUP] Starting tycho-api..."\n\
echo "🔷 [ENV] TYCHO_API_KEY: ${TYCHO_API_KEY:0:10}..."\n\
echo "🔷 [ENV] Chain URLs configured:"\n\
echo "  - TYCHO_ETHEREUM_URL: $TYCHO_ETHEREUM_URL"\n\
echo "  - TYCHO_BASE_URL: $TYCHO_BASE_URL"\n\
echo "  - TYCHO_UNICHAIN_URL: $TYCHO_UNICHAIN_URL"\n\
echo "🔷 [ENV] RUST_LOG: $RUST_LOG"\n\
echo "🟣 [NETWORK] Service will listen on port 3000"\n\
exec tycho-api "$@"' > /start.sh && chmod +x /start.sh

EXPOSE 3000
ENTRYPOINT ["/start.sh"]
```

### 3. Docker Compose Configuration

```yaml
version: '3.8'

services:
  # Ethereum Mainnet Tycho API
  tycho-api-ethereum:
    build: 
      context: ./tycho-api
      dockerfile: Dockerfile
    container_name: tycho-api-ethereum
    ports:
      - "3001:3000"
    environment:
      TYCHO_API_KEY: ${TYCHO_API_KEY}
      TYCHO_ETHEREUM_URL: ${TYCHO_ETHEREUM_URL}
      RUST_LOG: ${RUST_LOG}
    command: ["--tvl-threshold", "30", "--chain", "ethereum", "--port", "3000"]
    networks:
      - swift-network
    healthcheck:
      test: ["CMD", "bash", "-c", "curl -f http://localhost:3000/health || (echo '🔴 [HEALTH] Ethereum API health check failed' && exit 1)"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    labels:
      - "com.swift.service=tycho-api"
      - "com.swift.chain=ethereum"
  
  # Base Mainnet Tycho API
  tycho-api-base:
    build: 
      context: ./tycho-api
      dockerfile: Dockerfile
    container_name: tycho-api-base
    ports:
      - "3002:3000"
    environment:
      TYCHO_API_KEY: ${TYCHO_API_KEY}
      TYCHO_BASE_URL: ${TYCHO_BASE_URL}
      RUST_LOG: ${RUST_LOG}
    command: ["--tvl-threshold", "30", "--chain", "base", "--port", "3000"]
    networks:
      - swift-network
    healthcheck:
      test: ["CMD", "bash", "-c", "curl -f http://localhost:3000/health || (echo '🔴 [HEALTH] Base API health check failed' && exit 1)"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    labels:
      - "com.swift.service=tycho-api"
      - "com.swift.chain=base"
  
  # Unichain Mainnet Tycho API
  tycho-api-unichain:
    build: 
      context: ./tycho-api
      dockerfile: Dockerfile
    container_name: tycho-api-unichain
    ports:
      - "3003:3000"
    environment:
      TYCHO_API_KEY: ${TYCHO_API_KEY}
      TYCHO_UNICHAIN_URL: ${TYCHO_UNICHAIN_URL}
      RUST_LOG: ${RUST_LOG}
    command: ["--tvl-threshold", "30", "--chain", "unichain", "--port", "3000"]
    networks:
      - swift-network
    healthcheck:
      test: ["CMD", "bash", "-c", "curl -f http://localhost:3000/health || (echo '🔴 [HEALTH] Unichain API health check failed' && exit 1)"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    labels:
      - "com.swift.service=tycho-api"
      - "com.swift.chain=unichain"
  
  # Frontend Application
  swift-price-oracle:
    build: 
      context: ./swift-price-oracle
      dockerfile: Dockerfile
      args:
        - BUILDKIT_PROGRESS=plain
    container_name: swift-price-oracle
    ports:
      - "8080:80"
    depends_on:
      tycho-api-ethereum:
        condition: service_healthy
      tycho-api-base:
        condition: service_healthy
      tycho-api-unichain:
        condition: service_healthy
    environment:
      VITE_WEBSOCKET_URL_ETHEREUM: ${VITE_WEBSOCKET_URL_ETHEREUM}
      VITE_WEBSOCKET_URL_BASE: ${VITE_WEBSOCKET_URL_BASE}
      VITE_WEBSOCKET_URL_UNICHAIN: ${VITE_WEBSOCKET_URL_UNICHAIN}
      VITE_WEBSOCKET_URL: ${VITE_WEBSOCKET_URL}
    networks:
      - swift-network
    labels:
      - "com.swift.service=frontend"

networks:
  swift-network:
    driver: bridge
    driver_opts:
      com.docker.network.debug: "true"
```

### 4. Nginx Configuration

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;
    
    # Log all requests for debugging
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log debug;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css text/javascript application/javascript application/json;
}
```

### 5. Required .env File

```env
# Tycho API Configuration
TYCHO_API_KEY=sampletoken
TYCHO_ETHEREUM_URL=tycho-beta.propellerheads.xyz
TYCHO_BASE_URL=tycho-base-beta.propellerheads.xyz
TYCHO_UNICHAIN_URL=tycho-unichain-beta.propellerheads.xyz

# Logging
RUST_LOG=info,tower_http=debug

# Frontend WebSocket URLs (for Docker internal network)
VITE_WEBSOCKET_URL_ETHEREUM=ws://tycho-api-ethereum:3000/ws
VITE_WEBSOCKET_URL_BASE=ws://tycho-api-base:3000/ws
VITE_WEBSOCKET_URL_UNICHAIN=ws://tycho-api-unichain:3000/ws
VITE_WEBSOCKET_URL=ws://tycho-api-ethereum:3000/ws
```

### 6. Docker Ignore Files

swift-price-oracle/.dockerignore:
```
node_modules
dist
.env
.env.local
.git
*.log
```

tycho-api/.dockerignore:
```
target
.env
.git
*.log
Dockerfile
.dockerignore
```

### 7. Frontend Code Updates

#### Update vite-env.d.ts:
```typescript
interface ImportMetaEnv {
  readonly VITE_WEBSOCKET_URL: string
  readonly VITE_WEBSOCKET_URL_ETHEREUM: string
  readonly VITE_WEBSOCKET_URL_BASE: string
  readonly VITE_WEBSOCKET_URL_UNICHAIN: string
}
```

#### Create src/config/chains.ts:
```typescript
console.log('🔷 [ENV] Loading chain configuration...');
console.log('🔷 [ENV] VITE_WEBSOCKET_URL_ETHEREUM:', import.meta.env.VITE_WEBSOCKET_URL_ETHEREUM);
console.log('🔷 [ENV] VITE_WEBSOCKET_URL_BASE:', import.meta.env.VITE_WEBSOCKET_URL_BASE);
console.log('🔷 [ENV] VITE_WEBSOCKET_URL_UNICHAIN:', import.meta.env.VITE_WEBSOCKET_URL_UNICHAIN);

export const CHAIN_CONFIG = {
  Ethereum: {
    name: 'Ethereum',
    wsUrl: import.meta.env.VITE_WEBSOCKET_URL_ETHEREUM,
    enabled: true
  },
  Base: {
    name: 'Base',
    wsUrl: import.meta.env.VITE_WEBSOCKET_URL_BASE,
    enabled: true
  },
  Unichain: {
    name: 'Unichain',
    wsUrl: import.meta.env.VITE_WEBSOCKET_URL_UNICHAIN,
    enabled: true
  }
};
```

#### Update WebSocketConfig component to enable chain switching with logging.

## Debugging Commands

```bash
# View all logs with color
docker compose logs -f

# View specific service logs
docker compose logs -f tycho-api-ethereum

# Check environment variables inside container
docker compose exec tycho-api-ethereum env | grep TYCHO

# Test health endpoint manually
docker compose exec tycho-api-ethereum curl http://localhost:3000/health

# Check network connectivity
docker compose exec swift-price-oracle ping tycho-api-ethereum

# Debug WebSocket connection
docker compose exec swift-price-oracle curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" http://tycho-api-ethereum:3000/ws
```

## Critical Notes
- **NO DEFAULT VALUES**: All environment variables must be explicitly set
- **Ubuntu 24.04**: All services use Ubuntu LTS for consistency
- **Health Checks**: Essential for proper startup order
- **Logging**: Comprehensive logging at every stage for debugging