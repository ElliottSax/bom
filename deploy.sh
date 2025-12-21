#!/bin/bash

# BOM Study Tools Deployment Script
# Usage: ./deploy.sh [staging|production]

set -e

ENVIRONMENT=${1:-staging}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "🚀 Deploying BOM Study Tools - Environment: $ENVIRONMENT"
echo "Timestamp: $TIMESTAMP"

# Load environment variables
if [ "$ENVIRONMENT" = "production" ]; then
    if [ ! -f .env.production ]; then
        echo "❌ Error: .env.production file not found"
        echo "Please copy .env.production.example to .env.production and configure"
        exit 1
    fi
    source .env.production
    COMPOSE_FILE="docker-compose.prod.yml"
else
    if [ ! -f .env.staging ]; then
        cp .env.development .env.staging 2>/dev/null || true
    fi
    source .env.staging
    COMPOSE_FILE="docker-compose.staging.yml"
fi

# Function to check if service is healthy
check_health() {
    local service=$1
    local max_attempts=30
    local attempt=1

    echo "Checking health of $service..."

    while [ $attempt -le $max_attempts ]; do
        if docker-compose -f $COMPOSE_FILE ps $service | grep -q "healthy"; then
            echo "✅ $service is healthy"
            return 0
        fi
        echo "Waiting for $service to be healthy... (attempt $attempt/$max_attempts)"
        sleep 5
        attempt=$((attempt + 1))
    done

    echo "❌ $service failed to become healthy"
    return 1
}

# Backup database before deployment (production only)
if [ "$ENVIRONMENT" = "production" ]; then
    echo "📦 Creating database backup..."
    docker-compose -f $COMPOSE_FILE exec -T postgres pg_dump \
        -U $DB_USER \
        -d bom_study_tools \
        > backups/db_backup_$TIMESTAMP.sql
    echo "✅ Database backup created: backups/db_backup_$TIMESTAMP.sql"
fi

# Build and start services
echo "🔨 Building services..."
docker-compose -f $COMPOSE_FILE build --no-cache api

echo "🔄 Starting services..."
docker-compose -f $COMPOSE_FILE up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
check_health postgres
check_health redis
check_health api

# Run database migrations
echo "🗄️ Running database migrations..."
docker-compose -f $COMPOSE_FILE exec -T api npx prisma migrate deploy

# Import scripture data if database is empty
VERSE_COUNT=$(docker-compose -f $COMPOSE_FILE exec -T postgres \
    psql -U $DB_USER -d bom_study_tools -t -c \
    "SELECT COUNT(*) FROM verses;" | xargs)

if [ "$VERSE_COUNT" -eq "0" ]; then
    echo "📚 Importing scripture data..."
    # Run import scripts
    docker-compose -f $COMPOSE_FILE exec -T api node dist/scripts/import-verses.js
    echo "✅ Scripture data imported"
else
    echo "ℹ️ Database already contains $VERSE_COUNT verses"
fi

# Health check
echo "🏥 Running health checks..."
API_HEALTH=$(curl -s http://localhost:${API_PORT:-4000}/health || echo "failed")

if [[ "$API_HEALTH" == *"healthy"* ]]; then
    echo "✅ API is healthy"
else
    echo "❌ API health check failed"
    echo "Response: $API_HEALTH"
    exit 1
fi

# Display status
echo ""
echo "🎉 Deployment complete!"
echo "================================"
docker-compose -f $COMPOSE_FILE ps
echo "================================"
echo ""
echo "📊 Service URLs:"
echo "  - API: http://localhost:${API_PORT:-4000}"
echo "  - GraphQL: http://localhost:${API_PORT:-4000}/graphql"
echo ""
echo "📝 Logs:"
echo "  - View all: docker-compose -f $COMPOSE_FILE logs -f"
echo "  - View API: docker-compose -f $COMPOSE_FILE logs -f api"
echo ""
echo "🛑 To stop:"
echo "  docker-compose -f $COMPOSE_FILE down"
echo ""

# Create deployment record
echo "$TIMESTAMP | $ENVIRONMENT | $USER | Success" >> deployments.log

echo "✨ Deployment successful!"