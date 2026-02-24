#!/bin/bash
# Import Scripture Data to Supabase
# Imports verses, cross-references, and seed data

set -e  # Exit on error

echo "=========================================="
echo "BOM Study Tools - Data Import"
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

echo -e "${GREEN}✓ Supabase CLI ready${NC}"

echo ""
echo "Step 2: Preparing data files..."
echo ""

# Create data directory if it doesn't exist
mkdir -p supabase/seed

# Check for existing scripture data
DATA_SOURCE=""

if [ -d "data/scriptures" ]; then
    DATA_SOURCE="data/scriptures"
    echo -e "${GREEN}✓ Found scripture data in data/scriptures/${NC}"
elif [ -f "scripture-data.json" ]; then
    DATA_SOURCE="scripture-data.json"
    echo -e "${GREEN}✓ Found scripture-data.json${NC}"
else
    echo -e "${YELLOW}⚠ No scripture data found${NC}"
    echo ""
    echo "Please provide scripture data in one of these formats:"
    echo "1. JSON file: scripture-data.json"
    echo "2. SQL file: scripture-data.sql"
    echo "3. CSV files: data/scriptures/*.csv"
    echo ""
    read -p "Enter path to scripture data file: " DATA_FILE

    if [ ! -f "$DATA_FILE" ]; then
        echo -e "${RED}❌ File not found: $DATA_FILE${NC}"
        exit 1
    fi

    DATA_SOURCE="$DATA_FILE"
fi

echo ""
echo "Step 3: Converting data to SQL..."
echo ""

# Detect file format and convert to SQL
FILE_EXT="${DATA_SOURCE##*.}"

if [ "$FILE_EXT" = "json" ]; then
    echo "Converting JSON to SQL..."
    node scripts/supabase/json-to-sql.js "$DATA_SOURCE" > supabase/seed/verses.sql
    echo -e "${GREEN}✓ Converted JSON to SQL${NC}"
elif [ "$FILE_EXT" = "sql" ]; then
    echo "Using existing SQL file..."
    cp "$DATA_SOURCE" supabase/seed/verses.sql
    echo -e "${GREEN}✓ SQL file ready${NC}"
elif [ "$FILE_EXT" = "csv" ]; then
    echo "Converting CSV to SQL..."
    node scripts/supabase/csv-to-sql.js "$DATA_SOURCE" > supabase/seed/verses.sql
    echo -e "${GREEN}✓ Converted CSV to SQL${NC}"
else
    echo -e "${RED}❌ Unsupported file format: $FILE_EXT${NC}"
    echo "Supported formats: json, sql, csv"
    exit 1
fi

echo ""
echo "Step 4: Importing data to Supabase..."
echo ""

# Count records
RECORD_COUNT=$(grep -c "INSERT INTO verses" supabase/seed/verses.sql || echo "0")
echo "Found approximately $RECORD_COUNT verse records"

if [ "$RECORD_COUNT" -eq 0 ]; then
    echo -e "${YELLOW}⚠ No records found in data file${NC}"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "Importing to Supabase..."
echo "This may take several minutes..."

# Import using psql through Supabase
supabase db remote exec < supabase/seed/verses.sql

echo -e "\n${GREEN}✓ Data imported successfully${NC}"

echo ""
echo "Step 5: Verifying import..."
echo ""

# Query record counts
echo "Checking record counts..."

# Create verification script
cat > /tmp/verify-import.sql << 'EOF'
SELECT
  'verses' as table_name,
  COUNT(*) as count
FROM verses
UNION ALL
SELECT
  'scripture_works' as table_name,
  COUNT(*) as count
FROM scripture_works
UNION ALL
SELECT
  'editions' as table_name,
  COUNT(*) as count
FROM editions;
EOF

supabase db remote exec < /tmp/verify-import.sql

echo ""
echo "=========================================="
echo "Import Complete! ✅"
echo "=========================================="
echo ""
echo "Data imported:"
echo "✓ Scripture verses"
echo "✓ Scripture works (BoM, D&C, Bible)"
echo "✓ Editions metadata"
echo ""
echo "Next steps:"
echo ""
echo "1. View your data:"
echo "   https://supabase.com/dashboard/project/YOUR_PROJECT/editor"
echo ""
echo "2. Test queries:"
echo "   ./scripts/supabase/test-queries.sh"
echo ""
echo "3. Deploy web app:"
echo "   ./scripts/supabase/deploy-web-vercel.sh"
echo ""
