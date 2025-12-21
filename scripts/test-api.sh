#!/bin/bash
# Test API server functionality
# Runs through all available queries and reports results

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║              API Server Test Suite                          ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

API_URL="http://localhost:4000"
PASSED=0
FAILED=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test function
test_query() {
    local name="$1"
    local query="$2"
    local expected="$3"

    echo -n "Testing $name... "

    response=$(curl -s -X POST "$API_URL/graphql" \
        -H "Content-Type: application/json" \
        -d "{\"query\": \"$query\"}" 2>/dev/null)

    if [ -z "$response" ]; then
        echo -e "${RED}❌ FAILED${NC} (No response)"
        FAILED=$((FAILED + 1))
        return 1
    fi

    if echo "$response" | grep -q "$expected"; then
        echo -e "${GREEN}✅ PASSED${NC}"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        echo "   Expected: $expected"
        echo "   Got: $response"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# Test 1: Health check endpoint
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Health Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo -n "Testing /health endpoint... "
response=$(curl -s "$API_URL/health" 2>/dev/null)
if echo "$response" | grep -q "healthy"; then
    echo -e "${GREEN}✅ PASSED${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}❌ FAILED${NC}"
    FAILED=$((FAILED + 1))
fi
echo ""

# Test 2: GraphQL health
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2. GraphQL Queries"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_query "health query" "{ health }" "\"health\": \"OK\""

# Test 3: Editions
test_query "editions query" "{ editions { id name } }" "\"editions\""

# Test 4: Books
test_query "books query" "{ books { book verseCount } }" "\"books\""

# Test 5: Verses
test_query "verses query" "{ verses { id text } }" "\"verses\""

echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo "Total:  $((PASSED + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                                                              ║"
    echo "║                  ✅ All Tests Passed!                        ║"
    echo "║                                                              ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    exit 0
else
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                                                              ║"
    echo "║               ❌ Some Tests Failed                           ║"
    echo "║                                                              ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""
    echo "Troubleshooting:"
    echo "  • Is API server running? python3 services/api/server-minimal.py"
    echo "  • Is database running? docker ps | grep bom-postgres"
    echo "  • Check API logs for errors"
    exit 1
fi
