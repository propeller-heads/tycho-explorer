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
echo "🔷 [ENV] RPC_URL: ${RPC_URL:0:30}..."\n\
echo "🔷 [ENV] RUST_LOG: $RUST_LOG"\n\
echo "🟣 [NETWORK] Service will listen on port 3000"\n\
exec tycho-api "$@"' > /start.sh && chmod +x /start.sh

EXPOSE 3000
ENTRYPOINT ["/start.sh"]