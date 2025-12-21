#!/bin/bash

# Performance Testing Script for API
# Tests response times, concurrent requests, and load handling

API_URL="http://localhost:4000"
GRAPHQL_URL="$API_URL/graphql"

echo "========================================="
echo "     API PERFORMANCE TEST SUITE"
echo "     $(date)"
echo "========================================="

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Function to measure response time
measure_time() {
    local start=$(date +%s%N)
    "$@" > /dev/null 2>&1
    local end=$(date +%s%N)
    echo $(((end - start) / 1000000)) # Convert to milliseconds
}

echo ""
echo "1. SINGLE REQUEST PERFORMANCE"
echo "-----------------------------------------"

# Test health endpoint
echo -n "Health endpoint: "
time_ms=$(measure_time curl -s $API_URL/health)
if [ $time_ms -lt 100 ]; then
    echo -e "${GREEN}${time_ms}ms${NC} ✅"
elif [ $time_ms -lt 500 ]; then
    echo -e "${YELLOW}${time_ms}ms${NC} ⚠️"
else
    echo -e "${RED}${time_ms}ms${NC} ❌"
fi

# Test simple GraphQL query
echo -n "Simple GraphQL query: "
time_ms=$(measure_time curl -s -X POST $GRAPHQL_URL \
    -H "Content-Type: application/json" \
    -d '{"query": "{ editions { id } }"}')
if [ $time_ms -lt 200 ]; then
    echo -e "${GREEN}${time_ms}ms${NC} ✅"
elif [ $time_ms -lt 1000 ]; then
    echo -e "${YELLOW}${time_ms}ms${NC} ⚠️"
else
    echo -e "${RED}${time_ms}ms${NC} ❌"
fi

# Test complex query
echo -n "Complex query (100 verses): "
time_ms=$(measure_time curl -s -X POST $GRAPHQL_URL \
    -H "Content-Type: application/json" \
    -d '{"query": "{ verses(editionId: \"coc-bom-1908\", limit: 100) { id book chapter verse text } }"}')
if [ $time_ms -lt 500 ]; then
    echo -e "${GREEN}${time_ms}ms${NC} ✅"
elif [ $time_ms -lt 2000 ]; then
    echo -e "${YELLOW}${time_ms}ms${NC} ⚠️"
else
    echo -e "${RED}${time_ms}ms${NC} ❌"
fi

# Test large query
echo -n "Large query (1000 verses): "
time_ms=$(measure_time curl -s -X POST $GRAPHQL_URL \
    -H "Content-Type: application/json" \
    -d '{"query": "{ verses(editionId: \"coc-bom-1908\", limit: 1000) { id text } }"}')
if [ $time_ms -lt 2000 ]; then
    echo -e "${GREEN}${time_ms}ms${NC} ✅"
elif [ $time_ms -lt 5000 ]; then
    echo -e "${YELLOW}${time_ms}ms${NC} ⚠️"
else
    echo -e "${RED}${time_ms}ms${NC} ❌"
fi

echo ""
echo "2. CONCURRENT REQUESTS TEST"
echo "-----------------------------------------"

# Function to run concurrent requests
run_concurrent() {
    local num_requests=$1
    local query=$2
    local description=$3

    echo -n "$description ($num_requests concurrent): "

    local start=$(date +%s%N)

    # Launch background requests
    for i in $(seq 1 $num_requests); do
        curl -s -X POST $GRAPHQL_URL \
            -H "Content-Type: application/json" \
            -d "{\"query\": \"$query\"}" > /dev/null 2>&1 &
    done

    # Wait for all background jobs
    wait

    local end=$(date +%s%N)
    local total_ms=$(((end - start) / 1000000))
    local avg_ms=$((total_ms / num_requests))

    if [ $avg_ms -lt 500 ]; then
        echo -e "${GREEN}Total: ${total_ms}ms, Avg: ${avg_ms}ms${NC} ✅"
    elif [ $avg_ms -lt 2000 ]; then
        echo -e "${YELLOW}Total: ${total_ms}ms, Avg: ${avg_ms}ms${NC} ⚠️"
    else
        echo -e "${RED}Total: ${total_ms}ms, Avg: ${avg_ms}ms${NC} ❌"
    fi
}

# Test with different concurrency levels
run_concurrent 5 "{ editions { id name } }" "Light queries"
run_concurrent 10 "{ editions { id name } }" "Moderate load"
run_concurrent 20 "{ verses(limit: 10) { id text } }" "Heavy load"
run_concurrent 10 "{ verses(editionId: \\\"coc-bom-1908\\\", limit: 100) { id text } }" "Complex concurrent"

echo ""
echo "3. SUSTAINED LOAD TEST"
echo "-----------------------------------------"

echo "Running 100 requests over 10 seconds..."

total_success=0
total_failed=0
response_times=()

