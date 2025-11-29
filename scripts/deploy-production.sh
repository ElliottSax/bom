#!/bin/bash

# Production Deployment Script
# This script handles the complete production deployment process

set -e  # Exit on any error

# Color codes
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="/backup/bom"
COMPOSE_FILE="$PROJECT_ROOT/docker-compose.prod.yml"

# Functions
log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

# Header
echo ""
echo "================================================"
echo "  BOM Study Tools - Production Deployment"
echo "================================================"
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    log_error "Do not run this script as root"
    exit 1
fi

# Check if .env.production exists
if [ ! -f "$PROJECT_ROOT/.env.production" ]; then
    log_error ".env.production file not found"
    log_info "Please create .env.production with your production configuration"
    exit 1
fi

# Load environment variables
log_info "Loading environment variables..."
source "$PROJECT_ROOT/.env.production"
log_success "Environment variables loaded"

# Step 1: Pre-deployment validation
echo ""
log_info "Step 1: Running pre-deployment validation..."
if bash "$SCRIPT_DIR/validate-deployment.sh"; then
    log_success "Pre-deployment validation passed"
else
    log_error "Pre-deployment validation failed"
    exit 1
fi

# Step 2: Create required directories
echo ""
log_info "Step 2: Creating required directories..."
sudo mkdir -p /data/postgres /data/redis /data/qdrant "$BACKUP_DIR"
sudo chown -R $USER:$USER /data/postgres /data/redis /data/qdrant "$BACKUP_DIR"
chmod 700 /data/postgres /data/redis /data/qdrant
log_success "Directories created and configured"

# Step 3: Backup existing data (if upgrading)
if [ -d "/data/postgres/pgdata" ]; then
    echo ""
    log_warning "Existing data detected. Creating backup..."
    BACKUP_TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_PATH="$BACKUP_DIR/backup_$BACKUP_TIMESTAMP"

    mkdir -p "$BACKUP_PATH"

    # Backup PostgreSQL
    log_info "Backing up PostgreSQL..."
    docker exec bom-postgres-prod pg_dump -U $DB_USER $DB_NAME > "$BACKUP_PATH/database.sql" 2>/dev/null || true

    # Backup Redis
    log_info "Backing up Redis..."
    docker exec bom-redis-prod redis-cli --raw SAVE > /dev/null 2>&1 || true
    cp /data/redis/dump.rdb "$BACKUP_PATH/" 2>/dev/null || true

    log_success "Backup created at $BACKUP_PATH"
fi

# Step 4: Stop existing services
echo ""
log_info "Step 4: Stopping existing services..."
cd "$PROJECT_ROOT"
docker-compose -f "$COMPOSE_FILE" down || true
log_success "Services stopped"

# Step 5: Pull latest images
echo ""
log_info "Step 5: Pulling latest Docker images..."
docker-compose -f "$COMPOSE_FILE" pull
log_success "Images updated"

# Step 6: Build application images
echo ""
log_info "Step 6: Building application images..."
docker-compose -f "$COMPOSE_FILE" build --no-cache
log_success "Application images built"

# Step 7: Start services
echo ""
log_info "Step 7: Starting production services..."
docker-compose -f "$COMPOSE_FILE" up -d
log_success "Services started"

# Step 8: Wait for services to be healthy
echo ""
log_info "Step 8: Waiting for services to be healthy..."
sleep 10

# Check database
log_info "Checking database connection..."
RETRIES=30
while [ $RETRIES -gt 0 ]; do
    if docker exec bom-postgres-prod pg_isready -U $DB_USER > /dev/null 2>&1; then
        log_success "Database is ready"
        break
    fi
    RETRIES=$((RETRIES - 1))
    if [ $RETRIES -eq 0 ]; then
        log_error "Database failed to start"
        exit 1
    fi
    sleep 2
done

# Check Redis
log_info "Checking Redis connection..."
RETRIES=30
while [ $RETRIES -gt 0 ]; do
    if docker exec bom-redis-prod redis-cli ping > /dev/null 2>&1; then
        log_success "Redis is ready"
        break
    fi
    RETRIES=$((RETRIES - 1))
    if [ $RETRIES -eq 0 ]; then
        log_error "Redis failed to start"
        exit 1
    fi
    sleep 2
done

# Check API
log_info "Checking API health..."
RETRIES=60
while [ $RETRIES -gt 0 ]; do
    if curl -sf http://localhost:4000/health > /dev/null 2>&1; then
        log_success "API is healthy"
        break
    fi
    RETRIES=$((RETRIES - 1))
    if [ $RETRIES -eq 0 ]; then
        log_error "API failed health check"
        docker-compose -f "$COMPOSE_FILE" logs api
        exit 1
    fi
    sleep 2
done

# Step 9: Run database migrations
echo ""
log_info "Step 9: Running database migrations..."
docker exec bom-api-prod npm run db:migrate || {
    log_error "Database migration failed"
    exit 1
}
log_success "Database migrations completed"

# Step 10: Verify deployment
echo ""
log_info "Step 10: Verifying deployment..."

# Check all containers are running
CONTAINERS=$(docker-compose -f "$COMPOSE_FILE" ps -q | wc -l)
RUNNING=$(docker-compose -f "$COMPOSE_FILE" ps --filter "status=running" -q | wc -l)

if [ "$CONTAINERS" -eq "$RUNNING" ]; then
    log_success "All containers are running ($RUNNING/$CONTAINERS)"
else
    log_error "Some containers are not running ($RUNNING/$CONTAINERS)"
    docker-compose -f "$COMPOSE_FILE" ps
    exit 1
fi

# Step 11: Display service status
echo ""
echo "================================================"
echo "  Deployment Summary"
echo "================================================"
echo ""

docker-compose -f "$COMPOSE_FILE" ps

echo ""
log_success "Production deployment completed successfully!"
echo ""

# Display URLs
echo "Service URLs:"
echo "  - API: http://localhost:4000"
echo "  - API Health: http://localhost:4000/health"
echo "  - Web: http://localhost:3000"
echo ""

# Display next steps
echo "Next Steps:"
echo "  1. Configure your DNS to point to this server"
echo "  2. Ensure SSL certificates are properly configured"
echo "  3. Monitor logs: docker-compose -f $COMPOSE_FILE logs -f"
echo "  4. Set up monitoring and alerting"
echo "  5. Configure automated backups"
echo ""

# Optional: Run smoke tests
read -p "Run smoke tests? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_info "Running smoke tests..."
    bash "$SCRIPT_DIR/smoke-tests.sh" || log_warning "Some smoke tests failed"
fi

echo ""
log_success "Deployment complete!"
echo ""
