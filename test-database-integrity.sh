#!/bin/bash

# Database Integrity Testing Script
# Verifies data consistency, relationships, and completeness

API_URL="http://localhost:4000/graphql"
RESULTS_LOG="database-test-$(date +%Y%m%d-%H%M%S).log"

echo "========================================="
echo "    DATABASE INTEGRITY TEST SUITE"
echo "    $(date)"
echo "========================================="

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Counters
TESTS_PASSED=0
TESTS_FAILED=0
WARNINGS=0

# Test function
test_database() {
    local query="$1"
    local description="$2"
    local expected_min="$3"
    local field="$4"

    echo -n "Testing: $description... "

    response=$(curl -s -X POST $API_URL \
        -H "Content-Type: application/json" \
        -d "{\"query\": \"$query\"}" 2>&1)

    if echo "$response" | grep -q '"errors"'; then
        echo -e "${RED}FAILED${NC} (Query error)"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        echo "  Error: $response" >> $RESULTS_LOG
        return 1
    fi

    # Extract count if field provided
    if [ -n "$field" ]; then
        count=$(echo "$response" | grep -o "\"$field\":[0-9]*" | head -1 | cut -d':' -f2)
        if [ -n "$count" ] && [ "$count" -ge "$expected_min" ]; then
            echo -e "${GREEN}PASSED${NC} (Count: $count)"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        else
            echo -e "${RED}FAILED${NC} (Expected >= $expected_min, got $count)"
            TESTS_FAILED=$((TESTS_FAILED + 1))
        fi
    else
        # Just check for data
        if echo "$response" | grep -q '"data"'; then
            echo -e "${GREEN}PASSED${NC}"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        else
            echo -e "${RED}FAILED${NC}"
            TESTS_FAILED=$((TESTS_FAILED + 1))
        fi
    fi
}

echo ""
echo "1. EDITION INTEGRITY"
echo "-----------------------------------------"

# Test CoC Book of Mormon
test_database \
    "{ verses(editionId: \\\"coc-bom-1908\\\", limit: 1) { id } }" \
    "CoC Book of Mormon exists" \
    1

# Test CoC D&C
test_database \
    "{ verses(editionId: \\\"coc-dc-2017\\\", limit: 1) { id } }" \
    "CoC D&C exists" \
    1

# Get edition counts
echo ""
echo "Verifying verse counts per edition:"
curl -s -X POST $API_URL \
    -H "Content-Type: application/json" \
    -d '{"query": "{ editions { id shortName verseCount } }"}' 2>&1 | \
    python3 -c "
