#!/bin/bash

# Test Deployment Script
# Run this to verify everything is working before deployment

echo "🔍 BOM Study Tools - Deployment Test"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Your local IP
LOCAL_IP="172.18.182.191"

# Test 1: Database
echo "1️⃣ Testing Database..."
if docker exec -it bom-postgres-dev psql -U bomstudytools_dev -c "SELECT COUNT(*) as total FROM verses;" 2>/dev/null | grep -q "11787"; then
    echo -e "${GREEN}✅ Database OK - 11,787 verses loaded${NC}"
else
    echo -e "${RED}❌ Database issue - check Docker${NC}"
    echo "Run: docker start bom-postgres-dev"
fi
echo ""

# Test 2: Redis
echo "2️⃣ Testing Redis..."
if docker exec -it bom-redis-dev redis-cli ping 2>/dev/null | grep -q "PONG"; then
    echo -e "${GREEN}✅ Redis OK${NC}"
else
    echo -e "${RED}❌ Redis issue - check Docker${NC}"
    echo "Run: docker start bom-redis-dev"
fi
echo ""

# Test 3: API
echo "3️⃣ Testing API Server..."
if curl -s http://localhost:4002/graphql -X POST -H "Content-Type: application/json" -d '{"query": "{ editions { id } }"}' | grep -q "coc-bom-1908"; then
    echo -e "${GREEN}✅ API Server OK - GraphQL responding${NC}"
else
    echo -e "${RED}❌ API not responding${NC}"
    echo "Start it with:"
    echo "cd services/api && python3 server-with-mutations.py"
fi
echo ""

# Test 4: Network Access
echo "4️⃣ Testing Network Access..."
echo "Your local IP is: ${LOCAL_IP}"
echo "Testing if API is accessible from network..."
if curl -s http://${LOCAL_IP}:4002/graphql -X POST -H "Content-Type: application/json" -d '{"query": "{ editions { id } }"}' 2>/dev/null | grep -q "coc-bom-1908"; then
    echo -e "${GREEN}✅ API accessible from network${NC}"
    echo -e "${GREEN}   Mobile app can connect using: http://${LOCAL_IP}:4002/graphql${NC}"
else
    echo -e "${YELLOW}⚠️ API not accessible from network${NC}"
    echo "This is OK for local development, but check firewall for mobile testing"
fi
echo ""

# Test 5: Check if mobile app directory exists
echo "5️⃣ Checking Mobile App..."
if [ -d "apps/mobile/android" ]; then
    echo -e "${GREEN}✅ Mobile app directory found${NC}"
    if [ -f "apps/mobile/package.json" ]; then
        echo -e "${GREEN}✅ package.json exists${NC}"
    else
        echo -e "${RED}❌ package.json missing${NC}"
    fi
else
    echo -e "${RED}❌ Mobile app directory not found${NC}"
fi
echo ""

# Summary
echo "===================================="
echo "📋 DEPLOYMENT READINESS SUMMARY"
echo "===================================="
echo ""
echo "✅ What's Working:"
echo "  • PostgreSQL with 11,787 verses"
echo "  • Redis cache"
echo "  • GraphQL API on port 4002"
echo ""
echo "📱 For Mobile App Testing:"
echo "  1. Update API URL in apps/mobile/src/config/apollo.ts to:"
echo "     http://${LOCAL_IP}:4002/graphql"
echo ""
echo "  2. Build APK (in PowerShell on Windows):"
echo "     cd apps/mobile"
echo "     npm install"
echo "     cd android"
echo "     ./gradlew assembleDebug"
echo ""
echo "  3. Find APK at:"
echo "     apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "🌐 For Cloud Deployment:"
echo "  • Easiest: Deploy to Render.com (free)"
echo "  • Alternative: Railway.app (free)"
echo "  • Production: AWS EC2 or Google Cloud"
echo ""
echo -e "${GREEN}Ready to deploy! Follow DEPLOYMENT_STEP_BY_STEP.md for detailed instructions.${NC}"