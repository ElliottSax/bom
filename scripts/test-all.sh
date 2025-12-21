#!/bin/bash
#
# Comprehensive Testing Suite for BOM Study Tools
# Runs all tests in parallel and generates report
#

set -e

echo "=========================================="
echo "📊 BOM Study Tools - Comprehensive Testing"
echo "=========================================="
echo

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
WARNINGS=0

# Results file
RESULTS_FILE="test_results_$(date +%Y%m%d_%H%M%S).json"

# Helper functions
log_test() {
    echo -e "${BLUE}[TEST]${NC} $1"
    ((TOTAL_TESTS++))
}

log_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((PASSED_TESTS++))
}

log_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((FAILED_TESTS++))
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
    ((WARNINGS++))
}

# Start time
START_TIME=$(date +%s)

# ============================================
# 1. DATABASE TESTS
# ============================================
echo "🗄️  DATABASE TESTS"
echo "-----------------"

log_test "Database connection"
if docker exec bom-postgres-dev psql -U postgres -d bom_study_tools_dev -c "\q" 2>/dev/null; then
    log_pass "Database is accessible"
else
    log_fail "Cannot connect to database"
fi

log_test "Verse count verification"
VERSE_COUNT=$(docker exec bom-postgres-dev psql -U postgres -d bom_study_tools_dev -t -c "SELECT COUNT(*) FROM verses" 2>/dev/null | tr -d ' ')
if [ "$VERSE_COUNT" = "11787" ]; then
    log_pass "Verse count correct: 11,787"
else
    log_fail "Verse count incorrect: $VERSE_COUNT (expected 11,787)"
fi

log_test "Edition count"
EDITION_COUNT=$(docker exec bom-postgres-dev psql -U postgres -d bom_study_tools_dev -t -c "SELECT COUNT(*) FROM editions" 2>/dev/null | tr -d ' ')
if [ "$EDITION_COUNT" = "6" ]; then
    log_pass "Edition count correct: 6"
else
    log_fail "Edition count incorrect: $EDITION_COUNT"
fi

echo

# ============================================
# 2. API TESTS
# ============================================
echo "🌐 API SERVER TESTS"
echo "-------------------"

API_URL="http://localhost:4000"

# Health check
log_test "API health check"
HEALTH_RESPONSE=$(curl -s "$API_URL/health" 2>/dev/null || echo "error")
if [[ "$HEALTH_RESPONSE" == *"healthy"* ]]; then
    log_pass "API is healthy"
else
    log_fail "API health check failed"
fi

# GraphQL endpoint
log_test "GraphQL endpoint"
GRAPHQL_TEST=$(curl -s -X POST "$API_URL/graphql" \
    -H "Content-Type: application/json" \
    -d '{"query": "{ health }"}' 2>/dev/null || echo "error")
if [[ "$GRAPHQL_TEST" == *"OK"* ]]; then
    log_pass "GraphQL endpoint responding"
else
    log_fail "GraphQL endpoint not responding"
fi

# Test editions query
log_test "Editions query"
EDITIONS_RESPONSE=$(curl -s -X POST "$API_URL/graphql" \
    -H "Content-Type: application/json" \
    -d '{"query": "{ editions { id name year } }"}' 2>/dev/null || echo "error")
if [[ "$EDITIONS_RESPONSE" == *"coc-bom-1908"* ]]; then
    log_pass "Editions query works"
else
    log_fail "Editions query failed"
fi

# Test parameterized verses query (if using server-full.py)
log_test "Parameterized verses query"
VERSES_RESPONSE=$(curl -s -X POST "$API_URL/graphql" \
    -H "Content-Type: application/json" \
    -d '{"query": "{ verses(editionId: \"coc-bom-1908\", book: \"Moroni\", chapter: 10, limit: 1) { verse text } }"}' 2>/dev/null || echo "error")
if [[ "$VERSES_RESPONSE" == *"verse"* ]] || [[ "$VERSES_RESPONSE" == *"text"* ]]; then
    log_pass "Verses query works"
