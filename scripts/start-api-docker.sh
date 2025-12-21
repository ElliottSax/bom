#!/bin/bash
# Start API server in Docker container
# Solves WSL2 /mnt/e execution issues

set -e

echo "=============================================="
echo "Starting API Server in Docker"
echo "=============================================="
echo ""

cd "$(dirname "$0")/.."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running"
    echo "Please start Docker and try again"
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Check if database is running
if ! docker ps | grep -q bom-postgres-dev; then
    echo "⚠️  PostgreSQL container not running. Starting..."
    docker start bom-postgres-dev
    echo "✅ PostgreSQL started"
    echo "⏳ Waiting for PostgreSQL to be ready..."
    sleep 3
else
    echo "✅ PostgreSQL is running"
fi

if ! docker ps | grep -q bom-redis-dev; then
    echo "⚠️  Redis container not running. Starting..."
    docker start bom-redis-dev
    echo "✅ Redis started"
else
    echo "✅ Redis is running"
fi

echo ""

# Check if API container already exists
if docker ps -a | grep -q bom-api-dev; then
    echo "🔄 API container exists. Removing old container..."
    docker rm -f bom-api-dev
    echo "✅ Old container removed"
    echo ""
fi

echo "🏗️  Building API Docker image..."
echo ""
docker-compose -f docker-compose.dev.yml build api

echo ""
echo "🚀 Starting API server..."
echo ""
docker-compose -f docker-compose.dev.yml up -d api

echo ""
echo "⏳ Waiting for API server to be ready..."
sleep 5

# Check if server is running
if docker ps | grep -q bom-api-dev; then
    echo "✅ API server is running!"
    echo ""
    echo "=============================================="
    echo "API Server Started Successfully"
    echo "=============================================="
    echo ""
    echo "📍 GraphQL Playground: http://localhost:4000"
    echo "📊 Health check: http://localhost:4000/health"
    echo ""
    echo "View logs:"
    echo "  docker logs -f bom-api-dev"
    echo ""
    echo "Stop server:"
    echo "  docker stop bom-api-dev"
    echo ""
    echo "Rebuild and restart:"
    echo "  $0"
    echo ""
else
    echo "❌ Failed to start API server"
    echo ""
    echo "Check logs:"
    echo "  docker logs bom-api-dev"
    exit 1
fi
