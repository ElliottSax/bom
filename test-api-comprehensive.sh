#!/bin/bash

# Comprehensive API Testing Script
# Tests all GraphQL endpoints with various parameters and edge cases

API_URL="http://localhost:4000/graphql"
RESULTS_FILE="test-results-$(date +%Y%m%d-%H%M%S).json"

echo "========================================="
echo "  COMPREHENSIVE API TEST SUITE"
echo "  $(date)"
echo "========================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_TOTAL=0
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run GraphQL query
run_query() {
    local query="$1"
    local test_name="$2"
    local expected_pattern="$3"

    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    echo -n "Testing: $test_name... "

    response=$(curl -s -X POST $API_URL \
        -H "Content-Type: application/json" \
        -d "{\"query\": \"$query\"}" 2>&1)

    if [ $? -ne 0 ]; then
        echo -e "${RED}FAILED${NC} (Connection error)"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        echo "  Error: Could not connect to API"
        return 1
    fi

    # Check for GraphQL errors
    if echo "$response" | grep -q '"errors"'; then
        echo -e "${RED}FAILED${NC} (GraphQL error)"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        echo "  Response: $response" | head -100
        return 1
    fi

    # Check for expected pattern if provided
    if [ -n "$expected_pattern" ]; then
        if echo "$response" | grep -q "$expected_pattern"; then
            echo -e "${GREEN}PASSED${NC}"
            TESTS_PASSED=$((TESTS_PASSED + 1))
            return 0
        else
            echo -e "${RED}FAILED${NC} (Missing expected data)"
            TESTS_FAILED=$((TESTS_FAILED + 1))
            echo "  Expected pattern: $expected_pattern"
            echo "  Response: $response" | head -100
            return 1
        fi
    else
        # Just check for data field
        if echo "$response" | grep -q '"data"'; then
            echo -e "${GREEN}PASSED${NC}"
            TESTS_PASSED=$((TESTS_PASSED + 1))
            return 0
        else
            echo -e "${RED}FAILED${NC}"
            TESTS_FAILED=$((TESTS_FAILED + 1))
            echo "  Response: $response" | head -100
            return 1
        fi
    fi
}

echo ""
echo "1. TESTING BASIC QUERIES"
echo "-----------------------------------------"

# Test 1: Get all editions
run_query "{ editions { id name shortName verseCount } }" \
    "Get all editions" \
    "Community of Christ"

# Test 2: Get verses without parameters
run_query "{ verses { id book chapter verse } }" \
    "Get verses (no params)" \
    "verse"

# Test 3: Get specific edition verses
run_query "{ verses(editionId: \\\"coc-bom-1908\\\") { id text } }" \
    "Get CoC BoM verses" \
    "coc-bom-1908"

echo ""
echo "2. TESTING PARAMETERIZED QUERIES"
echo "-----------------------------------------"

# Test 4: Get specific book
run_query "{ verses(editionId: \\\"coc-bom-1908\\\", book: \\\"Moroni\\\") { id chapter verse text } }" \
    "Get Moroni verses" \
    "Moroni"

# Test 5: Get specific chapter
run_query "{ verses(editionId: \\\"coc-bom-1908\\\", book: \\\"Moroni\\\", chapter: 10) { verse text } }" \
    "Get Moroni 10" \
    "text"

# Test 6: Get verse range
run_query "{ verses(editionId: \\\"coc-bom-1908\\\", book: \\\"Moroni\\\", chapter: 10, verseStart: 3, verseEnd: 5) { verse text } }" \
    "Get Moroni 10:3-5" \
    "text"

# Test 7: Test limit parameter
run_query "{ verses(editionId: \\\"coc-bom-1908\\\", limit: 5) { id } }" \
    "Get 5 verses with limit" \
    "id"

echo ""
echo "3. TESTING SEARCH FUNCTIONALITY"
echo "-----------------------------------------"

# Test 8: Search for single word
run_query "{ searchVerses(query: \\\"faith\\\") { id text } }" \
    "Search for 'faith'" \
    "verses"

