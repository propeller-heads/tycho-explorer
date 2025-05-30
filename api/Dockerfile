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
FROM debian:bookworm-slim
RUN echo "🔵 [PROD] Setting up Debian slim runtime..."

# Install runtime dependencies (curl for healthchecks, ca-certificates for TLS)
RUN apt-get update && apt-get install -y \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy binary
COPY --from=builder /app/target/release/tycho-api /usr/local/bin/
RUN echo "🟢 [PROD] Binary copied successfully"

EXPOSE 3000

# Command will be provided by docker-compose