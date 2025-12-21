#!/bin/bash
# Stop all development services

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║         BOM Study Tools - Stop Development Services         ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Stop API server
echo "🛑 Stopping API server..."
pkill -f "server-minimal.py" 2>/dev/null && echo -e "${GREEN}✅ API server stopped${NC}" || echo -e "${YELLOW}⚠️  API server not running${NC}"

# Stop Metro bundler
echo "🛑 Stopping Metro bundler..."
pkill -f "react-native" 2>/dev/null && echo -e "${GREEN}✅ Metro stopped${NC}" || echo -e "${YELLOW}⚠️  Metro not running${NC}"
pkill -f "metro" 2>/dev/null

# Ask about database
echo ""
echo "Stop database containers? (y/n)"
read -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🛑 Stopping database containers..."
    docker stop bom-postgres-dev bom-redis-dev 2>/dev/null && \
        echo -e "${GREEN}✅ Database containers stopped${NC}" || \
        echo -e "${YELLOW}⚠️  Containers not running${NC}"
else
    echo -e "${YELLOW}⚠️  Leaving database containers running${NC}"
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║                ✅ Development Services Stopped               ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "To start again: ./scripts/dev-start.sh"
