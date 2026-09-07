#!/bin/bash
# Deploy Web App to Vercel with Supabase
# Automated deployment script

set -e  # Exit on error

echo "=========================================="
echo "BOM Study Tools - Vercel Deployment"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Change to project root
cd "$(dirname "$0")/../.."

echo "Step 1: Checking prerequisites..."
echo ""

# Check if vercel is installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
    echo -e "${GREEN}✓ Vercel CLI installed${NC}"
else
    echo -e "${GREEN}✓ Vercel CLI installed${NC}"
fi

# Check if .env.supabase exists
if [ ! -f ".env.supabase" ]; then
    echo -e "${RED}❌ .env.supabase not found${NC}"
    echo "Please create .env.supabase with your Supabase credentials"
    echo "Get them from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api"
    exit 1
fi

echo -e "${GREEN}✓ Supabase credentials found${NC}"

echo ""
echo "Step 2: Loading Supabase environment variables..."
echo ""

# Source Supabase env vars
export $(cat .env.supabase | xargs)

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo -e "${RED}❌ NEXT_PUBLIC_SUPABASE_URL not set${NC}"
    exit 1
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo -e "${RED}❌ NEXT_PUBLIC_SUPABASE_ANON_KEY not set${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Environment variables loaded${NC}"

echo ""
echo "Step 3: Building web app..."
echo ""

cd apps/web

# Install dependencies
echo "Installing dependencies..."
npm install

# Build
echo "Building Next.js app..."
npm run build

echo -e "${GREEN}✓ Build successful${NC}"

echo ""
echo "Step 4: Deploying to Vercel..."
echo ""

# Deploy to Vercel
echo "Deploying to production..."
vercel --prod \
  --env NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
  --env NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  --yes

echo -e "\n${GREEN}✓ Deployment complete!${NC}"

echo ""
echo "=========================================="
echo "Deployment Successful! 🚀"
echo "=========================================="
echo ""
echo "Your web app is now live on Vercel!"
echo ""
echo "Next steps:"
echo ""
echo "1. Visit your deployment URL (shown above)"
echo "2. Test the application"
echo "3. Configure custom domain (optional):"
echo "   vercel domains add yourdomain.com"
echo ""
echo "4. View deployment details:"
echo "   https://vercel.com/dashboard"
echo ""
