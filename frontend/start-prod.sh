#!/bin/bash

echo "Building and running production builds..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Default directory for the Tycho API repository
DEFAULT_TYCHO_DIR="../tycho-api"

# Ask user to confirm the directory
echo -e "${YELLOW}Where is the tycho-api directory located? [${DEFAULT_TYCHO_DIR}]: ${NC}"
read -r USER_TYCHO_DIR

# Use default if user didn't specify a directory
TYCHO_DIR=${USER_TYCHO_DIR:-$DEFAULT_TYCHO_DIR}

echo -e "${BLUE}=== Checking if Tycho API repo exists at ${TYCHO_DIR} ===${NC}"
if [ ! -d "$TYCHO_DIR" ]; then
    echo -e "${RED}Error: Tycho API directory not found at ${TYCHO_DIR}${NC}"
    exit 1
fi

# Function to build and run Tycho API in production mode
build_and_run_tycho() {
    echo -e "${BLUE}=== Building Tycho API in release mode ===${NC}"
    cd "$TYCHO_DIR" && cargo build --release
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Tycho API build successful!${NC}"
        echo -e "${BLUE}=== Starting Tycho API (production) ===${NC}"
        ./target/release/tycho-api --tvl-threshold 30 --chain ethereum
    else
        echo -e "${RED}Tycho API build failed!${NC}"
        exit 1
    fi
}

# Function to build Swift Price Oracle
build_swift_price_oracle() {
    echo -e "${BLUE}=== Building Swift Price Oracle for production ===${NC}"
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Installing dependencies...${NC}"
        bun install --legacy-peer-deps
    fi
    
    # Build the application
    bun run build
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Swift Price Oracle build successful!${NC}"
    else
        echo -e "${RED}Swift Price Oracle build failed!${NC}"
        exit 1
    fi
}

# Function to run Swift Price Oracle production build
run_swift_price_oracle_prod() {
    echo -e "${BLUE}=== Starting Swift Price Oracle (production) ===${NC}"
    bun run preview
}

# Build Swift Price Oracle first
build_swift_price_oracle

# Check if running with parallel flag
if [ "$1" == "--parallel" ]; then
    # Run both in parallel with log prefixing
    (build_and_run_tycho 2>&1 | sed 's/^/[TYCHOAPI] /') &
    tycho_pid=$!
    (run_swift_price_oracle_prod 2>&1 | sed 's/^/[DEXSCAN] /') &
    swift_pid=$!
    
    # Handle termination properly
    trap "kill $tycho_pid $swift_pid; exit" INT TERM
    wait
else
    # Run Tycho API in the background
    echo -e "${GREEN}Starting Tycho API in the background...${NC}"
    (build_and_run_tycho > tycho-prod.log 2>&1) &
    tycho_pid=$!
    
    # Give it a moment to start
    sleep 5
    
    # Run Swift Price Oracle in the foreground
    echo -e "${GREEN}Starting Swift Price Oracle in the foreground...${NC}"
    echo -e "${GREEN}Tycho API logs are being written to tycho-prod.log${NC}"
    run_swift_price_oracle_prod
    
    # Kill the background process when the foreground one exits
    kill $tycho_pid
fi