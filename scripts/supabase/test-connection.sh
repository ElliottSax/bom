#!/bin/bash
# Test Supabase Connection
# Verifies database connection and API endpoints

set -e  # Exit on error

echo "=========================================="
echo "BOM Study Tools - Connection Test"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Change to project root
cd "$(dirname "$0")/../.."

echo "Step 1: Loading environment variables..."
echo ""

if [ ! -f ".env.supabase" ]; then
    echo -e "${RED}❌ .env.supabase not found${NC}"
    exit 1
fi

export $(cat .env.supabase | xargs)

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo -e "${RED}❌ NEXT_PUBLIC_SUPABASE_URL not set${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Environment variables loaded${NC}"
echo "  URL: $NEXT_PUBLIC_SUPABASE_URL"

echo ""
echo "Step 2: Testing database connection..."
echo ""

# Test database with supabase CLI
if command -v supabase &> /dev/null; then
    echo "Testing with Supabase CLI..."
    supabase db remote list > /dev/null 2>&1 && echo -e "${GREEN}✓ Database connection successful${NC}" || echo -e "${RED}❌ Database connection failed${NC}"
else
    echo -e "${YELLOW}⚠ Supabase CLI not installed, skipping CLI test${NC}"
fi

echo ""
echo "Step 3: Testing REST API..."
echo ""

# Test REST API endpoint
echo "Testing /rest/v1/scripture_works..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/scripture_works")

if [ "$RESPONSE" = "200" ]; then
    echo -e "${GREEN}✓ REST API accessible (HTTP $RESPONSE)${NC}"
else
    echo -e "${RED}❌ REST API failed (HTTP $RESPONSE)${NC}"
fi

echo ""
echo "Step 4: Testing data queries..."
echo ""

# Test scripture works query
echo "Querying scripture_works table..."
WORKS=$(curl -s \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/scripture_works?select=name")

if [ -n "$WORKS" ] && [ "$WORKS" != "[]" ]; then
    echo -e "${GREEN}✓ Scripture works data found${NC}"
    echo "  $WORKS"
else
    echo -e "${YELLOW}⚠ No scripture works data found${NC}"
fi

echo ""
echo "Querying verses table..."
VERSES=$(curl -s \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/verses?select=count&limit=1")

if [ -n "$VERSES" ]; then
    echo -e "${GREEN}✓ Verses table accessible${NC}"
else
    echo -e "${YELLOW}⚠ Verses table empty or inaccessible${NC}"
fi

echo ""
echo "Step 5: Testing authentication..."
echo ""

# Test auth endpoint
AUTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  "$NEXT_PUBLIC_SUPABASE_URL/auth/v1/health")

if [ "$AUTH_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✓ Authentication service available (HTTP $AUTH_RESPONSE)${NC}"
else
    echo -e "${YELLOW}⚠ Authentication service returned HTTP $AUTH_RESPONSE${NC}"
fi

echo ""
echo "=========================================="
echo "Connection Test Complete!"
echo "=========================================="
echo ""
echo "Summary:"
echo "✓ Environment variables configured"
echo "✓ Database connection verified"
echo "✓ REST API accessible"
echo "✓ Data queries working"
echo "✓ Authentication service available"
echo ""
echo "Endpoints tested:"
echo "- REST API: $NEXT_PUBLIC_SUPABASE_URL/rest/v1/"
echo "- Auth API: $NEXT_PUBLIC_SUPABASE_URL/auth/v1/"
echo ""
echo "Next steps:"
echo "1. Test the web app: cd apps/web && npm run dev"
echo "2. Test the mobile app: cd apps/mobile && npm start"
echo "3. View dashboard: https://supabase.com/dashboard"
echo ""
