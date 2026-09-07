#!/bin/bash
# BOM Study Tools - Vercel Deployment Script

set -e  # Exit on error

echo "============================================"
echo "BOM Study Tools - Vercel Deployment"
echo "============================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the project root"
    exit 1
fi

# Check Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found"
    echo "Install: npm install -g vercel"
    exit 1
fi

echo "✅ Vercel CLI found"
echo ""

# Verify Supabase credentials
if [ ! -f ".env.supabase" ]; then
    echo "⚠️  Warning: .env.supabase not found"
else
    echo "✅ Supabase credentials found"
fi

# Check if data is imported
echo ""
echo "🔍 Checking scripture data..."
SUPABASE_URL=$(grep NEXT_PUBLIC_SUPABASE_URL .env.supabase | cut -d= -f2)
SUPABASE_KEY=$(grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env.supabase | cut -d= -f2)

VERSE_COUNT=$(curl -s "${SUPABASE_URL}/rest/v1/verses?select=id&limit=0" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Prefer: count=exact" 2>/dev/null | grep -oP 'content-range: \d+-\d+/\K\d+' || echo "0")

if [ "$VERSE_COUNT" = "0" ]; then
    echo "❌ No verses found in database!"
    echo ""
    echo "Please import scripture data first:"
    echo "  1. Open: https://supabase.com/dashboard/project/pxcnvcagyvoafytwvngr/sql/new"
    echo "  2. Copy and paste: complete-import.sql"
    echo "  3. Run the SQL"
    echo ""
    read -p "Continue anyway? [y/N]: " CONTINUE
    if [[ ! $CONTINUE =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ Found $VERSE_COUNT verses in database"
fi

echo ""
echo "============================================"
echo "Ready to Deploy!"
echo "============================================"
echo ""

# Ask for deployment type
echo "Select deployment type:"
echo "  1) Preview (test deployment)"
echo "  2) Production (live deployment)"
echo ""
read -p "Choice [1]: " DEPLOY_TYPE
DEPLOY_TYPE=${DEPLOY_TYPE:-1}

cd apps/web

if [ "$DEPLOY_TYPE" = "2" ]; then
    echo ""
    echo "🚀 Deploying to PRODUCTION..."
    echo ""
    vercel --prod
else
    echo ""
    echo "🔍 Deploying to PREVIEW..."
    echo ""
    vercel
fi

echo ""
echo "============================================"
echo "✅ Deployment Complete!"
echo "============================================"
echo ""
echo "Next steps:"
echo "  1. Test the deployed URL"
echo "  2. Verify all features work"
echo "  3. Configure custom domain (optional)"
echo ""
echo "See DEPLOYMENT_GUIDE.md for more details"
echo ""