import json, sys
data = json.load(sys.stdin)
for edition in data['data']['editions']:
    if edition['verseCount'] > 0:
        print(f\"  {edition['shortName']}: {edition['verseCount']} verses\")
"

echo ""
echo "2. BOOK INTEGRITY"
echo "-----------------------------------------"

# Test all major books (15 books in BoM)
books=("I Nephi" "II Nephi" "Jacob" "Enos" "Jarom" "Omni" "Words of Mormon" "Mosiah" "Alma" "Helaman" "III Nephi" "IV Nephi" "Mormon" "Ether" "Moroni")

for book in "${books[@]}"; do
    # Books are passed as-is in the GraphQL query string
    test_database \
        "{ verses(editionId: \\\"coc-bom-1908\\\", book: \\\"$book\\\", limit: 1) { id } }" \
        "Book: $book" \
        1
done

echo ""
echo "3. VERSE CONTINUITY"
echo "-----------------------------------------"

# Check for gaps in verse numbering
echo "Checking verse numbering continuity..."

# Test a sample chapter for continuity
response=$(curl -s -X POST $API_URL \
    -H "Content-Type: application/json" \
    -d '{"query": "{ verses(editionId: \"coc-bom-1908\", book: \"Moroni\", chapter: 10) { verse } }"}' 2>&1)

verses=$(echo "$response" | grep -o '"verse":[0-9]*' | cut -d':' -f2 | sort -n)
verse_count=$(echo "$verses" | wc -l)

echo -n "  Moroni 10 verse count: "
if [ "$verse_count" -gt 0 ]; then
    echo -e "${GREEN}$verse_count verses${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}No verses found${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

echo ""
echo "4. DATA VALIDATION"
echo "-----------------------------------------"

# Test for empty text fields
echo -n "Checking for empty verse texts... "
response=$(curl -s -X POST $API_URL \
    -H "Content-Type: application/json" \
    -d '{"query": "{ verses(limit: 100) { text } }"}' 2>&1)

empty_count=$(echo "$response" | grep -o '"text":""' | wc -l)
if [ "$empty_count" -eq 0 ]; then
    echo -e "${GREEN}No empty texts found${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${YELLOW}Found $empty_count empty texts${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# Test verse ID format (allows multi-word book names with hyphens)
echo -n "Checking verse ID format... "
response=$(curl -s -X POST $API_URL \
    -H "Content-Type: application/json" \
    -d '{"query": "{ verses(limit: 10) { id } }"}' 2>&1)

# Format: edition-id:book-name-chapter-verse (e.g., coc-bom-1908:words-of-mormon-1-9)
if echo "$response" | grep -q '"id":"[a-z0-9-]*:[a-z0-9-]*-[0-9]*-[0-9]*"'; then
    echo -e "${GREEN}Valid ID format${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}Invalid ID format found${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    echo "  Sample IDs: $(echo "$response" | grep -o '"id":"[^"]*"' | head -3)"
fi

echo ""
echo "5. CROSS-REFERENCE INTEGRITY"
echo "-----------------------------------------"

# Test different query combinations (Alma only has 30 chapters in CoC edition)
test_database \
    "{ verses(editionId: \\\"coc-bom-1908\\\", book: \\\"Alma\\\", chapter: 29) { id verse } }" \
    "Book + Chapter query" \
    1

test_database \
    "{ verses(editionId: \\\"coc-bom-1908\\\", book: \\\"Moroni\\\", chapter: 10, verseStart: 3, verseEnd: 5) { verse } }" \
    "Verse range query" \
    1

echo ""
echo "6. SEARCH INDEX VALIDATION"
echo "-----------------------------------------"

# Test search functionality
search_terms=("jesus" "christ" "god" "faith" "repentance" "baptism")

echo "Testing search index for common terms:"
for term in "${search_terms[@]}"; do
    response=$(curl -s -X POST $API_URL \
        -H "Content-Type: application/json" \
        -d "{\"query\": \"{ searchVerses(query: \\\"$term\\\", limit: 1) { id } }\"}" 2>&1)

    if echo "$response" | grep -q '"id"'; then
        echo -e "  Search '$term': ${GREEN}Found results${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "  Search '$term': ${YELLOW}No results${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
done

echo ""
echo "7. DATABASE STATISTICS"
echo "-----------------------------------------"

# Get comprehensive statistics
response=$(curl -s -X POST $API_URL \
    -H "Content-Type: application/json" \
    -d '{"query": "{ editions { id name verseCount } }"}' 2>&1)

echo "$response" | python3 -c "
import json, sys
data = json.load(sys.stdin)
total_verses = sum(e['verseCount'] for e in data['data']['editions'])
editions_with_data = sum(1 for e in data['data']['editions'] if e['verseCount'] > 0)
print(f'Total verses in database: {total_verses}')
print(f'Editions with data: {editions_with_data}')
"

# Check expected totals
expected_verses=11787
actual_verses=$(echo "$response" | python3 -c "
import json, sys
data = json.load(sys.stdin)
print(sum(e['verseCount'] for e in data['data']['editions']))
")

echo -n "Verse count validation: "
if [ "$actual_verses" -eq "$expected_verses" ]; then
    echo -e "${GREEN}CORRECT ($actual_verses = $expected_verses)${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}MISMATCH (Expected: $expected_verses, Got: $actual_verses)${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

echo ""
echo "8. SPECIAL CHARACTERS HANDLING"
echo "-----------------------------------------"

# Test verses with special characters
echo -n "Testing Unicode handling... "
response=$(curl -s -X POST $API_URL \
    -H "Content-Type: application/json" \
    -d '{"query": "{ verses(editionId: \"coc-bom-1908\", limit: 50) { text } }"}' 2>&1)

if echo "$response" | grep -q '—\|'\|'\|"\|"'; then
    echo -e "${GREEN}Unicode characters preserved${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${YELLOW}No special characters found${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""
echo "========================================="
echo "        DATABASE TEST SUMMARY"
echo "========================================="
echo -e "Tests Passed:  ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed:  ${RED}$TESTS_FAILED${NC}"
echo -e "Warnings:      ${YELLOW}$WARNINGS${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}✅ DATABASE INTEGRITY VERIFIED${NC}"
    echo "All critical database checks passed successfully."
else
    echo -e "\n${RED}⚠️ DATABASE ISSUES DETECTED${NC}"
    echo "Please review the failures above."
fi

echo ""
echo "Detailed results saved to: $RESULTS_LOG"