for i in $(seq 1 100); do
    start=$(date +%s%N)

    if curl -s -X POST $GRAPHQL_URL \
        -H "Content-Type: application/json" \
        -d '{"query": "{ verses(limit: 50) { id } }"}' > /dev/null 2>&1; then
        total_success=$((total_success + 1))
    else
        total_failed=$((total_failed + 1))
    fi

    end=$(date +%s%N)
    response_time=$(((end - start) / 1000000))
    response_times+=($response_time)

    # Brief pause between requests
    sleep 0.1
done

# Calculate statistics
sum=0
min=${response_times[0]}
max=${response_times[0]}

for time in "${response_times[@]}"; do
    sum=$((sum + time))
    if [ $time -lt $min ]; then min=$time; fi
    if [ $time -gt $max ]; then max=$time; fi
done

avg=$((sum / ${#response_times[@]}))

echo "Results:"
echo "  Successful: $total_success"
echo "  Failed: $total_failed"
echo "  Min response: ${min}ms"
echo "  Max response: ${max}ms"
echo "  Avg response: ${avg}ms"

if [ $total_failed -eq 0 ] && [ $avg -lt 500 ]; then
    echo -e "  Status: ${GREEN}EXCELLENT${NC} ✅"
elif [ $total_failed -eq 0 ] && [ $avg -lt 1000 ]; then
    echo -e "  Status: ${YELLOW}GOOD${NC} ⚠️"
else
    echo -e "  Status: ${RED}NEEDS IMPROVEMENT${NC} ❌"
fi

echo ""
echo "4. MEMORY & RESOURCE TEST"
echo "-----------------------------------------"

# Get process info if server is local
SERVER_PID=$(pgrep -f "python.*server-full.py" | head -1)

if [ -n "$SERVER_PID" ]; then
    echo "Server process ID: $SERVER_PID"

    # Get memory usage
    MEM_USAGE=$(ps -o rss= -p $SERVER_PID | awk '{print $1/1024 "MB"}')
    echo "Memory usage: $MEM_USAGE"

    # Get CPU usage
    CPU_USAGE=$(ps -o %cpu= -p $SERVER_PID)
    echo "CPU usage: ${CPU_USAGE}%"

    # Check for memory leaks - run some requests and check again
    echo ""
    echo "Testing for memory leaks (running 50 requests)..."

    MEM_BEFORE=$(ps -o rss= -p $SERVER_PID)

    for i in $(seq 1 50); do
        curl -s -X POST $GRAPHQL_URL \
            -H "Content-Type: application/json" \
            -d '{"query": "{ verses(limit: 100) { id text } }"}' > /dev/null 2>&1
    done

    sleep 2

    MEM_AFTER=$(ps -o rss= -p $SERVER_PID)
    MEM_INCREASE=$((MEM_AFTER - MEM_BEFORE))
    MEM_INCREASE_MB=$((MEM_INCREASE / 1024))

    echo "Memory increase: ${MEM_INCREASE_MB}MB"

    if [ $MEM_INCREASE_MB -lt 10 ]; then
        echo -e "Memory stability: ${GREEN}STABLE${NC} ✅"
    elif [ $MEM_INCREASE_MB -lt 50 ]; then
        echo -e "Memory stability: ${YELLOW}MINOR INCREASE${NC} ⚠️"
    else
        echo -e "Memory stability: ${RED}POSSIBLE LEAK${NC} ❌"
    fi
else
    echo "Server process not found locally"
fi

echo ""
echo "5. ERROR HANDLING TEST"
echo "-----------------------------------------"

# Test malformed query
echo -n "Malformed query handling: "
if curl -s -X POST $GRAPHQL_URL \
    -H "Content-Type: application/json" \
    -d '{"query": "{ invalid syntax }"}' 2>&1 | grep -q "error"; then
    echo -e "${GREEN}Proper error response${NC} ✅"
else
    echo -e "${RED}No error response${NC} ❌"
fi

# Test invalid JSON
echo -n "Invalid JSON handling: "
if curl -s -X POST $GRAPHQL_URL \
    -H "Content-Type: application/json" \
    -d 'not valid json' 2>&1 | grep -q "error"; then
    echo -e "${GREEN}Proper error response${NC} ✅"
else
    echo -e "${RED}No error response${NC} ❌"
fi

# Test large payload
echo -n "Large payload handling: "
LARGE_QUERY=$(printf '{"query": "{ verses(editionId: \"%s\") { id } }"}' $(printf 'x%.0s' {1..10000}))
if curl -s -X POST $GRAPHQL_URL \
    -H "Content-Type: application/json" \
    -d "$LARGE_QUERY" --max-time 5 > /dev/null 2>&1; then
    echo -e "${GREEN}Handled large payload${NC} ✅"
else
    echo -e "${YELLOW}Timeout or error${NC} ⚠️"
fi

echo ""
echo "========================================="
echo "     PERFORMANCE TEST COMPLETE"
echo "========================================="