#!/bin/bash

echo "npm install..."

npm install --legacy-peer-deps

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Default directory for the Tycho API repository
DEFAULT_TYCHO_DIR="../tycho-api"

# Ask user to confirm the directory
echo -e "${YELLOW}Where should the tycho-api directory be located? [${DEFAULT_TYCHO_DIR}]: ${NC}"
read -r USER_TYCHO_DIR

# Use default if user didn't specify a directory
TYCHO_DIR=${USER_TYCHO_DIR:-$DEFAULT_TYCHO_DIR}

echo -e "${BLUE}=== Checking if Tycho API repo exists at ${TYCHO_DIR} ===${NC}"
if [ ! -d "$TYCHO_DIR" ]; then
    echo -e "${GREEN}Cloning Tycho API repository to ${TYCHO_DIR}...${NC}"
    git clone https://github.com/carloszanella/tycho-api.git "$TYCHO_DIR"
else
    echo -e "${GREEN}Tycho API repository already exists at ${TYCHO_DIR}. Pulling latest changes...${NC}"
    (cd "$TYCHO_DIR" && git pull)
fi

# Function to run Tycho API
run_tycho() {
    echo -e "${BLUE}=== Starting Tycho API ===${NC}"
    cd "$TYCHO_DIR" && cargo run -- --tvl-threshold 100 --chain ethereum
}

# Function to run Swift Price Oracle
run_swift_price_oracle() {
    echo -e "${BLUE}=== Starting Swift Price Oracle (npm) ===${NC}"
    npm run dev
}

# Check if running with parallel flag
if [ "$1" == "--parallel" ]; then
    # Run both in parallel with log prefixing
    (run_tycho 2>&1 | sed 's/^/[TYCHOAPI] /') &
    tycho_pid=$!
    (run_swift_price_oracle 2>&1 | sed 's/^/[DEXSCAN] /') &
    swift_pid=$!
    
    # Handle termination properly
    trap "kill $tycho_pid $swift_pid; exit" INT TERM
    wait
else
    # Run Tycho API in the background
    echo -e "${GREEN}Starting Tycho API in the background...${NC}"
    (run_tycho > tycho.log 2>&1) &
    tycho_pid=$!
    
    # Give it a moment to start
    sleep 3
    
    # Run Swift Price Oracle in the foreground
    echo -e "${GREEN}Starting Swift Price Oracle in the foreground...${NC}"
    echo -e "${GREEN}Tycho API logs are being written to tycho.log${NC}"
    run_swift_price_oracle
    
    # Kill the background process when the foreground one exits
    kill $tycho_pid
fi
