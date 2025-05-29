.PHONY: help dev prod build clean logs stop restart shell

# Default target - show help
help:
	@echo "Tycho Explorer - Available Commands:"
	@echo ""
	@echo "  make dev      - Start development environment with hot reload"
	@echo "  make prod     - Start production environment"
	@echo "  make build    - Build all Docker images (no cache)"
	@echo "  make stop     - Stop all services"
	@echo "  make restart  - Restart all services"
	@echo "  make clean    - Stop services and remove volumes"
	@echo "  make logs     - Follow logs from all services"
	@echo "  make shell    - Open shell in a service (usage: make shell service=api)"
	@echo ""

# Development environment with hot reload
dev:
	docker-compose -f docker-compose.dev.yml up

# Production environment
prod:
	docker-compose up -d

# Build all images without cache
build:
	docker-compose -f docker-compose.dev.yml build --no-cache

# Stop all services
stop:
	docker-compose down

# Restart all services
restart: stop prod

# Clean up everything including volumes
clean:
	docker-compose down -v
	docker-compose -f docker-compose.dev.yml down -v

# Follow logs
logs:
	docker-compose logs -f

# Open shell in a service
shell:
	@if [ -z "$(service)" ]; then \
		echo "Usage: make shell service=<service-name>"; \
		echo "Available services: api-ethereum, api-base, api-unichain, frontend"; \
	else \
		docker-compose exec $(service) /bin/bash; \
	fi