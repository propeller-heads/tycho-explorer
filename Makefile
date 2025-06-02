# Tycho Explorer Makefile - Simple Docker Commands
# =================================================
# This Makefile helps you run Docker commands more easily.
# Instead of typing long docker-compose commands, you can use short 'make' commands.

# How to use:
# -----------
# make <command> [options]
# 
# Examples:
#   make up                    # Start all services in production mode
#   make up DEV=1              # Start all services in development mode (with hot reload)
#   make up DEV=1 SERVICE=frontend  # Start only frontend in dev mode
#   make down                  # Stop all running services

# === Configuration Variables ===

# List of blockchain networks we support
CHAINS = ethereum base unichain

# Build service names by adding 'tycho-api-' prefix to each chain
# Result: tycho-api-ethereum, tycho-api-base, tycho-api-unichain
# NOTE: In production, all API services share the same Docker image (tycho-explorer/api:latest)
#       Only the first service builds it, others reuse it with different CLI arguments
API_SERVICES = $(addprefix tycho-api-,$(CHAINS))
API_SERVICES_DEV = $(addsuffix -dev,$(API_SERVICES))

# All services in our application
ALL_SERVICES = $(API_SERVICES) frontend
ALL_SERVICES_DEV = $(API_SERVICES_DEV) frontend-dev

# === Environment Setup ===
# DEV=1 switches between development and production modes

ifdef DEV
	# Development mode: use dev config files and show logs in terminal
	DC = docker-compose -f docker-compose.dev.yml --env-file .env.dev
	MODE_DESC = Development mode (hot reload enabled)
else
	# Production mode: use production config files and run in background
	DC = docker-compose --env-file .env
	MODE_DESC = Production mode
endif

# === Main Commands ===

# Default command when you just type 'make'
help:
	@echo "╔════════════════════════════════════════════════════════════════╗"
	@echo "║               Tycho Explorer - Docker Commands                  ║"
	@echo "╚════════════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "BASIC COMMANDS:"
	@echo "  make up       → Start all services"
	@echo "  make down     → Stop all services"
	@echo "  make logs     → View logs (use SERVICE=name for specific service)"
	@echo "  make build    → Build/rebuild Docker images"
	@echo "  make clean    → Remove everything (containers, images, volumes)"
	@echo ""
	@echo "OPTIONS:"
	@echo "  DEV=1         → Use development mode (hot reload, logs in terminal)"
	@echo "                  Without DEV=1, runs in production mode (background)"
	@echo ""
	@echo "  SERVICE=name  → Target a specific service instead of all"
	@echo "                  When specified, runs without dependencies"
	@echo ""
	@echo "  BUILD=1       → Force rebuild images before starting"
	@echo ""
	@echo "AVAILABLE SERVICES:"
	@echo "  Production (all API services use same image):"
	@echo "    • tycho-api-ethereum  (API for Ethereum network, port 3001)"
	@echo "    • tycho-api-base      (API for Base network, port 3002)"
	@echo "    • tycho-api-unichain  (API for Unichain network, port 3003)"
	@echo "    • frontend            (Web interface, port 8080)"
	@echo "  Development (DEV=1, with hot reload):"
	@echo "    • tycho-api-ethereum-dev  (port 4001)"
	@echo "    • tycho-api-base-dev      (port 4002)"
	@echo "    • tycho-api-unichain-dev  (port 4003)"
	@echo "    • frontend-dev            (port 5173)"
	@echo ""
	@echo "EXAMPLES:"
	@echo "  make up DEV=1                           # Start everything in dev mode"
	@echo "  make up DEV=1 SERVICE=frontend-dev      # Start only frontend in dev mode"
	@echo "  make up BUILD=1                         # Rebuild and start in production"
	@echo "  make logs SERVICE=tycho-api-ethereum    # View logs for Ethereum API (prod)"
	@echo "  make logs DEV=1 SERVICE=tycho-api-ethereum-dev  # View logs for Ethereum API (dev)"
	@echo "  make down                               # Stop everything"
	@echo ""
	@echo "Current mode: $(MODE_DESC)"

# Start services
# - If BUILD=1 is set, rebuild images first
# - If SERVICE is set, start only that service without dependencies
# - If DEV=1 is set, run in foreground (see logs), otherwise run in background
up:
	@echo "Starting services in $(MODE_DESC)..."
	$(if $(BUILD),@echo "Rebuilding images first..." && $(DC) build $(SERVICE))
	$(DC) up $(if $(SERVICE),--no-deps,) $(if $(DEV),,-d) $(SERVICE)
	@echo "✓ Services started successfully"

# Stop all services and remove containers
down:
	@echo "Stopping all services..."
	$(DC) down
	@echo "✓ All services stopped"

# View logs
# - If SERVICE is set, show logs for that service only
# - Otherwise show logs for all services
# - Always follow logs with -f flag
logs:
	@echo "Showing logs for $(if $(SERVICE),$(SERVICE),all services)..."
	@echo "Press Ctrl+C to exit"
	$(DC) logs -f $(SERVICE)

# Build or rebuild Docker images
# - Uses cache for faster builds
# - If SERVICE is set, build only that service
# - In production, all API services share the same image (built once)
build:
	@echo "Building $(if $(SERVICE),$(SERVICE),all services)..."
	$(DC) build $(SERVICE)
	@echo "✓ Build complete"

# Clean up everything - remove containers, volumes, and images
# WARNING: This will delete all data!
clean:
	@echo "⚠️  WARNING: This will remove all containers, images, and volumes!"
	@echo "Press Ctrl+C within 5 seconds to cancel..."
	@sleep 5
	@echo "Cleaning up everything..."
	$(DC) down -v
	docker system prune -af --volumes
	@echo "✓ Cleanup complete"

# Tell Make these aren't real files
.PHONY: help up down logs build clean