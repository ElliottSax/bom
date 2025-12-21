#!/bin/bash
#
# Production Deployment Script for BOM Study Tools
# Automated deployment to cloud platforms
#

set -e

echo "================================================"
echo "🚀 BOM Study Tools - Production Deployment"
echo "================================================"
echo

# Configuration
PROJECT_NAME="bom-study-tools"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DEPLOYMENT_ENV="${1:-production}"

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Helper functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    echo "Checking prerequisites..."

    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi

    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi

    # Check Python
    if ! command -v python3 &> /dev/null; then
        log_error "Python 3 is not installed"
        exit 1
    fi

    log_info "All prerequisites met ✅"
}

# Build API Docker image
build_api() {
    echo
    echo "Building API Docker image..."

    cd services/api

    # Create Dockerfile for production
    cat > Dockerfile.production << 'EOF'
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY server-full.py .
COPY auth.py .

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD python3 -c "import urllib.request; urllib.request.urlopen('http://localhost:4000/health')"

# Expose port
EXPOSE 4000

# Run server
CMD ["python3", "server-full.py"]
EOF

    # Build image
    docker build -f Dockerfile.production -t ${PROJECT_NAME}-api:${TIMESTAMP} .
    docker tag ${PROJECT_NAME}-api:${TIMESTAMP} ${PROJECT_NAME}-api:latest

    log_info "API Docker image built ✅"
    cd ../..
}

# Build mobile app
build_mobile() {
    echo
    echo "Building mobile app..."

    cd apps/mobile

    # Update package.json with fixed dependencies
    if [ -f "package-fixed.json" ]; then
        cp package-fixed.json package.json
        log_info "Using fixed package.json"
    fi

    # Install dependencies
    log_info "Installing dependencies..."
    npm ci --production

    # Build Android APK
    if [ -d "android" ]; then
        log_info "Building Android APK..."
        cd android

        # Clean build
        ./gradlew clean

        # Build release APK
        ./gradlew assembleRelease

        # Check if APK was created
        APK_PATH="app/build/outputs/apk/release/app-release-unsigned.apk"
        if [ -f "$APK_PATH" ]; then
            log_info "APK built successfully: $APK_PATH"

            # Copy to deployment directory
            mkdir -p ../../../deployment/mobile
            cp $APK_PATH ../../../deployment/mobile/bom-study-tools-${TIMESTAMP}.apk
        else
            log_error "APK build failed"
        fi

        cd ..
    fi

    cd ../..
    log_info "Mobile build complete ✅"
}

# Deploy to Render.com
deploy_render() {
    echo
    echo "Deploying to Render.com..."

    # Create render.yaml
    cat > render.yaml << 'EOF'
services:
  - type: web
    name: bom-api
    env: docker
    dockerfilePath: ./services/api/Dockerfile.production
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: bom-db
          property: connectionString
      - key: PORT
        value: 4000
    healthCheckPath: /health

databases:
  - name: bom-db
    plan: free
    databaseName: bom_study_tools
    user: bom_user

  - name: bom-redis
    plan: free
    type: redis
EOF

    log_info "Render configuration created"
    log_info "Push to GitHub and connect to Render.com"
}

# Deploy to Fly.io
deploy_fly() {
    echo
    echo "Deploying to Fly.io..."

    # Create fly.toml
    cat > fly.toml << 'EOF'
app = "bom-study-tools"
primary_region = "ord"

[build]
  dockerfile = "./services/api/Dockerfile.production"

[env]
  PORT = "4000"

[experimental]
  auto_rollback = true

[[services]]
  http_checks = []
  internal_port = 4000
  processes = ["app"]
  protocol = "tcp"
  script_checks = []

  [services.concurrency]
    hard_limit = 25
    soft_limit = 20
    type = "connections"

  [[services.ports]]
    force_https = true
    handlers = ["http"]
    port = 80

  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443

  [[services.tcp_checks]]
    grace_period = "1s"
    interval = "15s"
    restart_limit = 0
    timeout = "2s"

  [[services.http_checks]]
    interval = 10000
    grace_period = "5s"
    method = "get"
    path = "/health"
    protocol = "http"
    timeout = 2000
    tls_skip_verify = false
EOF

    log_info "Fly.io configuration created"

    # Check if fly CLI is installed
    if command -v flyctl &> /dev/null; then
        log_info "Deploying with flyctl..."
        flyctl deploy
    else
        log_warn "Install flyctl: curl -L https://fly.io/install.sh | sh"
    fi
}

