#!/bin/bash
# Supabase Setup Script
# Sets up Supabase CLI and initializes project

set -e  # Exit on error

echo "=========================================="
echo "BOM Study Tools - Supabase Setup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Change to project root
cd "$(dirname "$0")/../.."

echo "Step 1: Checking prerequisites..."
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js 18+ required. Current: $(node -v)${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v) installed${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm $(npm -v) installed${NC}"

echo ""
echo "Step 2: Installing Supabase CLI..."
echo ""

# Check if Supabase CLI is already installed
if command -v supabase &> /dev/null; then
    SUPABASE_VERSION=$(supabase --version)
    echo -e "${GREEN}✓ Supabase CLI already installed: $SUPABASE_VERSION${NC}"
else
    echo "Installing Supabase CLI globally..."
    npm install -g supabase
    echo -e "${GREEN}✓ Supabase CLI installed${NC}"
fi

echo ""
echo "Step 3: Initializing Supabase project..."
echo ""

# Check if already initialized
if [ -d "supabase" ]; then
    echo -e "${YELLOW}⚠ Supabase already initialized (supabase/ directory exists)${NC}"
    read -p "Do you want to reinitialize? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Removing existing supabase/ directory..."
        rm -rf supabase
        supabase init
        echo -e "${GREEN}✓ Supabase reinitialized${NC}"
    else
        echo "Keeping existing configuration"
    fi
else
    supabase init
    echo -e "${GREEN}✓ Supabase initialized${NC}"
fi

echo ""
echo "Step 4: Creating migration from Prisma schema..."
echo ""

# Run conversion script
if [ -f "scripts/supabase/convert-prisma-to-sql.js" ]; then
    node scripts/supabase/convert-prisma-to-sql.js
    echo -e "${GREEN}✓ Migration created from Prisma schema${NC}"
else
    echo -e "${YELLOW}⚠ Conversion script not found. Skipping...${NC}"
fi

echo ""
echo "Step 5: Creating environment variables template..."
echo ""

# Create .env.supabase template
cat > .env.supabase.example << 'EOF'
# Supabase Configuration
# Get these values from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api

# Project URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co

# Anon (public) key - safe to use in client-side code
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Service role key - NEVER expose to client, use in server-side code only
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Database connection string (optional - for direct Postgres access)
SUPABASE_DB_URL=postgresql://postgres:your-password@db.your-project-ref.supabase.co:5432/postgres

# Project Reference ID (from dashboard)
SUPABASE_PROJECT_REF=your-project-ref
EOF

echo -e "${GREEN}✓ Created .env.supabase.example${NC}"

echo ""
echo "=========================================="
echo "Setup Complete! ✅"
echo "=========================================="
echo ""
echo "Next Steps:"
echo ""
echo "1. Create a Supabase project:"
echo -e "   ${YELLOW}Visit https://supabase.com/dashboard${NC}"
echo "   OR run: supabase projects create bom-study-tools"
echo ""
echo "2. Link your local project:"
echo -e "   ${YELLOW}supabase link --project-ref YOUR_PROJECT_REF${NC}"
echo ""
echo "3. Copy environment variables:"
echo "   - Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api"
echo "   - Copy the values to .env.supabase"
echo ""
echo "4. Run migrations:"
echo -e "   ${YELLOW}./scripts/supabase/migrate-to-supabase.sh${NC}"
echo ""
echo "5. Start local development:"
echo -e "   ${YELLOW}supabase start${NC}"
echo ""
echo "Need help? Check SUPABASE_MIGRATION_GUIDE.md"
echo ""
