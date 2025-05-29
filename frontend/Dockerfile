# Build stage
FROM oven/bun:latest as builder
WORKDIR /app

# Accept build arguments for Vite environment variables
ARG VITE_WEBSOCKET_URL
ARG VITE_WEBSOCKET_URL_ETHEREUM
ARG VITE_WEBSOCKET_URL_BASE
ARG VITE_WEBSOCKET_URL_UNICHAIN

# Set them as environment variables for the build
ENV VITE_WEBSOCKET_URL=$VITE_WEBSOCKET_URL
ENV VITE_WEBSOCKET_URL_ETHEREUM=$VITE_WEBSOCKET_URL_ETHEREUM
ENV VITE_WEBSOCKET_URL_BASE=$VITE_WEBSOCKET_URL_BASE
ENV VITE_WEBSOCKET_URL_UNICHAIN=$VITE_WEBSOCKET_URL_UNICHAIN

# Log the build process
RUN echo "🔵 [BUILD] Starting frontend build process..."
RUN echo "🔷 [BUILD ENV] VITE_WEBSOCKET_URL: $VITE_WEBSOCKET_URL"
RUN echo "🔷 [BUILD ENV] VITE_WEBSOCKET_URL_ETHEREUM: $VITE_WEBSOCKET_URL_ETHEREUM"
RUN echo "🔷 [BUILD ENV] VITE_WEBSOCKET_URL_BASE: $VITE_WEBSOCKET_URL_BASE"
RUN echo "🔷 [BUILD ENV] VITE_WEBSOCKET_URL_UNICHAIN: $VITE_WEBSOCKET_URL_UNICHAIN"

# Copy package files
COPY package.json bun.lockb ./
RUN echo "🔵 [BUILD] Installing dependencies with bun..."
RUN bun install --frozen-lockfile || (echo "🔴 [ERROR] Failed to install dependencies" && exit 1)

# Copy source code
COPY . .
RUN echo "🔵 [BUILD] Building production bundle..."
RUN echo "🔵 [BUILD] Current directory contents:" && ls -la
RUN echo "🔵 [BUILD] Package.json scripts:" && cat package.json | grep -A5 '"scripts"'
RUN bun run build 2>&1 | tee /tmp/build.log || (echo "🔴 [ERROR] Build failed. Full error log:" && cat /tmp/build.log && exit 1)
RUN echo "🟢 [BUILD] Frontend build completed successfully"
RUN echo "🔵 [BUILD] Checking dist directory:" && ls -la dist/ || echo "🔴 [ERROR] dist directory not found!"

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