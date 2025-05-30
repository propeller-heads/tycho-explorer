# Usage: make [target] [DEV=1] [TVL=value] [SERVICE=name] [BUILD=1] [DEPS=0]
# Examples: make up DEV=1 TVL=30 BUILD=1, make up SERVICE=tycho-api-ethereum TVL=100
# IMPORTANT: NO DEFAULT VALUES IN THIS PROJECT - TVL must be explicitly set!

# Available chains
CHAINS = ethereum base unichain
API_SERVICES = $(addprefix tycho-api-,$(CHAINS))
ALL_SERVICES = $(API_SERVICES) frontend

# Check TVL for API targets (when SERVICE is an API or no SERVICE specified)
ifneq ($(filter up,$(MAKECMDGOALS)),)
  ifneq ($(SERVICE),frontend)
    ifndef TVL
      $(error ERROR: TVL is required! Usage: make up TVL=30 [SERVICE=name])
    endif
  endif
endif

# Export TVL for docker-compose
export TVL_THRESHOLD=$(TVL)

# Set compose command based on DEV flag
ifdef DEV
	DC = docker-compose -f docker-compose.dev.yml --env-file .env.dev
	ENV = dev
else
	DC = docker-compose --env-file .env
	ENV = prod
endif

# Port helpers
port-ethereum-$(ENV) = $(if $(DEV),4001,3001)
port-base-$(ENV) = $(if $(DEV),4002,3002)
port-unichain-$(ENV) = $(if $(DEV),4003,3003)
port-frontend-$(ENV) = $(if $(DEV),5173,8080)

# Default target - show help
help:
	@echo "Tycho Explorer - Docker Commands"
	@echo "================================"
	@echo ""
	@echo "Usage: make [target] [DEV=1] [TVL=value] [SERVICE=name] [BUILD=1] [DEPS=0]"
	@echo ""
	@echo "Commands:"
	@echo "  make up          - Start services"
	@echo "  make down        - Stop services"
	@echo "  make build       - Build services (no cache)"
	@echo "  make clean       - Clean everything (volumes, images, cache)"
	@echo "  make logs        - Follow service logs"
	@echo "  make ps          - Show running services"
	@echo "  make ports       - Show service ports"
	@echo "  make apis        - Start all API services"
	@echo ""
	@echo "Parameters:"
	@echo "  DEV=1           - Use development mode"
	@echo "  TVL=value       - Set TVL threshold (REQUIRED for APIs)"
	@echo "  SERVICE=name    - Specific service (e.g., tycho-api-ethereum)"
	@echo "  BUILD=1         - Rebuild without cache before starting"
	@echo "  DEPS=0          - Start without dependencies (dev mode defaults to no deps)"
	@echo ""
	@echo "Examples:"
	@echo "  make up DEV=1 TVL=30                          - Start all services"
	@echo "  make up DEV=1 TVL=30 BUILD=1                  - Rebuild & start all"
	@echo "  make up DEV=1 TVL=30 SERVICE=tycho-api-ethereum - Start just Ethereum"
	@echo "  make up SERVICE=frontend                       - Start just frontend (prod)"
	@echo ""
	@echo "Services: tycho-api-ethereum, tycho-api-base, tycho-api-unichain, frontend"

# Main commands
up:
	$(if $(BUILD),$(DC) build --no-cache $(SERVICE))
	$(DC) up $(if $(filter 0,$(DEPS)),--no-deps,) $(if $(DEV),,-d) $(SERVICE)

down:
	$(DC) down

build:
	$(DC) build --no-cache $(SERVICE)

clean:
	$(DC) down -v
	docker system prune -af --volumes

# Convenience commands
logs:
	$(DC) logs -f $(SERVICE)

ps:
	$(DC) ps

ports:
	@echo "Current ports ($(ENV) mode):"
	@echo "  Ethereum API: localhost:$(port-ethereum-$(ENV))"
	@echo "  Base API:     localhost:$(port-base-$(ENV))"
	@echo "  Unichain API: localhost:$(port-unichain-$(ENV))"
	@echo "  Frontend:     localhost:$(port-frontend-$(ENV))"

# Service groups
apis:
	$(if $(BUILD),$(DC) build --no-cache $(API_SERVICES))
	$(DC) up $(if $(filter 0,$(DEPS)),--no-deps,) $(if $(DEV),,-d) $(API_SERVICES)

.PHONY: help up down build clean logs ps ports apis