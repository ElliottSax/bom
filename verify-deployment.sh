#!/bin/bash
# BOM Study Tools - Deployment Verification Script

set -e

echo "============================================"
echo "BOM Study Tools - Deployment Verification"
echo "============================================"
echo ""

# Get deployment URL
if [ -z "$1" ]; then
    echo "Usage: ./verify-deployment.sh <deployment-url>"
    echo ""
    echo "Example:"
    echo "  ./verify-deployment.sh https://bom-study-tools.vercel.app"
    exit 1
fi

URL=$1
echo "Testing deployment at: $URL"
echo ""

# Function to test endpoint
test_endpoint() {
    local path=$1
    local name=$2
    local status_code=$(curl -s -o /dev/null -w "%{http_code}" "$URL$path")

    if [ "$status_code" = "200" ]; then
        echo "✅ $name"
    else
        echo "❌ $name (HTTP $status_code)"
        return 1
    fi
}

# Test main pages
echo "📄 Testing Pages..."
test_endpoint "/" "Home page"
test_endpoint "/courses" "Courses page" || true
test_endpoint "/challenges" "Challenges page" || true

echo ""

# Test API endpoints (if applicable)
echo "🔌 Testing API Connection..."
SUPABASE_URL=$(grep NEXT_PUBLIC_SUPABASE_URL .env.supabase 2>/dev/null | cut -d= -f2 || echo "")
SUPABASE_KEY=$(grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env.supabase 2>/dev/null | cut -d= -f2 || echo "")

if [ -n "$SUPABASE_URL" ] && [ -n "$SUPABASE_KEY" ]; then
    VERSE_COUNT=$(curl -s "${SUPABASE_URL}/rest/v1/verses?select=id&limit=1" \
      -H "apikey: ${SUPABASE_KEY}" 2>/dev/null | grep -c "coc-" || echo "0")

    if [ "$VERSE_COUNT" -gt "0" ]; then
        echo "✅ Supabase connection working"
    else
        echo "⚠️  Supabase connection issue or no data"
    fi
else
    echo "⚠️  Skipping Supabase check (credentials not found)"
fi

echo ""

# Test performance
echo "⚡ Testing Performance..."
RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" "$URL")
RESPONSE_MS=$(echo "$RESPONSE_TIME * 1000" | bc)

if (( $(echo "$RESPONSE_TIME < 2.0" | bc -l) )); then
    echo "✅ Response time: ${RESPONSE_MS}ms (good)"
elif (( $(echo "$RESPONSE_TIME < 5.0" | bc -l) )); then
    echo "⚠️  Response time: ${RESPONSE_MS}ms (acceptable)"
else
    echo "❌ Response time: ${RESPONSE_MS}ms (slow)"
fi

echo ""

# Check mobile viewport
echo "📱 Testing Mobile Compatibility..."
VIEWPORT=$(curl -s "$URL" | grep -c "viewport" || echo "0")
if [ "$VIEWPORT" -gt "0" ]; then
    echo "✅ Mobile viewport meta tag present"
else
    echo "⚠️  Mobile viewport meta tag missing"
fi

echo ""

# Summary
echo "============================================"
echo "Verification Complete!"
echo "============================================"
echo ""
echo "Manual checks:"
echo "  [ ] Browse scripture books"
echo "  [ ] Read verses"
echo "  [ ] Create highlight/note"
echo "  [ ] Check achievements"
echo "  [ ] Try word study"
echo "  [ ] Test on mobile device"
echo ""
echo "Production checklist:"
echo "  [ ] Custom domain configured"
echo "  [ ] Analytics enabled"
echo "  [ ] Error tracking setup"
echo "  [ ] SEO meta tags verified"
echo ""