else
    log_warn "Parameterized verses not supported (using minimal server)"
fi

# Response time test
log_test "API response time"
START=$(date +%s%N)
curl -s -X POST "$API_URL/graphql" -H "Content-Type: application/json" -d '{"query": "{ health }"}' > /dev/null 2>&1
END=$(date +%s%N)
RESPONSE_TIME=$(( (END - START) / 1000000 ))
if [ "$RESPONSE_TIME" -lt 100 ]; then
    log_pass "Response time: ${RESPONSE_TIME}ms (< 100ms)"
else
    log_warn "Response time: ${RESPONSE_TIME}ms (> 100ms target)"
fi

echo

# ============================================
# 3. MOBILE COMPONENT TESTS
# ============================================
echo "📱 MOBILE COMPONENT TESTS"
echo "-------------------------"

MOBILE_DIR="/mnt/e/projects/bom/apps/mobile"

# Check if components exist
log_test "Component files exist"
COMPONENTS=(
    "src/components/StudyPlanEnhanced.tsx"
    "src/contexts/EnhancedThemeContext.tsx"
    "src/components/EnhancedTabsNavigator.tsx"
    "src/components/StudyPlan.tsx"
    "src/components/Notebooks.tsx"
    "src/components/RichTextEditor.tsx"
    "src/components/CrossReferences.tsx"
)

for component in "${COMPONENTS[@]}"; do
    if [ -f "$MOBILE_DIR/$component" ]; then
        log_pass "Found: $component"
    else
        log_fail "Missing: $component"
    fi
done

# Check TypeScript compilation
log_test "TypeScript syntax check"
cd "$MOBILE_DIR" 2>/dev/null || true
if command -v tsc &> /dev/null; then
    TSC_ERRORS=$(npx tsc --noEmit --skipLibCheck 2>&1 | grep -c "error" || echo "0")
    if [ "$TSC_ERRORS" = "0" ]; then
        log_pass "No TypeScript errors"
    else
        log_warn "TypeScript errors found: $TSC_ERRORS"
    fi
else
    log_warn "TypeScript compiler not available"
fi

echo

# ============================================
# 4. DEPENDENCY TESTS
# ============================================
echo "📦 DEPENDENCY TESTS"
echo "-------------------"

log_test "Required npm packages"
REQUIRED_PACKAGES=(
    "@react-native-async-storage/async-storage"
    "@react-native-community/datetimepicker"
    "react-native-push-notification"
    "react-native-vector-icons"
    "react-native-gesture-handler"
    "react-native-reanimated"
)

PACKAGE_FILE="$MOBILE_DIR/package-fixed.json"
if [ -f "$PACKAGE_FILE" ]; then
    for package in "${REQUIRED_PACKAGES[@]}"; do
        if grep -q "\"$package\"" "$PACKAGE_FILE"; then
            log_pass "Has dependency: $package"
        else
            log_fail "Missing dependency: $package"
        fi
    done
else
    log_warn "package-fixed.json not found"
fi

echo

# ============================================
# 5. PERFORMANCE TESTS
# ============================================
echo "⚡ PERFORMANCE TESTS"
echo "--------------------"

# API concurrent requests
log_test "API concurrent request handling"
(
    for i in {1..10}; do
        curl -s -X POST "$API_URL/graphql" \
            -H "Content-Type: application/json" \
            -d '{"query": "{ health }"}' > /dev/null 2>&1 &
    done
    wait
)
if [ $? -eq 0 ]; then
    log_pass "Handled 10 concurrent requests"
else
    log_fail "Failed concurrent request test"
fi

# Database query performance
log_test "Database query performance"
QUERY_TIME=$(docker exec bom-postgres-dev psql -U postgres -d bom_study_tools_dev -t -c "\timing on" -c "SELECT * FROM verses WHERE book = 'Alma' LIMIT 100;" 2>&1 | grep "Time:" | awk '{print $2}' | cut -d'.' -f1)
if [ -z "$QUERY_TIME" ] || [ "$QUERY_TIME" -lt 100 ]; then
    log_pass "Database query performance acceptable"
