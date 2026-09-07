#!/bin/bash
# Migrate Database to Supabase
# Pushes schema and data to Supabase cloud

set -e  # Exit on error

echo "=========================================="
echo "BOM Study Tools - Database Migration"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Change to project root
cd "$(dirname "$0")/../.."

echo "Step 1: Checking Supabase connection..."
echo ""

# Check if supabase is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI not installed${NC}"
    echo "Run: ./scripts/supabase/setup-supabase.sh"
    exit 1
fi

# Check if linked to project
if [ ! -f ".git/config" ]; then
    echo -e "${YELLOW}⚠ Not linked to Supabase project${NC}"
    echo "Run: supabase link --project-ref YOUR_PROJECT_REF"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo -e "${GREEN}✓ Supabase CLI ready${NC}"

echo ""
echo "Step 2: Checking migrations..."
echo ""

# Check if migrations exist
if [ ! -d "supabase/migrations" ] || [ -z "$(ls -A supabase/migrations)" ]; then
    echo -e "${YELLOW}⚠ No migrations found${NC}"
    echo "Creating migration from Prisma schema..."
    node scripts/supabase/convert-prisma-to-sql.js
fi

MIGRATION_COUNT=$(ls -1 supabase/migrations/*.sql 2>/dev/null | wc -l)
echo -e "${GREEN}✓ Found $MIGRATION_COUNT migration file(s)${NC}"

echo ""
echo "Step 3: Pushing schema to Supabase..."
echo ""

# Push migrations to Supabase
echo "This will create all tables, indexes, and RLS policies..."
read -p "Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Migration cancelled"
    exit 0
fi

echo ""
echo "Applying migrations..."
supabase db push

echo -e "\n${GREEN}✓ Schema pushed to Supabase${NC}"

echo ""
echo "Step 4: Verifying schema..."
echo ""

# List tables
echo "Tables created:"
supabase db remote list

echo ""
echo "Step 5: Setting up seed data..."
echo ""

# Check if seed file exists
if [ -f "supabase/seed.sql" ]; then
    echo "Applying seed data..."
    supabase db seed
    echo -e "${GREEN}✓ Seed data applied${NC}"
else
    echo -e "${YELLOW}⚠ No seed.sql file found${NC}"
    echo "Scripture data will need to be imported separately"
fi

echo ""
echo "=========================================="
echo "Migration Complete! ✅"
echo "=========================================="
echo ""
echo "Your database is now on Supabase!"
echo ""
echo "Next steps:"
echo ""
echo "1. Import scripture data:"
echo -e "   ${YELLOW}./scripts/supabase/import-data-to-supabase.sh${NC}"
echo ""
echo "2. Update environment variables:"
echo -e "   ${YELLOW}./scripts/supabase/update-env-vars.sh${NC}"
echo ""
echo "3. Test the connection:"
echo -e "   ${YELLOW}./scripts/supabase/test-connection.sh${NC}"
echo ""
echo "4. View your database:"
echo "   https://supabase.com/dashboard/project/YOUR_PROJECT/editor"
echo ""