# Test 9: Search with multiple words
run_query "{ searchVerses(query: \\\"faith hope charity\\\") { id text } }" \
    "Search for 'faith hope charity'" \
    "verses"

# Test 10: Search in specific edition
run_query "{ searchVerses(query: \\\"moroni\\\", editionId: \\\"coc-bom-1908\\\") { book chapter verse } }" \
    "Search 'moroni' in CoC BoM" \
    "verses"

# Test 11: Search with limit
run_query "{ searchVerses(query: \\\"jesus\\\", limit: 3) { id } }" \
    "Search 'jesus' with limit 3" \
    "verses"

echo ""
echo "4. TESTING STATISTICS QUERIES"
echo "-----------------------------------------"

# Test 12: Database statistics (using editions query)
run_query "{ editions { id name verseCount } }" \
    "Get database statistics" \
    "verseCount"

# Test 13: Book statistics (using editions query)
run_query "{ editions { id verseCount } }" \
    "Get edition statistics" \
    "verseCount"

echo ""
echo "5. TESTING EDGE CASES"
echo "-----------------------------------------"

# Test 14: Non-existent edition
run_query "{ verses(editionId: \\\"invalid-edition\\\") { id } }" \
    "Query non-existent edition" \
    ""

# Test 15: Invalid book name
run_query "{ verses(editionId: \\\"coc-bom-1908\\\", book: \\\"InvalidBook\\\") { id } }" \
    "Query invalid book name" \
    ""

# Test 16: Chapter out of range
run_query "{ verses(editionId: \\\"coc-bom-1908\\\", book: \\\"Moroni\\\", chapter: 999) { id } }" \
    "Query chapter 999" \
    ""

# Test 17: Empty search query
run_query "{ searchVerses(query: \\\"\\\") { id } }" \
    "Empty search query" \
    ""

# Test 18: Very long search query
run_query "{ searchVerses(query: \\\"this is a very long search query with many words that might cause issues in the search functionality if not handled properly\\\") { id } }" \
    "Very long search query" \
    ""

echo ""
echo "6. TESTING COMPLEX QUERIES"
echo "-----------------------------------------"

# Test 19: Multiple field selection (Alma 29 - faith chapter)
run_query "{ verses(editionId: \\\"coc-bom-1908\\\", book: \\\"Alma\\\", chapter: 29, verseStart: 1, verseEnd: 5) { id editionId book chapter verse text verseType } }" \
    "Query all verse fields" \
    "text"

# Test 20: Cross-edition query (if supported)
run_query "{ v1: verses(editionId: \\\"coc-bom-1908\\\", limit: 1) { text } v2: verses(editionId: \\\"coc-dc-2017\\\", limit: 1) { text } }" \
    "Query multiple editions" \
    "text"

echo ""
echo "7. TESTING SPECIAL CHARACTERS"
echo "-----------------------------------------"

# Test 21: Search with apostrophe
run_query "{ searchVerses(query: \\\"lord's\\\") { text } }" \
    "Search with apostrophe" \
    ""

# Test 22: Search with hyphen
run_query "{ searchVerses(query: \\\"anti-christ\\\") { text } }" \
    "Search with hyphen" \
    ""

echo ""
echo "8. TESTING PERFORMANCE QUERIES"
echo "-----------------------------------------"

# Test 23: Large result set
run_query "{ verses(editionId: \\\"coc-bom-1908\\\", limit: 1000) { id } }" \
    "Query 1000 verses" \
    "id"

# Test 24: Complex search
run_query "{ searchVerses(query: \\\"and the lord\\\", limit: 100) { id text } }" \
    "Complex search with common words" \
    ""

echo ""
echo "========================================="
echo "           TEST SUMMARY"
echo "========================================="
echo -e "Total Tests:  $TESTS_TOTAL"
echo -e "Passed:       ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed:       ${RED}$TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}✅ ALL TESTS PASSED!${NC}"
    exit 0
else
    echo -e "\n${RED}⚠️  SOME TESTS FAILED${NC}"
    exit 1
fi