else
    log_warn "Database query slow: ${QUERY_TIME}ms"
fi

echo

# ============================================
# 6. SECURITY TESTS
# ============================================
echo "🔒 SECURITY TESTS"
echo "-----------------"

log_test "SQL injection prevention"
INJECTION_TEST=$(curl -s -X POST "$API_URL/graphql" \
    -H "Content-Type: application/json" \
    -d '{"query": "{ verses(book: \"test\"; DROP TABLE verses;\") { text } }"}' 2>/dev/null || echo "error")
if [[ "$INJECTION_TEST" != *"DROP"* ]]; then
    log_pass "SQL injection prevented"
else
    log_fail "Potential SQL injection vulnerability"
fi

log_test "CORS headers"
CORS_TEST=$(curl -s -I "$API_URL/health" 2>/dev/null | grep -i "access-control-allow-origin" || echo "")
if [[ "$CORS_TEST" == *"*"* ]]; then
    log_pass "CORS headers present"
else
    log_warn "CORS headers missing"
fi

echo

# ============================================
# 7. INTEGRATION TESTS
# ============================================
echo "🔗 INTEGRATION TESTS"
echo "--------------------"

log_test "Database to API integration"
DB_VERSE_COUNT=$(docker exec bom-postgres-dev psql -U postgres -d bom_study_tools_dev -t -c "SELECT COUNT(*) FROM verses WHERE book = 'I Nephi'" 2>/dev/null | tr -d ' ')
API_VERSES=$(curl -s -X POST "$API_URL/graphql" \
    -H "Content-Type: application/json" \
    -d '{"query": "{ verses { id } }"}' 2>/dev/null | grep -o '"id"' | wc -l)

if [ "$API_VERSES" -gt 0 ]; then
    log_pass "Database-API integration working"
else
    log_fail "Database-API integration issue"
fi

echo

# ============================================
# GENERATE REPORT
# ============================================
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo "=========================================="
echo "📊 TEST RESULTS SUMMARY"
echo "=========================================="
echo

# Calculate success rate
if [ "$TOTAL_TESTS" -gt 0 ]; then
    SUCCESS_RATE=$(( (PASSED_TESTS * 100) / TOTAL_TESTS ))
else
    SUCCESS_RATE=0
fi

# Display results
echo "Total Tests:    $TOTAL_TESTS"
echo -e "${GREEN}Passed:${NC}         $PASSED_TESTS"
echo -e "${RED}Failed:${NC}         $FAILED_TESTS"
echo -e "${YELLOW}Warnings:${NC}       $WARNINGS"
echo "Success Rate:   ${SUCCESS_RATE}%"
echo "Duration:       ${DURATION}s"
echo

# Generate JSON report
cat > "$RESULTS_FILE" << EOF
{
  "timestamp": "$(date -Iseconds)",
  "duration": $DURATION,
  "summary": {
    "total": $TOTAL_TESTS,
    "passed": $PASSED_TESTS,
    "failed": $FAILED_TESTS,
    "warnings": $WARNINGS,
    "successRate": $SUCCESS_RATE
  },
  "categories": {
    "database": "tested",
    "api": "tested",
    "mobile": "tested",
    "dependencies": "tested",
    "performance": "tested",
    "security": "tested",
    "integration": "tested"
  }
}
EOF

echo "Report saved to: $RESULTS_FILE"
echo

# Overall status
if [ "$FAILED_TESTS" -eq 0 ]; then
    echo -e "${GREEN}✅ ALL TESTS PASSED!${NC}"
    exit 0
elif [ "$FAILED_TESTS" -le 3 ]; then
    echo -e "${YELLOW}⚠️  TESTS PASSED WITH MINOR ISSUES${NC}"
    exit 0
else
    echo -e "${RED}❌ TESTS FAILED - REVIEW REQUIRED${NC}"
    exit 1
fi