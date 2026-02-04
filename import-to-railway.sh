#!/bin/bash
#
# Import Scripture Data to Railway PostgreSQL
# Run this AFTER deploying to Railway
#

set -e

echo "======================================"
echo "📖 Import Scripture Data to Railway"
echo "======================================"
echo

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if railway CLI is available
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI not found!${NC}"
    exit 1
fi

# Get database URL
echo -e "${BLUE}🔍 Getting database connection info...${NC}"
DB_URL=$(railway variables | grep DATABASE_URL | cut -d'=' -f2-)

if [ -z "$DB_URL" ]; then
    echo -e "${RED}❌ DATABASE_URL not found!${NC}"
    echo "Make sure you've deployed and added PostgreSQL"
    exit 1
fi

echo -e "${GREEN}✅ Database URL found${NC}"
echo

# Check for migration files
MIGRATION_DIR="services/api/prisma/migrations"

if [ ! -d "$MIGRATION_DIR" ]; then
    echo -e "${RED}❌ Migration directory not found: $MIGRATION_DIR${NC}"
    exit 1
fi

echo -e "${BLUE}📁 Found migration files:${NC}"
find "$MIGRATION_DIR" -name "*.sql" | head -5
echo

# Option 1: Interactive import via railway connect
echo -e "${YELLOW}======================================"
echo "Option 1: Interactive Import"
echo -e "======================================${NC}"
echo
echo "This will open a PostgreSQL shell where you can run commands:"
echo
echo -e "${BLUE}railway connect postgres${NC}"
echo
echo "Then run these commands in the PostgreSQL shell:"
echo
echo -e "${GREEN}  \\i services/api/prisma/migrations/001_init_complete/migration.sql${NC}"
echo -e "${GREEN}  \\i services/api/prisma/migrations/002_seed_data/seed.sql${NC}"
echo
echo "Press ENTER to open interactive shell, or Ctrl+C to see other options"
read

railway connect postgres

# If they exit the shell, show them option 2
echo
echo -e "${YELLOW}======================================"
echo "Option 2: Automated Import"
echo -e "======================================${NC}"
echo
echo "Or use psql directly:"
echo
echo -e "${BLUE}psql \"\$DATABASE_URL\" -f services/api/prisma/migrations/001_init_complete/migration.sql${NC}"
echo -e "${BLUE}psql \"\$DATABASE_URL\" -f services/api/prisma/migrations/002_seed_data/seed.sql${NC}"
echo
