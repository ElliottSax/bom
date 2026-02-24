#!/bin/bash
# Complete Supabase Migration - One Command
# Automates the entire migration process from Fly.io to Supabase

set -e  # Exit on error

echo "=========================================="
echo "BOM Study Tools"
echo "Complete Fly.io → Supabase Migration"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Change to project root
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

echo -e "${BLUE}This script will:${NC}"
echo "1. Install Supabase CLI"
echo "2. Initialize Supabase project"
echo "3. Create database migration from Prisma schema"
echo "4. Set up Supabase project (manual step)"
echo "5. Push schema to Supabase"
echo "6. Import scripture data"
echo "7. Update environment variables"
echo "8. Deploy web app to Vercel"
echo ""
echo -e "${YELLOW}Prerequisites:${NC}"
echo "- Node.js 18+ installed"
echo "- Supabase account (free) - https://supabase.com"
echo "- Vercel account (free) - https://vercel.com"
echo ""
read -p "Ready to begin? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Migration cancelled"
    exit 0
fi

echo ""
echo "=========================================="
echo "Phase 1: Setup"
echo "=========================================="
echo ""

# Run setup script
./scripts/supabase/setup-supabase.sh

echo ""
echo "=========================================="
echo "Phase 2: Supabase Project Creation"
echo "=========================================="
echo ""

echo -e "${YELLOW}MANUAL STEP REQUIRED${NC}"
echo ""
echo "Please create a Supabase project:"
echo ""
echo "Option A - Via Dashboard (Recommended):"
echo "1. Visit: https://supabase.com/dashboard"
echo "2. Click 'New Project'"
echo "3. Project name: bom-study-tools"
echo "4. Database Password: [save this securely!]"
echo "5. Region: Choose closest to your users"
echo "6. Click 'Create project' (takes ~2 minutes)"
echo ""
echo "Option B - Via CLI:"
echo "  supabase projects create bom-study-tools --region us-east-1"
echo ""
read -p "Press ENTER when project is created..."

echo ""
echo "=========================================="
echo "Phase 3: Link Project"
echo "=========================================="
echo ""

echo "Get your project reference ID from:"
echo "https://supabase.com/dashboard/project/YOUR_PROJECT/settings/general"
echo ""
read -p "Enter your Supabase project ref: " PROJECT_REF

if [ -z "$PROJECT_REF" ]; then
    echo -e "${RED}❌ Project ref required${NC}"
    exit 1
fi

echo ""
echo "Linking to Supabase project..."
supabase link --project-ref "$PROJECT_REF"

echo -e "${GREEN}✓ Linked to project: $PROJECT_REF${NC}"

echo ""
echo "=========================================="
echo "Phase 4: Environment Variables"
echo "=========================================="
echo ""

echo "Get your Supabase credentials from:"
echo "https://supabase.com/dashboard/project/$PROJECT_REF/settings/api"
echo ""
echo "You need:"
echo "1. Project URL (e.g., https://xxxxx.supabase.co)"
echo "2. Anon public key"
echo ""

read -p "Enter NEXT_PUBLIC_SUPABASE_URL: " SUPABASE_URL
read -p "Enter NEXT_PUBLIC_SUPABASE_ANON_KEY: " SUPABASE_ANON_KEY

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
    echo -e "${RED}❌ All credentials required${NC}"
    exit 1
fi

# Create .env.supabase
cat > .env.supabase << EOF
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_PROJECT_REF=$PROJECT_REF
EOF

echo -e "${GREEN}✓ Created .env.supabase${NC}"

# Update web app .env
cat > apps/web/.env.local << EOF
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
EOF

echo -e "${GREEN}✓ Updated apps/web/.env.local${NC}"

# Update mobile app .env
cat > apps/mobile/.env << EOF
# Supabase Configuration
SUPABASE_URL=$SUPABASE_URL
SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
EOF

echo -e "${GREEN}✓ Updated apps/mobile/.env${NC}"

echo ""
echo "=========================================="
echo "Phase 5: Database Migration"
echo "=========================================="
echo ""

./scripts/supabase/migrate-to-supabase.sh

echo ""
echo "=========================================="
echo "Phase 6: Data Import"
echo "=========================================="
echo ""

echo -e "${YELLOW}Scripture data needs to be imported${NC}"
echo ""
echo "If you have existing scripture data:"
read -p "Import scripture data now? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ -f "scripts/supabase/import-data-to-supabase.sh" ]; then
        ./scripts/supabase/import-data-to-supabase.sh
    else
        echo -e "${YELLOW}⚠ Import script not found${NC}"
        echo "You'll need to import scripture data manually"
    fi
else
    echo "Skipping data import"
    echo "You can import later with: ./scripts/supabase/import-data-to-supabase.sh"
fi

echo ""
echo "=========================================="
echo "Phase 7: Web App Deployment"
echo "=========================================="
echo ""

read -p "Deploy web app to Vercel now? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    ./scripts/supabase/deploy-web-vercel.sh
else
    echo "Skipping web deployment"
    echo "You can deploy later with: ./scripts/supabase/deploy-web-vercel.sh"
fi

echo ""
echo "=========================================="
echo "Migration Complete! 🎉"
echo "=========================================="
echo ""
echo -e "${GREEN}Your BOM Study Tools app is now running on Supabase!${NC}"
echo ""
echo "What was migrated:"
echo "✓ Database schema (24 tables)"
echo "✓ Row Level Security policies"
echo "✓ Database functions and triggers"
echo "✓ Scripture data (if imported)"
echo "✓ Environment variables configured"
echo "✓ Web app deployed (if selected)"
echo ""
echo "Configuration files created:"
echo "- .env.supabase"
echo "- apps/web/.env.local"
echo "- apps/mobile/.env"
echo "- supabase/config.toml"
echo "- supabase/migrations/*.sql"
echo ""
echo "Next steps:"
echo ""
echo "1. Test the web app:"
if [ -f "apps/web/.env.local" ]; then
    echo "   cd apps/web && npm run dev"
    echo "   Visit: http://localhost:3000"
fi
echo ""
echo "2. Test the mobile app:"
echo "   cd apps/mobile && npm start"
echo ""
echo "3. View your Supabase dashboard:"
echo "   https://supabase.com/dashboard/project/$PROJECT_REF"
echo ""
echo "4. Update mobile app configurations:"
echo "   - Update API endpoints to Supabase"
echo "   - Test authentication"
echo "   - Test data sync"
echo ""
echo "5. Monitor usage:"
echo "   https://supabase.com/dashboard/project/$PROJECT_REF/settings/usage"
echo ""
echo "Documentation:"
echo "- SUPABASE_MIGRATION_GUIDE.md - Complete migration guide"
echo "- supabase/README.md - Supabase-specific documentation"
echo ""
echo -e "${GREEN}Free tier limits:${NC}"
echo "- 500MB database storage"
echo "- 2GB bandwidth/month"
echo "- 50k API requests/month"
echo "- No credit card required"
echo ""
echo -e "${YELLOW}Reminder: Update any external services${NC}"
echo "- Update mobile app store configs"
echo "- Update DNS records (if using custom domain)"
echo "- Update any API documentation"
echo ""
echo "Need help? Check:"
echo "- SUPABASE_MIGRATION_GUIDE.md"
echo "- https://supabase.com/docs"
echo "- https://discord.supabase.com"
echo ""
