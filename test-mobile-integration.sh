#!/bin/bash

# Mobile Component Integration Testing
# Simulates mobile app API calls and validates responses

API_URL="http://localhost:4000/graphql"

echo "========================================="
echo "  MOBILE INTEGRATION TEST SUITE"
echo "  $(date)"
echo "========================================="

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

TESTS_PASSED=0
TESTS_FAILED=0

# Test helper function
test_component() {
    local component="$1"
    local query="$2"
    local expected="$3"

    echo -n "Testing $component: "

    response=$(curl -s -X POST $API_URL \
        -H "Content-Type: application/json" \
        -d "{\"query\": \"$query\"}" 2>&1)

    if echo "$response" | grep -q "$expected"; then
        echo -e "${GREEN}PASSED${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}FAILED${NC}"
        echo "  Expected: $expected"
        echo "  Response: $(echo $response | head -c 200)..."
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

echo ""
echo "1. HOME SCREEN COMPONENT"
echo "-----------------------------------------"

# Test editions loading for home screen
test_component "Edition List" \
    "{ editions { id name shortName verseCount } }" \
    "Community of Christ"

# Test initial verse loading
test_component "Recent Verses" \
    "{ verses(limit: 5) { id book chapter verse } }" \
    "verse"

echo ""
echo "2. SCRIPTURE READER COMPONENT"
echo "-----------------------------------------"

# Test chapter loading
test_component "Chapter View" \
    "{ verses(editionId: \\\"coc-bom-1908\\\", book: \\\"Moroni\\\", chapter: 10) { id verse text } }" \
    "text"

# Test verse navigation
test_component "Verse Navigation" \
    "{ verses(editionId: \\\"coc-bom-1908\\\", book: \\\"Moroni\\\", chapter: 10, verseStart: 3, verseEnd: 5) { verse text } }" \
    "verse"

# Test single verse
test_component "Single Verse" \
    "{ verses(editionId: \\\"coc-bom-1908\\\", book: \\\"Moroni\\\", chapter: 10, verseStart: 4, verseEnd: 4) { text } }" \
    "text"

echo ""
echo "3. SEARCH COMPONENT"
echo "-----------------------------------------"

# Test basic search
test_component "Basic Search" \
    "{ searchVerses(query: \\\"faith\\\", limit: 10) { id book chapter verse } }" \
    "chapter"

# Test search with filters
test_component "Filtered Search" \
    "{ searchVerses(query: \\\"charity\\\", editionId: \\\"coc-bom-1908\\\", limit: 5) { id text } }" \
    "id"

# Test empty search
test_component "Empty Search Handling" \
    "{ searchVerses(query: \\\"\\\") { id } }" \
    "data"

echo ""
echo "4. BOOK SELECTOR COMPONENT"
echo "-----------------------------------------"

# Test book list
test_component "Book List" \
    "{ bookStatistics(editionId: \\\"coc-bom-1908\\\") { book verseCount } }" \
    "verseCount"

# Test specific book info
test_component "Book Info" \
    "{ verses(editionId: \\\"coc-bom-1908\\\", book: \\\"Alma\\\", limit: 1) { id book } }" \
    "Alma"

echo ""
echo "5. STUDY PLAN COMPONENT"
echo "-----------------------------------------"

# Simulate study plan queries
test_component "Daily Reading" \
    "{ verses(editionId: \\\"coc-bom-1908\\\", book: \\\"I Nephi\\\", chapter: 1, verseStart: 1, verseEnd: 5) { verse text } }" \
    "text"

test_component "Progress Tracking" \
    "{ verses(editionId: \\\"coc-bom-1908\\\", book: \\\"I Nephi\\\") { id } }" \
    "nephi"

echo ""
echo "6. TABS NAVIGATOR COMPONENT"
echo "-----------------------------------------"

# Simulate multiple concurrent tab queries
echo "Testing concurrent tab loading..."

# Launch multiple queries in parallel
(curl -s -X POST $API_URL -H "Content-Type: application/json" \
    -d '{"query": "{ verses(editionId: \"coc-bom-1908\", book: \"Moroni\", chapter: 10, limit: 5) { id } }"}' > /tmp/tab1.json) &
(curl -s -X POST $API_URL -H "Content-Type: application/json" \
    -d '{"query": "{ searchVerses(query: \"faith\", limit: 5) { id } }"}' > /tmp/tab2.json) &
(curl -s -X POST $API_URL -H "Content-Type: application/json" \
    -d '{"query": "{ editions { id name } }"}' > /tmp/tab3.json) &

wait

# Check all tabs loaded
all_loaded=true
for i in 1 2 3; do
    if ! grep -q '"data"' /tmp/tab$i.json 2>/dev/null; then
        all_loaded=false
    fi
done

if [ "$all_loaded" = true ]; then
    echo -e "  Concurrent tabs: ${GREEN}PASSED${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "  Concurrent tabs: ${RED}FAILED${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

rm -f /tmp/tab*.json

echo ""
echo "7. OFFLINE SYNC SIMULATION"
echo "-----------------------------------------"

# Test batch queries for offline sync
test_component "Batch Verse Fetch" \
    "{ verses(editionId: \\\"coc-bom-1908\\\", limit: 100) { id text } }" \
    "text"

test_component "Edition Metadata" \
    "{ editions { id name shortName language year verseCount } }" \
    "language"

echo ""
echo "8. CROSS-REFERENCES COMPONENT"
echo "-----------------------------------------"

# Test verse lookup for cross-references
test_component "Verse Lookup" \
    "{ verses(editionId: \\\"coc-bom-1908\\\", book: \\\"Moroni\\\", chapter: 7, verseStart: 45, verseEnd: 48) { verse text } }" \
    "text"

echo ""
echo "9. PERFORMANCE-CRITICAL QUERIES"
echo "-----------------------------------------"

# Test queries that need to be fast for good UX
echo -n "Testing quick verse load (<200ms): "
start=$(date +%s%N)
curl -s -X POST $API_URL \
    -H "Content-Type: application/json" \
    -d '{"query": "{ verses(editionId: \"coc-bom-1908\", book: \"Moroni\", chapter: 10, limit: 20) { id text } }"}' > /dev/null
end=$(date +%s%N)
time_ms=$(((end - start) / 1000000))

if [ $time_ms -lt 200 ]; then
    echo -e "${GREEN}${time_ms}ms${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}${time_ms}ms${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

echo -n "Testing search response (<500ms): "
start=$(date +%s%N)
curl -s -X POST $API_URL \
    -H "Content-Type: application/json" \
    -d '{"query": "{ searchVerses(query: \"jesus christ\", limit: 20) { id } }"}' > /dev/null
end=$(date +%s%N)
time_ms=$(((end - start) / 1000000))

if [ $time_ms -lt 500 ]; then
    echo -e "${GREEN}${time_ms}ms${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}${time_ms}ms${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

echo ""
echo "10. ERROR SCENARIOS"
echo "-----------------------------------------"

# Test error handling that components need
echo -n "Network timeout simulation: "
timeout 1 curl -s -X POST $API_URL \
    -H "Content-Type: application/json" \
    -d '{"query": "{ verses(limit: 10000) { id text } }"}' > /dev/null 2>&1

if [ $? -eq 124 ] || [ $? -eq 0 ]; then
    echo -e "${GREEN}Handled timeout${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}Unexpected error${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

echo -n "Invalid parameters handling: "
response=$(curl -s -X POST $API_URL \
    -H "Content-Type: application/json" \
    -d '{"query": "{ verses(editionId: \"invalid\", book: \"Invalid\", chapter: 999) { id } }"}' 2>&1)

if echo "$response" | grep -q '"data"'; then
    echo -e "${GREEN}Graceful handling${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}Error in response${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

echo ""
echo "========================================="
echo "    MOBILE INTEGRATION TEST SUMMARY"
echo "========================================="
echo -e "Tests Passed:  ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed:  ${RED}$TESTS_FAILED${NC}"

success_rate=$((TESTS_PASSED * 100 / (TESTS_PASSED + TESTS_FAILED)))
echo "Success Rate:  ${success_rate}%"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}✅ ALL INTEGRATION TESTS PASSED${NC}"
    echo "Mobile components can successfully integrate with the API."
elif [ $success_rate -gt 80 ]; then
    echo -e "\n${YELLOW}⚠️ MOSTLY PASSING${NC}"
    echo "Most integration tests passed. Review failures above."
else
    echo -e "\n${RED}❌ INTEGRATION ISSUES${NC}"
    echo "Significant integration problems detected."
fi