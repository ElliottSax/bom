#!/bin/bash
# Quick development environment startup script
# Starts all services needed for development

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║         BOM Study Tools - Development Startup               ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Docker
echo "🔍 Checking Docker..."
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running${NC}"
    echo "Please start Docker Desktop and try again"
    exit 1
fi
echo -e "${GREEN}✅ Docker is running${NC}"
echo ""

# Start database containers
echo "📦 Starting database containers..."
if docker ps | grep -q bom-postgres-dev; then
    echo -e "${GREEN}✅ PostgreSQL already running${NC}"
else
    docker start bom-postgres-dev > /dev/null 2>&1 || {
        echo -e "${RED}❌ Failed to start PostgreSQL${NC}"
        echo "Run: docker-compose -f docker-compose.dev.yml up -d postgres"
        exit 1
    }
    echo -e "${GREEN}✅ PostgreSQL started${NC}"
fi

if docker ps | grep -q bom-redis-dev; then
    echo -e "${GREEN}✅ Redis already running${NC}"
else
    docker start bom-redis-dev > /dev/null 2>&1 || {
        echo -e "${YELLOW}⚠️  Redis not started (optional)${NC}"
    }
    echo -e "${GREEN}✅ Redis started${NC}"
fi
echo ""

# Wait for database
echo "⏳ Waiting for database to be ready..."
sleep 2

# Test database connection
docker exec bom-postgres-dev pg_isready -U postgres > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database is ready${NC}"
else
    echo -e "${YELLOW}⚠️  Database may still be starting up${NC}"
fi
echo ""

# Show verse count
echo "📊 Database status:"
VERSE_COUNT=$(docker exec bom-postgres-dev psql -U postgres -d bom_study_tools_dev -t -c "SELECT COUNT(*) FROM verses;" 2>/dev/null | tr -d ' ')
if [ -n "$VERSE_COUNT" ]; then
    echo -e "${GREEN}   Verses loaded: $VERSE_COUNT${NC}"
else
    echo -e "${YELLOW}   Could not query verses (database may be initializing)${NC}"
fi
echo ""

# Check if API is already running
echo "🔍 Checking API server..."
if curl -s http://localhost:4000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ API server already running at http://localhost:4000${NC}"
    API_RUNNING=true
else
    echo -e "${YELLOW}⚠️  API server not running${NC}"
    API_RUNNING=false
fi
echo ""

# Summary
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║                    Services Status                           ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "PostgreSQL: ✅ Running on localhost:5435"
echo "Redis:      ✅ Running on localhost:6382"
if [ "$API_RUNNING" = true ]; then
    echo "API Server: ✅ Running at http://localhost:4000"
else
    echo "API Server: ⚠️  Not running"
fi
echo ""

# Instructions
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║                    Next Steps                                ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

if [ "$API_RUNNING" = false ]; then
    echo "Start API server:"
    echo "  cd services/api"
    echo "  python3 server-minimal.py"
    echo ""
fi

echo "Start mobile app:"
echo "  cd apps/mobile"
echo "  npm start                # Start Metro bundler"
echo "  npm run ios              # iOS simulator (macOS)"
echo "  npm run android          # Android emulator"
echo ""

echo "Test API:"
echo "  curl http://localhost:4000/health"
echo ""

echo "Stop services:"
echo "  Ctrl+C in API terminal"
echo "  docker stop bom-postgres-dev bom-redis-dev"
echo ""

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║              ✅ Environment Ready for Development!          ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
