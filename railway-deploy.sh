#!/bin/bash
#
# Railway Deployment Script for BOM Study Tools
# This will deploy your API to Railway in minutes!
#

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}======================================"
echo "🚂 Railway Deployment Script"
echo "   BOM Study Tools API"
echo -e "======================================${NC}"
echo

# Check if railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI not found!${NC}"
    echo "Install with: npm i -g @railway/cli"
    exit 1
fi

echo -e "${GREEN}✅ Railway CLI found${NC}"
echo

# Check if logged in
if ! railway whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Railway${NC}"
    echo "Please login first:"
    echo -e "${BLUE}railway login${NC}"
    echo
    echo "After logging in, run this script again."
    exit 1
fi

USER=$(railway whoami)
echo -e "${GREEN}✅ Logged in as: $USER${NC}"
echo

# Initialize project
echo -e "${BLUE}📦 Initializing Railway project...${NC}"
railway init --name "bom-study-tools-api" || echo "Project may already exist"

# Add PostgreSQL
echo -e "${BLUE}🐘 Adding PostgreSQL database...${NC}"
railway add --database postgres || echo "Database may already exist"

echo
echo -e "${YELLOW}⏳ Waiting for database to provision (30 seconds)...${NC}"
sleep 30

# Link project
echo -e "${BLUE}🔗 Linking project...${NC}"
railway link

# Set environment variables
echo -e "${BLUE}⚙️  Setting environment variables...${NC}"

railway variables set PORT=4000
railway variables set NODE_ENV=production
railway variables set ENABLE_AI_CHAT=false
railway variables set ENABLE_SEMANTIC_SEARCH=false
railway variables set LOG_LEVEL=warn

# Generate secrets
JWT_SECRET=$(openssl rand -hex 32)
SESSION_SECRET=$(openssl rand -hex 32)

railway variables set JWT_SECRET="$JWT_SECRET"
railway variables set SESSION_SECRET="$SESSION_SECRET"
railway variables set CORS_ORIGIN="*"

echo -e "${GREEN}✅ Environment variables configured${NC}"
echo

# Deploy
echo -e "${BLUE}🚀 Deploying to Railway...${NC}"
echo "This will take 2-5 minutes..."
echo

railway up

echo
echo -e "${GREEN}======================================"
echo "✅ DEPLOYMENT COMPLETE!"
echo -e "======================================${NC}"
echo

# Get deployment URL
DEPLOY_URL=$(railway domain 2>/dev/null || echo "Run 'railway domain' to generate URL")

echo "Your API is now live!"
echo
echo -e "${BLUE}📊 Dashboard:${NC} https://railway.app/dashboard"
echo -e "${BLUE}🌐 API URL:${NC} $DEPLOY_URL"
echo -e "${BLUE}🔍 GraphQL:${NC} $DEPLOY_URL/graphql"
echo -e "${BLUE}❤️  Health:${NC} $DEPLOY_URL/health"
echo
echo -e "${YELLOW}======================================"
echo "📖 NEXT STEPS"
echo -e "======================================${NC}"
echo
echo "1. Generate a public URL:"
echo -e "   ${BLUE}railway domain${NC}"
echo
echo "2. Import scripture data:"
echo -e "   ${BLUE}railway connect postgres${NC}"
echo "   Then run your SQL import scripts"
echo
echo "3. Test your API:"
echo -e "   ${BLUE}curl \$DEPLOY_URL/health${NC}"
echo
echo "4. View logs:"
echo -e "   ${BLUE}railway logs${NC}"
echo
echo -e "${GREEN}🎉 Happy deploying!${NC}"