# Database migration
migrate_database() {
    echo
    echo "Migrating production database..."

    # Check if production database URL is set
    if [ -z "$PROD_DATABASE_URL" ]; then
        log_warn "PROD_DATABASE_URL not set, skipping migration"
        return
    fi

    # Run migrations
    cd services/api/prisma/migrations

    for migration in 001_init_complete 002_seed_data; do
        log_info "Applying migration: $migration"
        psql $PROD_DATABASE_URL < $migration/*.sql
    done

    cd ../../../..
    log_info "Database migration complete ✅"
}

# Create deployment package
create_deployment_package() {
    echo
    echo "Creating deployment package..."

    DEPLOY_DIR="deployment/release-${TIMESTAMP}"
    mkdir -p $DEPLOY_DIR

    # Copy essential files
    cp -r services/api $DEPLOY_DIR/api
    cp -r scripts $DEPLOY_DIR/scripts
    cp render.yaml $DEPLOY_DIR/
    cp fly.toml $DEPLOY_DIR/

    # Create deployment README
    cat > $DEPLOY_DIR/README.md << EOF
# BOM Study Tools Deployment Package
Version: ${TIMESTAMP}
Environment: ${DEPLOYMENT_ENV}

## Contents
- API server (Python/GraphQL)
- Deployment configurations
- Scripts

## Quick Deploy
1. Push to GitHub
2. Connect to Render.com or Fly.io
3. Set environment variables
4. Deploy!

## Environment Variables Required
- DATABASE_URL
- REDIS_URL (optional)
- PORT (default: 4000)
EOF

    # Create tarball
    tar -czf deployment/bom-study-tools-${TIMESTAMP}.tar.gz -C deployment release-${TIMESTAMP}

    log_info "Deployment package created: deployment/bom-study-tools-${TIMESTAMP}.tar.gz"
}

# Health check
health_check() {
    echo
    echo "Running health checks..."

    # Check local API
    if curl -s http://localhost:4000/health > /dev/null 2>&1; then
        log_info "Local API is healthy ✅"
    else
        log_warn "Local API is not running"
    fi

    # Check database
    if docker ps | grep bom-postgres > /dev/null; then
        log_info "Database is running ✅"
    else
        log_warn "Database is not running"
    fi
}

# Main deployment flow
main() {
    echo "Starting deployment for environment: ${DEPLOYMENT_ENV}"
    echo

    # Run checks
    check_prerequisites

    # Build components
    build_api
    build_mobile

    # Create configurations
    case "$DEPLOYMENT_ENV" in
        "render")
            deploy_render
            ;;
        "fly")
            deploy_fly
            ;;
        "production")
            deploy_render
            deploy_fly
            ;;
        *)
            log_info "Creating deployment package only"
            ;;
    esac

    # Migrate database if needed
    migrate_database

    # Create package
    create_deployment_package

    # Final health check
    health_check

    echo
    echo "================================================"
    echo "✅ Deployment preparation complete!"
    echo "================================================"
    echo
    echo "Next steps:"
    echo "1. Review deployment package in: deployment/"
    echo "2. Push to GitHub"
    echo "3. Connect to cloud platform"
    echo "4. Set environment variables"
    echo "5. Deploy!"
    echo
    echo "Deployment artifacts:"
    echo "- Docker image: ${PROJECT_NAME}-api:${TIMESTAMP}"
    echo "- APK: deployment/mobile/bom-study-tools-${TIMESTAMP}.apk"
    echo "- Package: deployment/bom-study-tools-${TIMESTAMP}.tar.gz"
}

# Run main function
main