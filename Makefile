.PHONY: help install dev build test lint format clean docker-up docker-down db-migrate db-seed

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install all dependencies
	npm install

dev: ## Start development servers
	docker-compose -f docker-compose.dev.yml up -d
	npm run dev

build: ## Build all packages
	npm run build

test: ## Run all tests
	npm run test

lint: ## Lint all code
	npm run lint

format: ## Format all code
	npm run format

type-check: ## Type check all TypeScript
	npm run type-check

clean: ## Clean all build artifacts and dependencies
	npm run clean
	docker-compose -f docker-compose.dev.yml down -v

docker-up: ## Start all Docker services
	docker-compose -f docker-compose.dev.yml up -d

docker-down: ## Stop all Docker services
	docker-compose -f docker-compose.dev.yml down

docker-logs: ## View Docker logs
	docker-compose -f docker-compose.dev.yml logs -f

db-migrate: ## Run database migrations
	npm run db:migrate

db-seed: ## Seed database with sample data
	npm run db:seed

db-reset: ## Reset database (migrations + seed)
	npm run db:migrate
	npm run db:seed

mobile-ios: ## Run mobile app on iOS
	npm run mobile:ios

mobile-android: ## Run mobile app on Android
	npm run mobile:android

web-dev: ## Run web app in development
	npm run web:dev

api-dev: ## Run API server in development
	npm run api:dev
