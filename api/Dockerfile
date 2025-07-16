# Build stage
FROM rust:1.87 as builder

# Create workspace directory structure
RUN mkdir -p /workspace/api
WORKDIR /workspace

RUN echo "🔵 [BUILD] Starting Rust build process..."

# Copy workspace files first
COPY Cargo.toml Cargo.lock ./
COPY api/Cargo.toml ./api/

# Build dependencies first
RUN echo "🔵 [BUILD] Building dependencies first (this may take a while)..."
RUN mkdir -p api/src && echo "fn main() {}" > api/src/main.rs
RUN cd api && cargo build --release 2>&1 | tee /tmp/cargo-deps.log || (echo "🔴 [ERROR] Dependency build failed" && cat /tmp/cargo-deps.log && exit 1)
RUN rm -rf api/src

# Copy actual source
COPY api ./api
RUN echo "🔵 [BUILD] Building tycho-api binary..."
RUN touch api/src/main.rs
RUN cd api && cargo build --release 2>&1 | tee /tmp/cargo-build.log || (echo "🔴 [ERROR] Build failed" && cat /tmp/cargo-build.log && exit 1)
RUN echo "🟢 [BUILD] Rust build completed successfully"

# Runtime stage
FROM debian:bookworm-slim
RUN echo "🔵 [PROD] Setting up Debian slim runtime..."

# Install runtime dependencies (curl for healthchecks, ca-certificates for TLS)
RUN apt-get update && apt-get install -y \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy binary
COPY --from=builder /workspace/target/release/tycho-api /usr/local/bin/
RUN echo "🟢 [PROD] Binary copied successfully"

EXPOSE 3000

# Command will be provided by docker-compose
